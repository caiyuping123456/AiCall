package com.aicall.module.consultation.mapper;

import com.aicall.module.consultation.entity.Consultation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface ConsultationMapper {
    void insert(Consultation consultation);

    Consultation findById(@Param("id") Long id);

    List<Consultation> findByPatientId(@Param("patientId") Long patientId);

    List<Consultation> findMeetingsByPatientId(@Param("patientId") Long patientId);

    void updateStatus(@Param("id") Long id, @Param("status") Integer status);

    void updateMedicalSummary(@Param("id") Long id, @Param("medicalSummary") String medicalSummary);

    void updateTypeAndFee(@Param("id") Long id, @Param("type") Integer type, @Param("fee") java.math.BigDecimal fee);

    void updatePaymentStatus(@Param("id") Long id, @Param("paymentStatus") Integer paymentStatus);

    List<Consultation> findAdminPage(@Param("status") Integer status,
                                     @Param("keyword") String keyword,
                                     @Param("offset") int offset,
                                     @Param("size") int size);

    long countAdminPage(@Param("status") Integer status,
                        @Param("keyword") String keyword);

    void updateCancel(@Param("id") Long id,
                      @Param("status") Integer status,
                      @Param("reason") String reason);

    List<Map<String, Object>> countByStatus();

    List<Map<String, Object>> countByDepartment();

    void updateMinutes(@Param("id") Long id, @Param("minutes") String minutes);

    List<Map<String, Object>> countDailyTrend(@Param("startDate") String startDate);
}
