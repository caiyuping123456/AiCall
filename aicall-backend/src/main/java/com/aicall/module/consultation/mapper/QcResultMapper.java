package com.aicall.module.consultation.mapper;

import com.aicall.module.consultation.entity.QcResult;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface QcResultMapper {
    QcResult findByReportId(@Param("reportId") Long reportId);
    void insert(QcResult result);
}
