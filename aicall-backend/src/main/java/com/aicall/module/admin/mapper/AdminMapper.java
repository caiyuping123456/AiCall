package com.aicall.module.admin.mapper;

import com.aicall.module.admin.entity.Admin;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface AdminMapper {
    Admin findByUsername(String username);
}
