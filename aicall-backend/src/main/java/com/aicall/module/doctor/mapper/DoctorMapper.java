package com.aicall.module.doctor.mapper;

import com.aicall.module.doctor.entity.Doctor;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface DoctorMapper {
    Doctor findByUsername(String username);
}
