package com.aicall.module.admin.mapper;

import com.aicall.module.admin.entity.Admin;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AdminMapper {
    Admin findByUsername(String username);
    Admin findById(@Param("id") Long id);
}
