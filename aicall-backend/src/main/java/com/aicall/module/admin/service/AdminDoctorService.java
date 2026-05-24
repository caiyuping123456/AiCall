package com.aicall.module.admin.service;

import cn.hutool.core.util.RandomUtil;
import cn.hutool.core.util.StrUtil;
import com.aicall.common.exception.BusinessException;
import com.aicall.module.admin.dto.AdminDoctorCreateRequest;
import com.aicall.module.admin.dto.AdminDoctorDetailVO;
import com.aicall.module.admin.dto.AdminDoctorListItemVO;
import com.aicall.module.admin.dto.AdminDoctorScheduleRequest;
import com.aicall.module.admin.dto.AdminDoctorScheduleVO;
import com.aicall.module.admin.dto.AdminDoctorUpdateRequest;
import com.aicall.module.common.dto.PageResult;
import com.aicall.module.consultation.mapper.ConsultationDoctorMapper;
import com.aicall.module.doctor.entity.Doctor;
import com.aicall.module.doctor.entity.DoctorSchedule;
import com.aicall.module.doctor.mapper.DoctorMapper;
import com.aicall.module.doctor.mapper.DoctorScheduleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminDoctorService {
    private final DoctorMapper doctorMapper;
    private final DoctorScheduleMapper doctorScheduleMapper;
    private final ConsultationDoctorMapper consultationDoctorMapper;
    private final PasswordEncoder passwordEncoder;

    public PageResult<AdminDoctorListItemVO> getDoctors(String keyword, String department, Integer page, Integer size) {
        int currentPage = page == null || page < 1 ? 1 : page;
        int pageSize = size == null || size < 1 ? 10 : size;
        int offset = (currentPage - 1) * pageSize;
        List<Doctor> doctors = doctorMapper.findAdminPage(keyword, department, offset, pageSize);
        long total = doctorMapper.countAdminPage(keyword, department);
        List<AdminDoctorListItemVO> list = doctors.stream().map(this::toListItem).toList();
        return PageResult.of(list, total, currentPage, pageSize);
    }

    @Transactional
    public void createDoctor(AdminDoctorCreateRequest request) {
        String username = StrUtil.isBlank(request.getUsername())
                ? "doctor_" + RandomUtil.randomString(6)
                : request.getUsername();

        Doctor doctor = new Doctor();
        doctor.setUsername(username);
        doctor.setPassword(passwordEncoder.encode(request.getPassword()));
        doctor.setName(request.getName());
        doctor.setTitle(request.getTitle());
        doctor.setDepartment(request.getDepartment());
        doctor.setPhone(request.getPhone());
        doctor.setIntroduction(null);
        doctor.setStatus(1);
        doctorMapper.insert(doctor);
    }

    @Transactional
    public void updateDoctor(Long id, AdminDoctorUpdateRequest request) {
        Doctor doctor = doctorMapper.findById(id);
        if (doctor == null) {
            throw BusinessException.fail("医生不存在");
        }
        doctor.setName(request.getName());
        doctor.setTitle(request.getTitle());
        doctor.setDepartment(request.getDepartment());
        doctor.setPhone(request.getPhone());
        doctor.setIntroduction(request.getIntroduction());
        doctorMapper.updateById(doctor);
    }

    @Transactional
    public void updateDoctorStatus(Long id, Integer status) {
        Doctor doctor = doctorMapper.findById(id);
        if (doctor == null) {
            throw BusinessException.fail("医生不存在");
        }
        doctorMapper.updateStatus(id, status);
    }

    public AdminDoctorDetailVO getDoctorDetail(Long id) {
        Doctor doctor = doctorMapper.findById(id);
        if (doctor == null) {
            throw BusinessException.fail("医生不存在");
        }
        AdminDoctorDetailVO detail = new AdminDoctorDetailVO();
        detail.setId(doctor.getId());
        detail.setUsername(doctor.getUsername());
        detail.setName(doctor.getName());
        detail.setTitle(doctor.getTitle());
        detail.setDepartment(doctor.getDepartment());
        detail.setPhone(doctor.getPhone());
        detail.setIntroduction(doctor.getIntroduction());
        detail.setStatus(doctor.getStatus());
        detail.setConsultationCount((long) consultationDoctorMapper.findByDoctorId(id).size());
        detail.setRecentSchedules(doctorScheduleMapper.findRecentByDoctorId(id, 10).stream().map(this::toScheduleVO).toList());
        return detail;
    }

    public List<AdminDoctorScheduleVO> getSchedules(Long doctorId, LocalDate date) {
        ensureDoctorExists(doctorId);
        return doctorScheduleMapper.findByDoctorIdAndDate(doctorId, date).stream().map(this::toScheduleVO).toList();
    }

    @Transactional
    public void createSchedule(Long doctorId, AdminDoctorScheduleRequest request) {
        ensureDoctorExists(doctorId);
        DoctorSchedule schedule = new DoctorSchedule();
        schedule.setDoctorId(doctorId);
        schedule.setScheduleDate(request.getScheduleDate());
        schedule.setStartTime(request.getStartTime());
        schedule.setEndTime(request.getEndTime());
        schedule.setStatus(1);
        doctorScheduleMapper.insert(schedule);
    }

    @Transactional
    public void updateSchedule(Long doctorId, Long scheduleId, AdminDoctorScheduleRequest request) {
        ensureDoctorExists(doctorId);
        DoctorSchedule schedule = doctorScheduleMapper.findById(scheduleId);
        if (schedule == null || !doctorId.equals(schedule.getDoctorId())) {
            throw BusinessException.fail("排班不存在");
        }
        schedule.setScheduleDate(request.getScheduleDate());
        schedule.setStartTime(request.getStartTime());
        schedule.setEndTime(request.getEndTime());
        doctorScheduleMapper.update(schedule);
    }

    @Transactional
    public void deleteSchedule(Long doctorId, Long scheduleId) {
        ensureDoctorExists(doctorId);
        DoctorSchedule schedule = doctorScheduleMapper.findById(scheduleId);
        if (schedule == null || !doctorId.equals(schedule.getDoctorId())) {
            throw BusinessException.fail("排班不存在");
        }
        doctorScheduleMapper.delete(scheduleId);
    }

    private void ensureDoctorExists(Long doctorId) {
        if (doctorMapper.findById(doctorId) == null) {
            throw BusinessException.fail("医生不存在");
        }
    }

    private AdminDoctorListItemVO toListItem(Doctor doctor) {
        AdminDoctorListItemVO item = new AdminDoctorListItemVO();
        item.setId(doctor.getId());
        item.setName(doctor.getName());
        item.setTitle(doctor.getTitle());
        item.setDepartment(doctor.getDepartment());
        item.setPhone(doctor.getPhone());
        item.setStatus(doctor.getStatus());
        item.setCreateTime(doctor.getCreateTime());
        return item;
    }

    private AdminDoctorScheduleVO toScheduleVO(DoctorSchedule schedule) {
        AdminDoctorScheduleVO vo = new AdminDoctorScheduleVO();
        vo.setId(schedule.getId());
        vo.setDoctorId(schedule.getDoctorId());
        vo.setScheduleDate(schedule.getScheduleDate());
        vo.setStartTime(schedule.getStartTime());
        vo.setEndTime(schedule.getEndTime());
        vo.setStatus(schedule.getStatus());
        return vo;
    }
}
