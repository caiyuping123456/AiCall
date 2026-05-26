package com.aicall.module.user.controller;

import com.aicall.common.exception.BusinessException;
import com.aicall.common.result.Result;
import com.aicall.module.doctor.entity.Doctor;
import com.aicall.module.doctor.mapper.DoctorMapper;
import com.aicall.module.user.dto.UserDoctorDetailVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user/doctors")
@RequiredArgsConstructor
public class UserDoctorController {
    private final DoctorMapper doctorMapper;

    @GetMapping("/{id}")
    public Result<UserDoctorDetailVO> getDoctorDetail(@PathVariable Long id) {
        Doctor doctor = doctorMapper.findById(id);
        if (doctor == null) {
            throw BusinessException.fail("医生不存在");
        }
        UserDoctorDetailVO vo = new UserDoctorDetailVO();
        vo.setId(doctor.getId());
        vo.setName(doctor.getName());
        vo.setTitle(doctor.getTitle());
        vo.setDepartment(doctor.getDepartment());
        vo.setPhone(doctor.getPhone());
        vo.setAvatar(doctor.getAvatar());
        vo.setIntroduction(doctor.getIntroduction());
        return Result.success(vo);
    }
}
