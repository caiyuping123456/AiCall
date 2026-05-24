package com.aicall.module.doctor.mapper;

import com.aicall.module.doctor.entity.Doctor;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface DoctorMapper {
    Doctor findByUsername(String username);
    Doctor findById(@Param("id") Long id);
    List<Doctor> findAdminPage(@Param("keyword") String keyword, @Param("department") String department, @Param("offset") int offset, @Param("size") int size);
    long countAdminPage(@Param("keyword") String keyword, @Param("department") String department);
    void insert(Doctor doctor);
    void updateById(Doctor doctor);
    void updateStatus(@Param("id") Long id, @Param("status") Integer status);
}
