package com.aicall.module.admin.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class AdminDashboardVO {
    private Long consultationTotal;
    private Map<String, Long> consultationByStatus;
    private Long newThisMonth;
    private Long newThisWeek;
    private Map<String, Long> byDepartment;
    private List<DoctorWorkloadItem> doctorWorkload;
    private RevenueVO revenue;
    private List<DailyTrendItem> dailyTrend;
    private List<DailyRevenueItem> dailyRevenue;

    @Data
    public static class DoctorWorkloadItem {
        private Long doctorId;
        private String name;
        private Long consultationCount;
    }

    @Data
    public static class RevenueVO {
        private BigDecimal total;
        private BigDecimal paid;
        private BigDecimal refunded;
    }

    @Data
    public static class DailyTrendItem {
        private String date;
        private Long count;
    }

    @Data
    public static class DailyRevenueItem {
        private String date;
        private BigDecimal amount;
    }
}