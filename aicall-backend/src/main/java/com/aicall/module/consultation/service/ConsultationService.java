package com.aicall.module.consultation.service;

import com.aicall.common.exception.BusinessException;
import com.aicall.module.ai.service.EmbeddingService;
import com.aicall.module.ai.service.OcrService;
import com.aicall.module.ai.service.PreDiagnosisService;
import com.aicall.module.ai.service.SummaryService;
import com.aicall.module.consultation.dto.*;
import com.aicall.module.consultation.entity.Consultation;
import com.aicall.module.consultation.entity.ConsultationUpload;
import com.aicall.module.consultation.entity.Report;
import com.aicall.module.consultation.mapper.ConsultationDoctorMapper;
import com.aicall.module.consultation.mapper.ConsultationMapper;
import com.aicall.module.consultation.mapper.ConsultationUploadMapper;
import com.aicall.module.consultation.mapper.ReportMapper;
import com.aicall.module.doctor.mapper.DoctorMapper;
import com.aicall.module.doctor.entity.Doctor;
import com.aicall.module.payment.entity.PaymentOrder;
import com.aicall.module.payment.mapper.PaymentOrderMapper;
import com.aicall.infrastructure.storage.MinioStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConsultationService {
    private static final BigDecimal SINGLE_FEE = new BigDecimal("500.00");
    private static final BigDecimal MDT_FEE = new BigDecimal("1500.00");

    private final ConsultationMapper consultationMapper;
    private final ConsultationUploadMapper consultationUploadMapper;
    private final ConsultationDoctorMapper consultationDoctorMapper;
    private final ReportMapper reportMapper;
    private final DoctorMapper doctorMapper;
    private final PaymentOrderMapper paymentOrderMapper;
    private final PreDiagnosisService preDiagnosisService;
    private final SummaryService summaryService;
    private final OcrService ocrService;
    private final EmbeddingService embeddingService;
    private final MinioStorageService minioStorageService;

    public Long createDraft(Long patientId, CreateDraftRequest request) {
        Consultation c = new Consultation();
        c.setConsultationNo(generateConsultationNo());
        c.setPatientId(patientId);
        c.setType(0);
        c.setStatus(0);
        c.setChiefComplaint(request.getChiefComplaint());
        c.setDepartment(request.getDepartment());
        c.setPaymentStatus(0);
        consultationMapper.insert(c);
        return c.getId();
    }

    public ChatResponse chat(Long consultationId, String message) {
        verifyOwnership(consultationId);
        return preDiagnosisService.chat(consultationId, message);
    }

    public String formSubmit(Long consultationId, FormSubmitRequest request) {
        verifyOwnership(consultationId);
        StringBuilder content = new StringBuilder();
        content.append("主诉：").append(request.getChiefComplaint()).append("\n");
        if (request.getOnsetTime() != null) {
            content.append("起病时间：").append(request.getOnsetTime()).append("\n");
        }
        if (request.getSymptomDescription() != null) {
            content.append("症状描述：").append(request.getSymptomDescription()).append("\n");
        }
        if (request.getPastHistory() != null) {
            content.append("既往史：").append(request.getPastHistory()).append("\n");
        }
        if (request.getAllergyHistory() != null) {
            content.append("过敏史：").append(request.getAllergyHistory()).append("\n");
        }
        String summary = summaryService.generateSummary(content.toString());
        consultationMapper.updateMedicalSummary(consultationId, summary);
        consultationMapper.updateStatus(consultationId, 1);
        return summary;
    }

    public String generateSummaryFromChat(Long consultationId) {
        verifyOwnership(consultationId);
        String conversation = preDiagnosisService.getFullConversation(consultationId);
        if (conversation.isBlank()) {
            throw BusinessException.fail("暂无对话记录，无法生成摘要");
        }
        String summary = summaryService.generateSummary(conversation);
        consultationMapper.updateMedicalSummary(consultationId, summary);
        consultationMapper.updateStatus(consultationId, 1);
        return summary;
    }

    public String getSummary(Long consultationId) {
        Consultation c = consultationMapper.findById(consultationId);
        if (c == null) throw BusinessException.fail("会诊不存在");
        return c.getMedicalSummary();
    }

    public void updateSummary(Long consultationId, SummaryUpdateRequest request) {
        verifyOwnership(consultationId);
        consultationMapper.updateMedicalSummary(consultationId, request.getMedicalSummary());
    }

    public ConsultationUpload uploadFile(Long consultationId, MultipartFile file, Integer fileType) {
        verifyOwnership(consultationId);
        try {
            String originalFilename = file.getOriginalFilename();
            String ext = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".png";
            String objectName = "consultation/" + consultationId + "/" + UUID.randomUUID() + ext;

            InputStream is = file.getInputStream();
            String fileUrl = minioStorageService.upload(objectName, is, file.getContentType(), file.getSize());

            ConsultationUpload upload = new ConsultationUpload();
            upload.setConsultationId(consultationId);
            upload.setFileName(originalFilename);
            upload.setFileType(fileType);
            upload.setFileUrl(fileUrl);
            upload.setFileSize(file.getSize());
            consultationUploadMapper.insert(upload);

            new Thread(() -> {
                try {
                    String base64 = java.util.Base64.getEncoder().encodeToString(file.getBytes());
                    String ocrResult = ocrService.recognize(base64);
                    consultationUploadMapper.updateOcrResult(upload.getId(), ocrResult);
                    embeddingService.storeDocument(consultationId, upload.getId(), ocrResult);
                } catch (Exception e) {
                    log.error("OCR failed for upload {}: {}", upload.getId(), e.getMessage());
                }
            }).start();

            return upload;
        } catch (Exception e) {
            throw BusinessException.fail("文件上传失败: " + e.getMessage());
        }
    }

    public List<ConsultationUpload> getUploads(Long consultationId) {
        return consultationUploadMapper.findByConsultationId(consultationId);
    }

    public void deleteUpload(Long consultationId, Long uploadId) {
        verifyOwnership(consultationId);
        ConsultationUpload upload = consultationUploadMapper.findById(uploadId);
        if (upload == null || !upload.getConsultationId().equals(consultationId)) {
            throw BusinessException.fail("上传记录不存在");
        }
        consultationUploadMapper.deleteById(uploadId);
    }

    public BigDecimal calculateFee(Long consultationId, FeeCalculateRequest request) {
        verifyOwnership(consultationId);
        BigDecimal fee = request.getType() == 2 ? MDT_FEE : SINGLE_FEE;
        consultationMapper.updateTypeAndFee(consultationId, request.getType(), fee);
        return fee;
    }

    public void pay(Long consultationId) {
        Consultation c = consultationMapper.findById(consultationId);
        if (c == null) throw BusinessException.fail("会诊不存在");
        if (c.getPaymentStatus() == 1) throw BusinessException.fail("已支付，请勿重复操作");
        if (c.getFee() == null) throw BusinessException.fail("请先选择会诊类型并计算费用");

        PaymentOrder order = new PaymentOrder();
        order.setOrderNo("PAY" + System.currentTimeMillis() + ThreadLocalRandom.current().nextInt(1000, 9999));
        order.setConsultationId(consultationId);
        order.setAmount(c.getFee());
        order.setStatus(1);
        order.setPayTime(LocalDateTime.now());
        paymentOrderMapper.insert(order);

        consultationMapper.updatePaymentStatus(consultationId, 1);
        consultationMapper.updateStatus(consultationId, 2);
    }

    public ConsultationDetailVO getDetail(Long consultationId) {
        Consultation c = consultationMapper.findById(consultationId);
        if (c == null) throw BusinessException.fail("会诊不存在");

        ConsultationDetailVO vo = new ConsultationDetailVO();
        vo.setId(c.getId());
        vo.setConsultationNo(c.getConsultationNo());
        vo.setType(c.getType());
        vo.setStatus(c.getStatus());
        vo.setDepartment(c.getDepartment());
        vo.setChiefComplaint(c.getChiefComplaint());
        vo.setMedicalSummary(c.getMedicalSummary());
        vo.setPatientName(c.getPatientName());
        vo.setPatientAge(c.getPatientAge());
        vo.setPatientGender(c.getPatientGender());
        vo.setFee(c.getFee());
        vo.setPaymentStatus(c.getPaymentStatus());
        vo.setCreateTime(c.getCreateTime());
        vo.setMinutes(c.getMinutes());

        // Populate report info if exists
        Report report = reportMapper.findByConsultationId(consultationId);
        if (report != null) {
            ConsultationDetailVO.ReportInfo ri = new ConsultationDetailVO.ReportInfo();
            ri.setId(report.getId());
            ri.setContent(report.getContent());
            ri.setStatus(report.getStatus());
            if (report.getSignedBy() != null) {
                Doctor signer = doctorMapper.findById(report.getSignedBy());
                ri.setSignedByName(signer != null ? signer.getName() : null);
            }
            ri.setSignedTime(report.getSignedTime() != null
                    ? report.getSignedTime().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")) : null);
            vo.setReport(ri);
        }

        consultationDoctorMapper.findByConsultationId(consultationId).stream()
            .filter(cd -> cd.getStatus() == 1)
            .findFirst().ifPresent(cd -> {
                Doctor d = doctorMapper.findById(cd.getDoctorId());
                if (d != null) {
                    vo.setDoctorName(d.getName());
                    vo.setDoctorTitle(d.getTitle());
                    vo.setDoctorDepartment(d.getDepartment());
                }
            });

        List<ConsultationUpload> uploads = consultationUploadMapper.findByConsultationId(consultationId);
        vo.setUploads(uploads.stream().map(u -> {
            ConsultationDetailVO.UploadItem item = new ConsultationDetailVO.UploadItem();
            item.setId(u.getId());
            item.setFileName(u.getFileName());
            item.setFileType(u.getFileType());
            item.setFileUrl(u.getFileUrl());
            item.setOcrResult(u.getOcrResult());
            return item;
        }).collect(Collectors.toList()));

        return vo;
    }

    public List<Consultation> queryByPatientId(Long patientId) {
        return consultationMapper.findByPatientId(patientId);
    }

    public List<Consultation> getMeetings(Long patientId) {
        return consultationMapper.findMeetingsByPatientId(patientId);
    }

    private void verifyOwnership(Long consultationId) {
        Consultation c = consultationMapper.findById(consultationId);
        if (c == null) throw BusinessException.fail("会诊不存在");
    }

    private String generateConsultationNo() {
        return "MDT" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"))
                + ThreadLocalRandom.current().nextInt(1000, 9999);
    }
}
