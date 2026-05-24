package com.aicall.module.consultation.mapper;

import com.aicall.module.consultation.entity.Consultation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ConsultationMapper {
    void insert(Consultation consultation);

    Consultation findById(@Param("id") Long id);

    List<Consultation> findByPatientId(@Param("patientId") Long patientId);

    void updateStatus(@Param("id") Long id, @Param("status") Integer status);

    void updateMedicalSummary(@Param("id") Long id, @Param("medicalSummary") String medicalSummary);

    void updateTypeAndFee(@Param("id") Long id, @Param("type") Integer type, @Param("fee") java.math.BigDecimal fee);

    void updatePaymentStatus(@Param("id") Long id, @Param("paymentStatus") Integer paymentStatus);
}
