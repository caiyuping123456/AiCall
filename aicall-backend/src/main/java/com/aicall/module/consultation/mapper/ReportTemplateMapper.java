package com.aicall.module.consultation.mapper;

import com.aicall.module.consultation.entity.ReportTemplate;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ReportTemplateMapper {
    ReportTemplate findByDepartment(@Param("department") String department);
}
