package com.aicall.module.doctor.dto;

import lombok.Data;
import java.util.List;

@Data
public class WorkbenchVO {
    private int pendingReviewCount;
    private int reportEditingCount;
    private int pendingQcCount;
    private List<ConsultationListItemVO> recentConsultations;
}
