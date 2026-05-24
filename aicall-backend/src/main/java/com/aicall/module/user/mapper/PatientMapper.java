package com.aicall.module.user.mapper;

import com.aicall.module.user.entity.Patient;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PatientMapper {
    Patient findByPhone(@Param("phone") String phone);

    Patient findById(@Param("id") Long id);

    void insert(Patient patient);

    void updateProfile(@Param("id") Long id, @Param("name") String name,
                       @Param("age") Integer age, @Param("gender") Integer gender);

    List<Patient> findAdminPage(@Param("keyword") String keyword,
                                @Param("offset") int offset, @Param("size") int size);

    long countAdminPage(@Param("keyword") String keyword);

    void updateStatus(@Param("id") Long id, @Param("status") Integer status);

    void updatePassword(@Param("id") Long id, @Param("password") String password,
                        @Param("salt") String salt);
}
