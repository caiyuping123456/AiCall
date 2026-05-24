package com.aicall.module.evaluation.mapper;

import com.aicall.module.evaluation.entity.Evaluation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface EvaluationMapper {
    void insert(Evaluation evaluation);

    Evaluation findByConsultationId(@Param("consultationId") Long consultationId);

    List<Evaluation> findPendingByPatientId(@Param("patientId") Long patientId);

    void updateScore(@Param("id") Long id, @Param("doctorScore") Integer doctorScore,
                     @Param("serviceScore") Integer serviceScore, @Param("comment") String comment);
}
