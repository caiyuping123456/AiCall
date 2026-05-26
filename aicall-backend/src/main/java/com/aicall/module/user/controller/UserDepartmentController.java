package com.aicall.module.user.controller;

import com.aicall.common.exception.BusinessException;
import com.aicall.common.result.Result;
import com.aicall.module.admin.entity.Department;
import com.aicall.module.admin.mapper.DepartmentMapper;
import com.aicall.module.admin.dto.DepartmentVO;
import com.aicall.module.admin.service.DepartmentService;
import com.aicall.module.doctor.entity.Doctor;
import com.aicall.module.doctor.mapper.DoctorMapper;
import com.aicall.module.user.dto.UserDoctorDetailVO;
import com.aicall.module.user.dto.UserDoctorVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/user/departments")
@RequiredArgsConstructor
public class UserDepartmentController {
    private final DepartmentService departmentService;
    private final DepartmentMapper departmentMapper;
    private final DoctorMapper doctorMapper;

    @GetMapping
    public Result<List<DepartmentVO>> listDepartments() {
        return Result.success(departmentService.list());
    }

    @GetMapping("/{id}/doctors")
    public Result<List<UserDoctorVO>> listDoctors(@PathVariable Long id) {
        Department dept = departmentMapper.findById(id);
        if (dept == null) {
            throw BusinessException.fail("科室不存在");
        }
        List<Doctor> doctors = doctorMapper.findByDepartment(dept.getName());
        List<UserDoctorVO> result = doctors.stream().map(this::toDoctorVO).toList();
        return Result.success(result);
    }

    private UserDoctorVO toDoctorVO(Doctor doctor) {
        UserDoctorVO vo = new UserDoctorVO();
        vo.setId(doctor.getId());
        vo.setName(doctor.getName());
        vo.setTitle(doctor.getTitle());
        vo.setDepartment(doctor.getDepartment());
        vo.setAvatar(doctor.getAvatar());
        vo.setIntroduction(doctor.getIntroduction());
        return vo;
    }
}