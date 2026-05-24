package com.aicall.module.admin.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.List;

@Data
public class AdminAssignDoctorsRequest {
    @NotEmpty
    private List<DoctorAssignment> doctors;

    @Data
    public static class DoctorAssignment {
        private Long doctorId;
        private Integer role; // 0=普通专家, 1=主持人
    }
}
