package com.aicall.module.consultation.mapper;

import com.aicall.module.consultation.entity.Report;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ReportMapper {
    Report findById(@Param("id") Long id);
    Report findByConsultationId(@Param("consultationId") Long consultationId);
    void insert(Report report);
    void updateContent(@Param("id") Long id, @Param("content") String content);
    void updateStatus(@Param("id") Long id, @Param("status") Integer status);
    void updateSign(@Param("id") Long id, @Param("status") Integer status, @Param("signedBy") Long signedBy);
}
