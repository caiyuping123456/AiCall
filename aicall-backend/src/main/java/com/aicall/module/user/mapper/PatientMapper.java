package com.aicall.module.user.mapper;

import com.aicall.module.user.entity.Patient;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface PatientMapper {
    Patient findByPhone(@Param("phone") String phone);

    void insert(Patient patient);
}
