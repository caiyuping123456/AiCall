package com.aicall.module.admin.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AdminDoctorScheduleRequest {
    @NotNull
    private LocalDate scheduleDate;
    @NotNull
    private LocalTime startTime;
    @NotNull
    private LocalTime endTime;
}
