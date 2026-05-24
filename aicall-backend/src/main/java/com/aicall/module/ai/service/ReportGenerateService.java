package com.aicall.module.ai.service;

import com.aicall.module.consultation.entity.Consultation;
import com.aicall.module.consultation.entity.ConsultationUpload;
import com.aicall.module.consultation.entity.ReportTemplate;
import com.aicall.module.consultation.mapper.ConsultationMapper;
import com.aicall.module.consultation.mapper.ConsultationUploadMapper;
import com.aicall.module.consultation.mapper.ReportTemplateMapper;
import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.model.chat.ChatLanguageModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportGenerateService {
    private final ChatLanguageModel chatLanguageModel;
    private final ConsultationMapper consultationMapper;
    private final ConsultationUploadMapper uploadMapper;
    private final ReportTemplateMapper reportTemplateMapper;
    private final PreDiagnosisService preDiagnosisService;

    public String generateReport(Long consultationId) {
        Consultation c = consultationMapper.findById(consultationId);
        if (c == null) {
            throw new IllegalArgumentException("会诊不存在");
        }

        ReportTemplate template = reportTemplateMapper.findByDepartment(c.getDepartment());
        String templateContent = "";
        if (template != null) {
            templateContent = template.getContentTemplate();
        }

        List<ConsultationUpload> uploads = uploadMapper.findByConsultationId(consultationId);
        StringBuilder uploadInfo = new StringBuilder();
        for (ConsultationUpload u : uploads) {
            if (u.getOcrResult() != null && !u.getOcrResult().isEmpty()) {
                uploadInfo.append("- ").append(u.getOcrResult()).append("\n");
            }
        }

        List<ChatMessage> chatMessages = preDiagnosisService.getHistory(consultationId);
        StringBuilder chatInfo = new StringBuilder();
        for (ChatMessage msg : chatMessages) {
            if (msg instanceof AiMessage) {
                chatInfo.append("AI: ").append(((AiMessage) msg).text()).append("\n");
            } else {
                chatInfo.append("患者: ").append(msg.text()).append("\n");
            }
        }

        String prompt = """
            你是一位专业的会诊报告撰写助手。请根据以下患者信息和会诊记录，生成一份结构化的专业会诊报告。

            ## 患者主诉
            %s

            ## 病情摘要
            %s

            ## 检查资料
            %s

            ## AI预问诊记录
            %s

            ## 报告模板
            %s

            请严格按照以下JSON格式输出报告，不要输出其他内容：
            {
              "chiefComplaint": "主诉",
              "presentIllness": "现病史",
              "pastHistory": "既往史",
              "examinationFindings": "检查所见",
              "diagnosis": "诊断意见",
              "analysis": "分析说明",
              "recommendation": "建议",
              "followUp": "随访建议"
            }
            """.formatted(
                c.getChiefComplaint() != null ? c.getChiefComplaint() : "",
                c.getMedicalSummary() != null ? c.getMedicalSummary() : "",
                uploadInfo.length() > 0 ? uploadInfo.toString() : "无",
                chatInfo.length() > 0 ? chatInfo.toString() : "无",
                templateContent.isEmpty() ? "标准会诊报告模板" : templateContent
            );

        log.info("Generating report for consultation {}", consultationId);
        return chatLanguageModel.generate(prompt);
    }
}
