package com.aicall.module.consultation.mapper;

import com.aicall.module.consultation.entity.ConsultationUpload;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ConsultationUploadMapper {
    void insert(ConsultationUpload upload);

    List<ConsultationUpload> findByConsultationId(@Param("consultationId") Long consultationId);

    ConsultationUpload findById(@Param("id") Long id);

    void updateOcrResult(@Param("id") Long id, @Param("ocrResult") String ocrResult);

    void deleteById(@Param("id") Long id);
}
