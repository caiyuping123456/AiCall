package com.aicall.module.user.service;

import com.aicall.common.exception.BusinessException;
import com.aicall.module.ai.service.SummaryService;
import com.aicall.module.consultation.entity.Consultation;
import com.aicall.module.consultation.mapper.ConsultationDoctorMapper;
import com.aicall.module.consultation.mapper.ConsultationMapper;
import com.aicall.module.doctor.entity.Doctor;
import com.aicall.module.doctor.mapper.DoctorMapper;
import com.aicall.module.notification.service.NotificationService;
import com.aicall.module.user.dto.RegistrationRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@Service
@RequiredArgsConstructor
public class RegistrationService {
    private static final BigDecimal SINGLE_FEE = new BigDecimal("500.00");

    private final ConsultationMapper consultationMapper;
    private final ConsultationDoctorMapper consultationDoctorMapper;
    private final DoctorMapper doctorMapper;
    private final NotificationService notificationService;
    private final SummaryService summaryService;

    @Transactional
    public Long register(Long patientId, RegistrationRequest request) {
        Doctor doctor = doctorMapper.findById(request.getDoctorId());
        if (doctor == null || doctor.getStatus() != 1) {
            throw BusinessException.fail("医生不存在或已停诊");
        }

        // Check duplicate booking: same patient + same doctor on the same day (excluding cancelled/returned)
        int duplicateCount = consultationMapper.countByPatientDoctorToday(patientId, request.getDoctorId());
        if (duplicateCount > 0) {
            throw BusinessException.fail("您今天已经预约过该医生（" + doctor.getName() + "），请选择其他医生或明天再试");
        }

        String dept = request.getDepartment() != null ? request.getDepartment() : doctor.getDepartment();
        Consultation c = new Consultation();
        c.setConsultationNo(generateConsultationNo());
        c.setPatientId(patientId);
        c.setType(1);
        c.setStatus(0);
        c.setChiefComplaint(request.getChiefComplaint());
        c.setDepartment(dept);
        c.setFee(SINGLE_FEE);
        c.setPaymentStatus(0);
        consultationMapper.insert(c);

        consultationDoctorMapper.insert(c.getId(), doctor.getId(), 0);

        // Auto-generate AI summary from chief complaint
        try {
            String content = "主诉：" + request.getChiefComplaint();
            String summary = summaryService.generateSummary(content);
            consultationMapper.updateMedicalSummary(c.getId(), summary);
            consultationMapper.updateStatus(c.getId(), 1);
        } catch (Exception e) {
            log.error("Auto summary generation failed for consultation {}: {}", c.getId(), e.getMessage());
            // Still proceed - doctor can trigger summary later
        }

        notificationService.send(2, doctor.getId(), "新挂号通知",
                "您有一个新的会诊挂号，患者主诉：" + request.getChiefComplaint(), List.of(2));

        return c.getId();
    }

    private String generateConsultationNo() {
        return "MDT" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"))
                + ThreadLocalRandom.current().nextInt(1000, 9999);
    }
}