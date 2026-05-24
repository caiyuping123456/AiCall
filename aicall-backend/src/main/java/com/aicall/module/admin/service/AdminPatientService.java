package com.aicall.module.admin.service;

import cn.hutool.crypto.digest.DigestUtil;
import cn.hutool.core.util.RandomUtil;
import com.aicall.module.admin.dto.PatientListItemVO;
import com.aicall.module.common.dto.PageResult;
import com.aicall.module.user.entity.Patient;
import com.aicall.module.user.mapper.PatientMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminPatientService {
    private final PatientMapper patientMapper;

    public PageResult<PatientListItemVO> getPatients(String keyword, Integer page, Integer size) {
        int currentPage = page == null || page < 1 ? 1 : page;
        int pageSize = size == null || size < 1 ? 10 : size;
        int offset = (currentPage - 1) * pageSize;
        List<Patient> patients = patientMapper.findAdminPage(keyword, offset, pageSize);
        long total = patientMapper.countAdminPage(keyword);
        List<PatientListItemVO> list = patients.stream().map(p -> {
            PatientListItemVO vo = new PatientListItemVO();
            vo.setId(p.getId());
            vo.setName(p.getName());
            vo.setPhone(p.getPhone());
            vo.setGender(p.getGender());
            vo.setAge(p.getAge());
            vo.setStatus(p.getStatus());
            vo.setProfileComplete(p.getProfileComplete());
            vo.setCreateTime(p.getCreateTime());
            return vo;
        }).toList();
        return PageResult.of(list, total, currentPage, pageSize);
    }

    public void updateStatus(Long id, Integer status) {
        patientMapper.updateStatus(id, status);
    }

    public void resetPassword(Long id) {
        String salt = RandomUtil.randomString(32);
        String encryptedPassword = DigestUtil.md5Hex("123456" + salt);
        patientMapper.updatePassword(id, encryptedPassword, salt);
    }
}
