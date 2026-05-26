package com.aicall.module.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RegistrationRequest {
    @NotBlank(message = "主诉不能为空")
    private String chiefComplaint;
    @NotNull(message = "请选择医生")
    private Long doctorId;
    private String department;
}
