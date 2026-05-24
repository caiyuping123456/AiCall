package com.aicall.module.admin.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminDoctorPageRequest {
    private String keyword;
    @NotNull
    private Integer page;
    @NotNull
    private Integer size;
}
