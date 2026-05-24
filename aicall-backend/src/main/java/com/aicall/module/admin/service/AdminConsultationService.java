package com.aicall.module.admin.service;

import com.aicall.common.exception.BusinessException;
import com.aicall.module.admin.dto.AdminAssignDoctorsRequest;
import com.aicall.module.admin.dto.AdminConsultationCancelRequest;
import com.aicall.module.admin.dto.AdminConsultationDetailVO;
import com.aicall.module.admin.dto.AdminConsultationListItemVO;
import com.aicall.module.common.dto.PageResult;
import com.aicall.module.consultation.entity.Consultation;
import com.aicall.module.consultation.entity.ConsultationDoctor;
import com.aicall.module.consultation.entity.ConsultationUpload;
import com.aicall.module.consultation.mapper.ConsultationDoctorMapper;
import com.aicall.module.consultation.mapper.ConsultationMapper;
import com.aicall.module.consultation.mapper.ConsultationUploadMapper;
import com.aicall.module.doctor.entity.Doctor;
import com.aicall.module.doctor.mapper.DoctorMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminConsultationService {
    private final ConsultationMapper consultationMapper;
    private final ConsultationDoctorMapper consultationDoctorMapper;
    private final ConsultationUploadMapper uploadMapper;
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