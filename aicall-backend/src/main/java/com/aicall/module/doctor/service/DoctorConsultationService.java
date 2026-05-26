package com.aicall.module.doctor.service;

import com.aicall.common.exception.BusinessException;
import com.aicall.module.ai.service.QcService;
import com.aicall.module.ai.service.ReportGenerateService;
import com.aicall.module.consultation.entity.*;
import com.aicall.module.consultation.mapper.*;
import com.aicall.module.doctor.dto.*;
import com.aicall.module.doctor.entity.Doctor;
import com.aicall.module.doctor.mapper.DoctorMapper;
import com.aicall.module.ai.service.PreDiagnosisService;
import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.ChatMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DoctorConsultationService {
    private final ConsultationMapper consultationMapper;
    private final ConsultationDoctorMapper consultationDoctorMapper;
    private final ConsultationUploadMapper uploadMapper;
    private final ReportMapper reportMapper;
    private final QcResultMapper qcResultMapper;
    private final DoctorMapper doctorMapper;
    private final ReportGenerateService reportGenerateService;
    private final QcService qcService;
    private final PreDiagnosisService preDiagnosisService;
    private final ObjectProvider<DoctorConsultationService> selfProvider;

    public WorkbenchVO getWorkbench(Long doctorId) {
        List<ConsultationDoctor> assignments = consultationDoctorMapper.findByDoctorId(doctorId);

        int pendingReview = 0;
        int reportEditing = 0;
        int pendingQc = 0;
        List<ConsultationListItemVO> recent = new ArrayList<>();

        for (ConsultationDoctor cd : assignments) {
            Consultation c = consultationMapper.findById(cd.getConsultationId());
            if (c == null) continue;
            if (cd.getStatus() == 0 && c.getStatus() == 2) pendingReview++;
            Report r = reportMapper.findByConsultationId(c.getId());
            if (r != null) {
                if (r.getStatus() == 0) reportEditing++;
                if (r.getStatus() == 1) pendingQc++;
            }
            if (c.getStatus() == 2 || c.getStatus() == 3) {
                ConsultationListItemVO item = new ConsultationListItemVO();
                item.setConsultationId(c.getId());
                item.setPatientName(c.getPatientName());
                item.setChiefComplaint(c.getChiefComplaint());
                item.setDepartment(c.getDepartment());
                item.setStatus(c.getStatus());
                item.setCreateTime(c.getCreateTime());
                recent.add(item);
            }
        }

        recent.sort(Comparator.comparing(ConsultationListItemVO::getCreateTime).reversed());
        if (recent.size() > 5) recent = recent.subList(0, 5);

        WorkbenchVO vo = new WorkbenchVO();
        vo.setPendingReviewCount(pendingReview);
        vo.setReportEditingCount(reportEditing);
        vo.setPendingQcCount(pendingQc);
        vo.setRecentConsultations(recent);
        return vo;
    }

    public List<ConsultationListItemVO> getConsultations(Long doctorId, Integer status) {
        List<ConsultationDoctor> assignments = consultationDoctorMapper.findByDoctorId(doctorId);
        List<ConsultationListItemVO> result = new ArrayList<>();

        for (ConsultationDoctor cd : assignments) {
            Consultation c = consultationMapper.findById(cd.getConsultationId());
            if (c == null) continue;
            if (status != null && !status.equals(c.getStatus())) continue;
            if (cd.getStatus() == 2) continue;

            ConsultationListItemVO item = new ConsultationListItemVO();
            item.setConsultationId(c.getId());
            item.setPatientName(c.getPatientName());
            item.setChiefComplaint(c.getChiefComplaint());
            item.setDepartment(c.getDepartment());
            item.setStatus(c.getStatus());
            item.setCreateTime(c.getCreateTime());
            result.add(item);
        }

        result.sort(Comparator.comparing(ConsultationListItemVO::getCreateTime).reversed());
        return result;
    }

    public DoctorConsultationDetailVO getConsultationDetail(Long doctorId, Long consultationId) {
        ConsultationDoctor cd = consultationDoctorMapper.findByConsultationAndDoctor(consultationId, doctorId);
        if (cd == null) {
            throw BusinessException.fail("无权查看该会诊");
        }

        Consultation c = consultationMapper.findById(consultationId);
        if (c == null) {
            throw BusinessException.fail("会诊不存在");
        }

        DoctorConsultationDetailVO vo = new DoctorConsultationDetailVO();
        vo.setConsultationId(c.getId());
        vo.setPatientName(c.getPatientName());
        vo.setPatientAge(c.getPatientAge());
        vo.setPatientGender(c.getPatientGender() != null ? ("1".equals(c.getPatientGender()) ? "男" : "女") : null);
        vo.setChiefComplaint(c.getChiefComplaint());
        vo.setMedicalSummary(c.getMedicalSummary());
        vo.setStatus(c.getStatus());
        vo.setCreateTime(c.getCreateTime());

        List<ConsultationUpload> uploads = uploadMapper.findByConsultationId(consultationId);
        vo.setUploads(uploads.stream().map(u -> {
            DoctorConsultationDetailVO.UploadItem item = new DoctorConsultationDetailVO.UploadItem();
            item.setId(u.getId());
            item.setFileName(u.getFileName());
            item.setFileUrl(u.getFileUrl());
            item.setFileType(u.getFileType());
            item.setOcrResult(u.getOcrResult());
            return item;
        }).collect(Collectors.toList()));

        List<ChatMessage> chatMessages = preDiagnosisService.getHistory(consultationId);
        List<Map<String, String>> chatList = new ArrayList<>();
        for (ChatMessage msg : chatMessages) {
            Map<String, String> map = new HashMap<>();
            if (msg instanceof AiMessage) {
                map.put("role", "ai");
                map.put("content", ((AiMessage) msg).text());
            } else if (msg instanceof dev.langchain4j.data.message.UserMessage) {
                map.put("role", "user");
                map.put("content", msg.text());
            } else {
                map.put("role", "system");
                map.put("content", msg.text());
            }
            chatList.add(map);
        }
        vo.setChatHistory(chatList);

        Report report = reportMapper.findByConsultationId(consultationId);
        if (report != null) {
            ReportVO reportVO = new ReportVO();
            reportVO.setId(report.getId());
            reportVO.setContent(report.getContent());
            reportVO.setStatus(report.getStatus());
            if (report.getSignedBy() != null) {
                Doctor signer = doctorMapper.findById(report.getSignedBy());
                reportVO.setSignedByName(signer != null ? signer.getName() : null);
            }
            reportVO.setSignedTime(report.getSignedTime());

            QcResult qc = qcResultMapper.findByReportId(report.getId());
            if (qc != null) {
                QcResultVO qcVO = new QcResultVO();
                qcVO.setId(qc.getId());
                qcVO.setCompletenessScore(qc.getCompletenessScore());
                qcVO.setStandardScore(qc.getStandardScore());
                qcVO.setConsistencyScore(qc.getConsistencyScore());
                qcVO.setTotalScore(qc.getTotalScore());
                qcVO.setIssues(qc.getIssues());
                qcVO.setStatus(qc.getStatus());
                reportVO.setQcResult(qcVO);
            }
            vo.setReport(reportVO);
        }

        return vo;
    }

    @Transactional
    public void confirmConsultation(Long doctorId, Long consultationId) {
        ConsultationDoctor cd = consultationDoctorMapper.findByConsultationAndDoctor(consultationId, doctorId);
        if (cd == null) throw BusinessException.fail("无权操作该会诊");
        if (cd.getStatus() != 0) throw BusinessException.fail("该会诊已处理");
        consultationDoctorMapper.updateStatus(consultationId, doctorId, 1);
        consultationMapper.updateStatus(consultationId, 3);
    }

    @Transactional
    public void rejectConsultation(Long doctorId, Long consultationId) {
        ConsultationDoctor cd = consultationDoctorMapper.findByConsultationAndDoctor(consultationId, doctorId);
        if (cd == null) throw BusinessException.fail("无权操作该会诊");
        if (cd.getStatus() != 0) throw BusinessException.fail("该会诊已处理");
        consultationDoctorMapper.updateStatus(consultationId, doctorId, 2);
        consultationMapper.updateStatus(consultationId, 8);
    }

    public ReportVO generateReport(Long doctorId, Long consultationId) {
        ConsultationDoctor cd = consultationDoctorMapper.findByConsultationAndDoctor(consultationId, doctorId);
        if (cd == null || cd.getStatus() != 1) throw BusinessException.fail("无权操作该会诊");

        Consultation c = consultationMapper.findById(consultationId);
        if (c.getStatus() != 3) throw BusinessException.fail("会诊状态不正确");

        // LLM call OUTSIDE transaction — don't hold DB connection
        String reportContent = reportGenerateService.generateReport(consultationId);

        // DB operations in their own transaction via proxy (self-invocation needs proxy)
        return selfProvider.getObject().saveReportAndUpdateStatus(consultationId, reportContent);
    }

    @Transactional
    ReportVO saveReportAndUpdateStatus(Long consultationId, String reportContent) {
        Report report = new Report();
        report.setConsultationId(consultationId);
        report.setType(1);
        report.setContent(reportContent);
        report.setStatus(0);
        reportMapper.insert(report);

        consultationMapper.updateStatus(consultationId, 4);

        ReportVO vo = new ReportVO();
        vo.setId(report.getId());
        vo.setContent(reportContent);
        vo.setStatus(0);
        return vo;
    }

    public ReportVO getReport(Long doctorId, Long consultationId) {
        ConsultationDoctor cd = consultationDoctorMapper.findByConsultationAndDoctor(consultationId, doctorId);
        if (cd == null) throw BusinessException.fail("无权查看");

        Report report = reportMapper.findByConsultationId(consultationId);
        if (report == null) return null;

        ReportVO vo = new ReportVO();
        vo.setId(report.getId());
        vo.setContent(report.getContent());
        vo.setStatus(report.getStatus());
        if (report.getSignedBy() != null) {
            Doctor signer = doctorMapper.findById(report.getSignedBy());
            vo.setSignedByName(signer != null ? signer.getName() : null);
        }
        vo.setSignedTime(report.getSignedTime());

        QcResult qc = qcResultMapper.findByReportId(report.getId());
        if (qc != null) {
            QcResultVO qcVO = new QcResultVO();
            qcVO.setId(qc.getId());
            qcVO.setCompletenessScore(qc.getCompletenessScore());
            qcVO.setStandardScore(qc.getStandardScore());
            qcVO.setConsistencyScore(qc.getConsistencyScore());
            qcVO.setTotalScore(qc.getTotalScore());
            qcVO.setIssues(qc.getIssues());
            qcVO.setStatus(qc.getStatus());
            vo.setQcResult(qcVO);
        }

        return vo;
    }

    public void updateReport(Long doctorId, Long consultationId, String content) {
        ConsultationDoctor cd = consultationDoctorMapper.findByConsultationAndDoctor(consultationId, doctorId);
        if (cd == null) throw BusinessException.fail("无权操作");

        Report report = reportMapper.findByConsultationId(consultationId);
        if (report == null) throw BusinessException.fail("报告不存在");
        if (report.getStatus() != 0) throw BusinessException.fail("报告已提交，无法编辑");

        reportMapper.updateContent(report.getId(), content);
    }

    @Transactional
    public QcResultVO submitReport(Long doctorId, Long consultationId) {
        ConsultationDoctor cd = consultationDoctorMapper.findByConsultationAndDoctor(consultationId, doctorId);
        if (cd == null) throw BusinessException.fail("无权操作");

        Report report = reportMapper.findByConsultationId(consultationId);
        if (report == null) throw BusinessException.fail("报告不存在");
        if (report.getStatus() != 0) throw BusinessException.fail("报告状态不正确");

        reportMapper.updateStatus(report.getId(), 1);

        QcResult qc = qcService.checkQuality(report.getId());

        if (qc.getStatus() == 2) {
            reportMapper.updateStatus(report.getId(), 0);
        }

        QcResultVO vo = new QcResultVO();
        vo.setId(qc.getId());
        vo.setCompletenessScore(qc.getCompletenessScore());
        vo.setStandardScore(qc.getStandardScore());
        vo.setConsistencyScore(qc.getConsistencyScore());
        vo.setTotalScore(qc.getTotalScore());
        vo.setIssues(qc.getIssues());
        vo.setStatus(qc.getStatus());
        return vo;
    }

    public QcResultVO getQcResult(Long doctorId, Long consultationId) {
        ConsultationDoctor cd = consultationDoctorMapper.findByConsultationAndDoctor(consultationId, doctorId);
        if (cd == null) throw BusinessException.fail("无权查看");

        Report report = reportMapper.findByConsultationId(consultationId);
        if (report == null) return null;

        QcResult qc = qcResultMapper.findByReportId(report.getId());
        if (qc == null) return null;

        QcResultVO vo = new QcResultVO();
        vo.setId(qc.getId());
        vo.setCompletenessScore(qc.getCompletenessScore());
        vo.setStandardScore(qc.getStandardScore());
        vo.setConsistencyScore(qc.getConsistencyScore());
        vo.setTotalScore(qc.getTotalScore());
        vo.setIssues(qc.getIssues());
        vo.setStatus(qc.getStatus());
        return vo;
    }

    @Transactional
    public void signReport(Long doctorId, Long consultationId) {
        ConsultationDoctor cd = consultationDoctorMapper.findByConsultationAndDoctor(consultationId, doctorId);
        if (cd == null) throw BusinessException.fail("无权操作");

        Report report = reportMapper.findByConsultationId(consultationId);
        if (report == null) throw BusinessException.fail("报告不存在");
        if (report.getStatus() != 1) throw BusinessException.fail("报告未通过质控，无法签发");

        QcResult qc = qcResultMapper.findByReportId(report.getId());
        if (qc == null || qc.getStatus() != 1) throw BusinessException.fail("质控未通过，无法签发");

        reportMapper.updateSign(report.getId(), 2, doctorId);
        consultationMapper.updateStatus(consultationId, 5);
    }

    public DoctorProfileVO getProfile(Long doctorId) {
        Doctor doctor = doctorMapper.findById(doctorId);
        if (doctor == null) throw BusinessException.fail("医生不存在");
        DoctorProfileVO vo = new DoctorProfileVO();
        vo.setId(doctor.getId());
        vo.setName(doctor.getName());
        vo.setTitle(doctor.getTitle());
        vo.setDepartment(doctor.getDepartment());
        vo.setPhone(doctor.getPhone());
        vo.setAvatar(doctor.getAvatar());
        vo.setIntroduction(doctor.getIntroduction());
        return vo;
    }
}
