package com.aicall.module.followup.service;

import com.aicall.common.exception.BusinessException;
import com.aicall.module.consultation.entity.Consultation;
import com.aicall.module.consultation.mapper.ConsultationMapper;
import com.aicall.module.followup.dto.AnswerRequest;
import com.aicall.module.followup.dto.FollowUpVO;
import com.aicall.module.followup.entity.FollowUp;
import com.aicall.module.followup.mapper.FollowUpMapper;
import com.aicall.module.notification.service.NotificationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.langchain4j.model.chat.ChatLanguageModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FollowUpService {
    private static final String QUESTIONNAIRE_PROMPT = """
            你是一位资深临床随访专家。根据以下患者会诊信息，生成第%d天随访问卷。
            要求：使用JSON格式输出，5-8个问题。类型包括：radio(选项数组)、checkbox(选项数组)、text。
            关注：症状变化、用药情况、不良反应、生活质量。

            患者信息：
            主诉：%s
            诊断摘要：%s

            输出纯JSON数组： [{"question":"...","type":"radio","options":["A","B","C"]}, ...]
            """;

    private static final String ANALYSIS_PROMPT = """
            你是一位资深临床随访专家。分析患者第%d天随访回答，判断异常。
            异常标准：症状明显加重、出现新发症状、药物严重不良反应、主观感受显著恶化。

            问卷及回答：
            %s

            请用JSON输出：{"abnormal":true/false,"level":"正常/轻度异常/明显异常/严重异常","summary":"分析总结","suggestion":"建议"}
            只输出JSON，不要其他内容。
            """;

    private final FollowUpMapper followUpMapper;
    private final ConsultationMapper consultationMapper;
    private final NotificationService notificationService;
    private final ChatLanguageModel chatLanguageModel;
    private final ObjectMapper objectMapper;

    @Transactional
    public void createFollowUps(Long consultationId) {
        Consultation c = consultationMapper.findById(consultationId);
        if (c == null) throw BusinessException.fail("会诊不存在");

        String daysConfig = "3,7,30";
        for (String dayStr : daysConfig.split(",")) {
            int day = Integer.parseInt(dayStr.trim());
            String questionnaire = generateQuestionnaire(c.getChiefComplaint(),
                    c.getMedicalSummary(), day);

            FollowUp fu = new FollowUp();
            fu.setConsultationId(consultationId);
            fu.setPatientId(c.getPatientId());
            fu.setPlanDay(day);
            fu.setQuestionnaire(questionnaire);
            fu.setStatus(0);
            followUpMapper.insert(fu);
        }
        log.info("Created follow-up plans for consultation {}", consultationId);
    }

    private String generateQuestionnaire(String chiefComplaint, String medicalSummary, int planDay) {
        try {
            String prompt = String.format(QUESTIONNAIRE_PROMPT, planDay,
                    chiefComplaint != null ? chiefComplaint : "未提供",
                    medicalSummary != null ? medicalSummary : "未提供");
            return chatLanguageModel.generate(prompt);
        } catch (Exception e) {
            log.warn("AI questionnaire generation failed: {}", e.getMessage());
            return "[{\"question\":\"您目前感觉如何？\",\"type\":\"radio\",\"options\":[\"明显好转\",\"略有好转\",\"无明显变化\",\"有所加重\"]}]";
        }
    }

    public FollowUpVO getDetail(Long id) {
        FollowUp fu = followUpMapper.findById(id);
        if (fu == null) throw BusinessException.fail("随访记录不存在");
        return toVO(fu);
    }

    public List<FollowUpVO> getByConsultation(Long consultationId) {
        return followUpMapper.findByConsultationId(consultationId).stream()
                .map(this::toVO).collect(Collectors.toList());
    }

    public List<FollowUpVO> getPendingByPatient(Long patientId) {
        return followUpMapper.findPendingByPatientId(patientId).stream()
                .map(this::toVO).collect(Collectors.toList());
    }

    public List<FollowUpVO> getAbnormalByDoctor(Long doctorId) {
        return followUpMapper.findAbnormalByDoctorId(doctorId).stream()
                .map(this::toVO).collect(Collectors.toList());
    }

    @Transactional
    public void submitAnswer(Long id, Long patientId, AnswerRequest request) {
        FollowUp fu = followUpMapper.findById(id);
        if (fu == null) throw BusinessException.fail("随访记录不存在");
        if (!fu.getPatientId().equals(patientId)) throw BusinessException.fail("无权操作");
        if (fu.getStatus() >= 2) throw BusinessException.fail("已提交过回答");

        followUpMapper.updateAnswer(id, request.getAnswer(), LocalDateTime.now(), 2);

        new Thread(() -> {
            try { analyzeAnswer(id); } catch (Exception e) {
                log.error("AI analysis failed for follow-up {}: {}", id, e.getMessage());
            }
        }).start();
    }

    private void analyzeAnswer(Long followUpId) {
        FollowUp fu = followUpMapper.findById(followUpId);
        if (fu == null) return;

        try {
            String content = "问卷：" + fu.getQuestionnaire() + "\n回答：" + fu.getAnswer();
            String prompt = String.format(ANALYSIS_PROMPT, fu.getPlanDay(), content);
            String result = chatLanguageModel.generate(prompt);
            var node = objectMapper.readTree(result);
            boolean abnormal = node.has("abnormal") && node.get("abnormal").asBoolean();

            int status = abnormal ? 3 : 2;
            followUpMapper.updateAiAnalysis(followUpId, result, status);

            if (abnormal) {
                Consultation c = consultationMapper.findById(fu.getConsultationId());
                String patientName = c != null && c.getPatientName() != null ? c.getPatientName() : "患者";
                String level = node.has("level") ? node.get("level").asText() : "异常";
                notificationService.sendAbnormalAlert(fu.getConsultationId(), fu.getId(),
                        patientName, level);
            }
        } catch (Exception e) {
            log.error("AI analysis error for follow-up {}: {}", followUpId, e.getMessage());
        }
    }

    public void sendDueFollowUps() {
        List<FollowUp> dueList = followUpMapper.findDueByDate(java.time.LocalDate.now());
        for (FollowUp fu : dueList) {
            followUpMapper.updateStatus(fu.getId(), 1, LocalDateTime.now());
            notificationService.sendFollowUpNotification(fu);
        }
        log.info("Sent {} due follow-up notifications", dueList.size());
    }

    private FollowUpVO toVO(FollowUp fu) {
        FollowUpVO vo = new FollowUpVO();
        vo.setId(fu.getId());
        vo.setConsultationId(fu.getConsultationId());
        vo.setPlanDay(fu.getPlanDay());
        vo.setQuestionnaire(fu.getQuestionnaire());
        vo.setAnswer(fu.getAnswer());
        vo.setAiAnalysis(fu.getAiAnalysis());
        vo.setStatus(fu.getStatus());
        vo.setSendTime(fu.getSendTime());
        vo.setAnswerTime(fu.getAnswerTime());
        vo.setCreateTime(fu.getCreateTime());
        vo.setConsultationNo(fu.getConsultationNo());
        vo.setPatientName(fu.getPatientName());
        return vo;
    }
}
