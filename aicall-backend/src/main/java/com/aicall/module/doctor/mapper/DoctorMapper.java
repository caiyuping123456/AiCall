package com.aicall.module.doctor.mapper;

import com.aicall.module.doctor.entity.Doctor;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface DoctorMapper {
    Doctor findByUsername(String username);
    Doctor findById(@Param("id") Long id);
}
