package com.aicall.module.admin.controller;

import com.aicall.common.result.Result;
import com.aicall.module.admin.dto.AdminDoctorCreateRequest;
import com.aicall.module.admin.dto.AdminDoctorDetailVO;
import com.aicall.module.admin.dto.AdminDoctorListItemVO;
import com.aicall.module.admin.dto.AdminDoctorScheduleRequest;
import com.aicall.module.admin.dto.AdminDoctorScheduleVO;
import com.aicall.module.admin.dto.AdminDoctorStatusRequest;
import com.aicall.module.admin.dto.AdminDoctorUpdateRequest;
import com.aicall.module.admin.service.AdminDoctorService;
import com.aicall.module.common.dto.PageResult;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/admin/doctors")
@RequiredArgsConstructor
public class AdminDoctorController {
    private final AdminDoctorService adminDoctorService;

    @GetMapping
    public Result<PageResult<AdminDoctorListItemVO>> list(@RequestParam(required = false) String keyword,
                                                          @RequestParam(required = false) String department,
                                                          @RequestParam Integer page,
                                                          @RequestParam Integer size) {
        return Result.success(adminDoctorService.getDoctors(keyword, department, page, size));
    }

    @PostMapping
    public Result<Void> create(@Valid @RequestBody AdminDoctorCreateRequest request) {
        adminDoctorService.createDoctor(request);
        return Result.success();
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody AdminDoctorUpdateRequest request) {
        adminDoctorService.updateDoctor(id, request);
        return Result.success();
    }

    @PutMapping("/{id}/status")
    public Result<Void> updateStatus(@PathVariable Long id, @Valid @RequestBody AdminDoctorStatusRequest request) {
        adminDoctorService.updateDoctorStatus(id, request.getStatus());
        return Result.success();
    }

    @GetMapping("/{id}")
    public Result<AdminDoctorDetailVO> detail(@PathVariable Long id) {
        return Result.success(adminDoctorService.getDoctorDetail(id));
    }

    @GetMapping("/{id}/schedules")
    public Result<List<AdminDoctorScheduleVO>> schedules(@PathVariable Long id,
                                                         @RequestParam(required = false) LocalDate date) {
        return Result.success(adminDoctorService.getSchedules(id, date));
    }

    @PostMapping("/{id}/schedules")
    public Result<Void> createSchedule(@PathVariable Long id, @Valid @RequestBody AdminDoctorScheduleRequest request) {
        adminDoctorService.createSchedule(id, request);
        return Result.success();
    }

    @PutMapping("/{id}/schedules/{scheduleId}")
    public Result<Void> updateSchedule(@PathVariable Long id,
                                       @PathVariable Long scheduleId,
                                       @Valid @RequestBody AdminDoctorScheduleRequest request) {
        adminDoctorService.updateSchedule(id, scheduleId, request);
        return Result.success();
    }

    @DeleteMapping("/{id}/schedules/{scheduleId}")
    public Result<Void> deleteSchedule(@PathVariable Long id, @PathVariable Long scheduleId) {
        adminDoctorService.deleteSchedule(id, scheduleId);
        return Result.success();
    }
}
