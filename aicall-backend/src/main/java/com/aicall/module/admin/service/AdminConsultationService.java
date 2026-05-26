package com.aicall.module.admin.service;

import com.aicall.common.exception.BusinessException;
import com.aicall.module.admin.dto.AdminAssignDoctorsRequest;
import com.aicall.module.admin.dto.AdminConsultationCancelRequest;
import com.aicall.module.admin.dto.AdminConsultationDetailVO;
import com.aicall.module.admin.dto.AdminConsultationListItemVO;
import com.aicall.module.admin.dto.TimelineItemVO;
import com.aicall.module.common.dto.PageResult;
import com.aicall.module.consultation.entity.Consultation;
import com.aicall.module.consultation.entity.ConsultationDoctor;
import com.aicall.module.consultation.entity.ConsultationUpload;
import com.aicall.module.consultation.entity.Report;
import com.aicall.module.consultation.mapper.ConsultationDoctorMapper;
import com.aicall.module.consultation.mapper.ConsultationMapper;
import com.aicall.module.consultation.mapper.ConsultationUploadMapper;
import com.aicall.module.consultation.mapper.ReportMapper;
import com.aicall.module.doctor.entity.Doctor;
import com.aicall.module.doctor.mapper.DoctorMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminConsultationService {
    private final ConsultationMapper consultationMapper;
    private final ConsultationDoctorMapper consultationDoctorMapper;
    private final ConsultationUploadMapper uploadMapper;
    private final ReportMapper reportMapper;
    private final DoctorMapper doctorMapper;

    public PageResult<AdminConsultationListItemVO> getConsultations(Integer status, String keyword, Integer page, Integer size) {
        int currentPage = page == null || page < 1 ? 1 : page;
        int pageSize = size == null || size < 1 ? 10 : size;
        int offset = (currentPage - 1) * pageSize;
        List<Consultation> consultations = consultationMapper.findAdminPage(status, keyword, offset, pageSize);
        long total = consultationMapper.countAdminPage(status, keyword);
        List<AdminConsultationListItemVO> list = consultations.stream().map(this::toListItem).toList();
        return PageResult.of(list, total, currentPage, pageSize);
    }

    public AdminConsultationDetailVO getConsultationDetail(Long id) {
        Consultation c = consultationMapper.findById(id);
        if (c == null) {
            throw BusinessException.fail("会诊不存在");
        }
        AdminConsultationDetailVO detail = new AdminConsultationDetailVO();
        detail.setId(c.getId());
        detail.setConsultationNo(c.getConsultationNo());
        detail.setPatientName(c.getPatientName());
        detail.setPatientAge(c.getPatientAge());
        detail.setPatientGender(c.getPatientGender() != null ? ("1".equals(c.getPatientGender()) ? "男" : "女") : null);
        detail.setType(c.getType());
        detail.setStatus(c.getStatus());
        detail.setDepartment(c.getDepartment());
        detail.setChiefComplaint(c.getChiefComplaint());
        detail.setMedicalSummary(c.getMedicalSummary());
        detail.setFee(c.getFee());
        detail.setPaymentStatus(c.getPaymentStatus());
        detail.setScheduledTime(c.getScheduledTime());
        detail.setEndTime(c.getEndTime());
        detail.setCancelReason(c.getCancelReason());
        detail.setCreateTime(c.getCreateTime());
        detail.setMinutes(c.getMinutes());

        // Populate report info
        Report report = reportMapper.findByConsultationId(id);
        if (report != null) {
            AdminConsultationDetailVO.ReportVO rvo = new AdminConsultationDetailVO.ReportVO();
            rvo.setId(report.getId());
            rvo.setContent(report.getContent());
            rvo.setStatus(report.getStatus());
            if (report.getSignedBy() != null) {
                Doctor signer = doctorMapper.findById(report.getSignedBy());
                rvo.setSignedByName(signer != null ? signer.getName() : null);
            }
            rvo.setSignedTime(report.getSignedTime() != null
                    ? report.getSignedTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")) : null);
            detail.setReport(rvo);
        }

        List<ConsultationDoctor> assignments = consultationDoctorMapper.findByConsultationId(id);
        detail.setAssignedDoctors(assignments.stream().map(cd -> {
            Doctor doctor = doctorMapper.findById(cd.getDoctorId());
            AdminConsultationDetailVO.AssignedDoctorVO vo = new AdminConsultationDetailVO.AssignedDoctorVO();
            vo.setDoctorId(cd.getDoctorId());
            vo.setName(doctor != null ? doctor.getName() : null);
            vo.setTitle(doctor != null ? doctor.getTitle() : null);
            vo.setDepartment(doctor != null ? doctor.getDepartment() : null);
            vo.setRole(cd.getRole());
            vo.setConfirmStatus(cd.getStatus());
            return vo;
        }).toList());

        List<ConsultationUpload> uploads = uploadMapper.findByConsultationId(id);
        detail.setUploads(uploads.stream().map(u -> {
            AdminConsultationDetailVO.UploadItemVO vo = new AdminConsultationDetailVO.UploadItemVO();
            vo.setId(u.getId());
            vo.setFileName(u.getFileName());
            vo.setFileUrl(u.getFileUrl());
            vo.setFileType(u.getFileType());
            vo.setOcrResult(u.getOcrResult());
            return vo;
        }).toList());

        return detail;
    }

    @Transactional
    public void assignDoctors(Long id, AdminAssignDoctorsRequest request) {
        Consultation c = consultationMapper.findById(id);
        if (c == null) {
            throw BusinessException.fail("会诊不存在");
        }
        consultationDoctorMapper.deleteByConsultationId(id);
        for (AdminAssignDoctorsRequest.DoctorAssignment assignment : request.getDoctors()) {
            consultationDoctorMapper.insert(id, assignment.getDoctorId(),
                    assignment.getRole() != null ? assignment.getRole() : 0);
        }
        if (c.getStatus() != null && c.getStatus() < 2) {
            consultationMapper.updateStatus(id, 2);
        }
    }

    @Transactional
    public void cancelConsultation(Long id, String reason) {
        Consultation c = consultationMapper.findById(id);
        if (c == null) {
            throw BusinessException.fail("会诊不存在");
        }
        consultationMapper.updateCancel(id, 7, reason);
    }

    public List<TimelineItemVO> getTimeline(Long consultationId) {
        Consultation c = consultationMapper.findById(consultationId);
        if (c == null) {
            throw BusinessException.fail("会诊不存在");
        }

        List<TimelineItemVO> timeline = new ArrayList<>();

        // Status 0: Patient submitted
        timeline.add(item(0, "患者提交", c.getCreateTime(), c.getPatientName()));

        // Status 1: AI summary generated
        if (c.getMedicalSummary() != null) {
            timeline.add(item(1, "AI资料审核完成", null, "系统"));
        }

        // Status 2 + 3: Admin assigned doctors + doctor confirmed/rejected
        List<ConsultationDoctor> doctors = consultationDoctorMapper.findByConsultationId(consultationId);
        if (!doctors.isEmpty()) {
            timeline.add(item(2, "管理员分配医生", null, "管理员"));
        }
        for (ConsultationDoctor cd : doctors) {
            Doctor d = doctorMapper.findById(cd.getDoctorId());
            String name = d != null ? d.getName() : String.valueOf(cd.getDoctorId());
            if (cd.getStatus() != null && cd.getStatus() == 1) {
                timeline.add(item(3, "医生" + name + "确认接诊", cd.getConfirmTime(), name));
            } else if (cd.getStatus() != null && cd.getStatus() == 2) {
                timeline.add(item(3, "医生" + name + "拒绝接诊", cd.getConfirmTime(), name));
            }
        }

        // Status 4: AI report generated + Status 5: Signed
        Report report = reportMapper.findByConsultationId(consultationId);
        if (report != null) {
            timeline.add(item(4, "AI报告生成", report.getCreateTime(), "系统"));
            if (report.getStatus() != null && report.getStatus() >= 2 && report.getSignedTime() != null) {
                Doctor signer = doctorMapper.findById(report.getSignedBy());
                timeline.add(item(5, "报告签发", report.getSignedTime(), signer != null ? signer.getName() : ""));
            }
        }

        // Status 6: Completed
        if (c.getStatus() != null && c.getStatus() >= 6 && c.getEndTime() != null) {
            timeline.add(item(6, "会诊完成", c.getEndTime(), "系统"));
        }

        // Status 7: Cancelled
        if (c.getStatus() != null && c.getStatus() == 7) {
            timeline.add(item(7, "已取消：" + (c.getCancelReason() != null ? c.getCancelReason() : ""), c.getUpdateTime(), "管理员"));
        }

        return timeline;
    }

    private TimelineItemVO item(int status, String label, java.time.LocalDateTime time, String operator) {
        TimelineItemVO vo = new TimelineItemVO();
        vo.setStatus(status);
        vo.setLabel(label);
        vo.setTime(time != null ? time.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")) : null);
        vo.setOperator(operator);
        return vo;
    }

    private AdminConsultationListItemVO toListItem(Consultation c) {
        AdminConsultationListItemVO item = new AdminConsultationListItemVO();
        item.setId(c.getId());
        item.setConsultationNo(c.getConsultationNo());
        item.setPatientName(c.getPatientName());
        item.setDepartment(c.getDepartment());
        item.setStatus(c.getStatus());
        item.setFee(c.getFee());
        item.setPaymentStatus(c.getPaymentStatus());
        item.setCreateTime(c.getCreateTime());
        return item;
    }
}