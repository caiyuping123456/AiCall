package com.aicall.module.admin.mapper;

import com.aicall.module.admin.entity.Department;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface DepartmentMapper {
    List<Department> findAllActive();

    Department findById(@Param("id") Long id);

    void insert(Department department);

    void update(Department department);

    void deleteById(@Param("id") Long id);
}
