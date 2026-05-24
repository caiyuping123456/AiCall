package com.aicall.module.admin.service;

import com.aicall.common.exception.BusinessException;
import com.aicall.module.admin.dto.DepartmentCreateRequest;
import com.aicall.module.admin.dto.DepartmentUpdateRequest;
import com.aicall.module.admin.dto.DepartmentVO;
import com.aicall.module.admin.entity.Department;
import com.aicall.module.admin.mapper.DepartmentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentService {
    private final DepartmentMapper departmentMapper;

    public List<DepartmentVO> list() {
        return departmentMapper.findAllActive().stream().map(d -> {
            DepartmentVO vo = new DepartmentVO();
            vo.setId(d.getId());
            vo.setName(d.getName());
            vo.setDescription(d.getDescription());
            vo.setStatus(d.getStatus());
            vo.setCreateTime(d.getCreateTime());
            vo.setUpdateTime(d.getUpdateTime());
            return vo;
        }).collect(Collectors.toList());
    }

    public DepartmentVO create(DepartmentCreateRequest request) {
        Department dept = new Department();
        dept.setName(request.getName());
        dept.setDescription(request.getDescription());
        departmentMapper.insert(dept);
        DepartmentVO vo = new DepartmentVO();
        vo.setId(dept.getId());
        vo.setName(dept.getName());
        vo.setDescription(dept.getDescription());
        vo.setStatus(1);
        return vo;
    }

    public void update(Long id, DepartmentUpdateRequest request) {
        Department dept = departmentMapper.findById(id);
        if (dept == null) throw BusinessException.fail("科室不存在");
        dept.setName(request.getName());
        dept.setDescription(request.getDescription());
        departmentMapper.update(dept);
    }

    public void delete(Long id) {
        Department dept = departmentMapper.findById(id);
        if (dept == null) throw BusinessException.fail("科室不存在");
        departmentMapper.deleteById(id);
    }
}
