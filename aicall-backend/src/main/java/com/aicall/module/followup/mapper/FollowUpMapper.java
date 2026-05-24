package com.aicall.module.followup.mapper;

import com.aicall.module.followup.entity.FollowUp;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface FollowUpMapper {
    void insert(FollowUp followUp);

    List<FollowUp> findByConsultationId(@Param("consultationId") Long consultationId);

    List<FollowUp> findByPatientId(@Param("patientId") Long patientId);

    List<FollowUp> findPendingByPatientId(@Param("patientId") Long patientId);

    FollowUp findById(@Param("id") Long id);

    List<FollowUp> findDueByDate(@Param("date") LocalDate date);

    List<FollowUp> findAbnormalByDoctorId(@Param("doctorId") Long doctorId);

    void updateStatus(@Param("id") Long id, @Param("status") Integer status,
                      @Param("sendTime") LocalDateTime sendTime);

    void updateAnswer(@Param("id") Long id, @Param("answer") String answer,
                      @Param("answerTime") LocalDateTime answerTime, @Param("status") Integer status);

    void updateAiAnalysis(@Param("id") Long id, @Param("aiAnalysis") String aiAnalysis,
                          @Param("status") Integer status);
}
