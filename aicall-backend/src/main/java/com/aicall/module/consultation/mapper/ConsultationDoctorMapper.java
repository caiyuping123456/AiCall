package com.aicall.module.consultation.mapper;

import com.aicall.module.consultation.entity.ConsultationDoctor;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface ConsultationDoctorMapper {
    List<ConsultationDoctor> findByDoctorId(@Param("doctorId") Long doctorId);
    ConsultationDoctor findByConsultationAndDoctor(@Param("consultationId") Long consultationId, @Param("doctorId") Long doctorId);
    void updateStatus(@Param("consultationId") Long consultationId, @Param("doctorId") Long doctorId, @Param("status") Integer status);
}
