package com.aicall.module.admin.service;

import com.aicall.module.admin.dto.AdminDashboardVO;
import com.aicall.module.consultation.mapper.ConsultationDoctorMapper;
import com.aicall.module.consultation.mapper.ConsultationMapper;
import com.aicall.module.doctor.mapper.DoctorMapper;
import com.aicall.module.payment.mapper.PaymentOrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {
    private final ConsultationMapper consultationMapper;
    private final PaymentOrderMapper paymentOrderMapper;
    private final ConsultationDoctorMapper consultationDoctorMapper;
    private final DoctorMapper doctorMapper;

    public AdminDashboardVO getDashboard() {
        AdminDashboardVO vo = new AdminDashboardVO();

        long total = consultationMapper.countAdminPage(null, null);
        vo.setConsultationTotal(total);

        List<Map<String, Object>> statusRows = consultationMapper.countByStatus();
        Map<String, Long> statusMap = new HashMap<>();
        for (Map<String, Object> row : statusRows) {
            Object key = row.get("status");
            Object val = row.get("count");
            statusMap.put(String.valueOf(key), ((Number) val).longValue());
        }
        vo.setConsultationByStatus(statusMap);

        LocalDate today = LocalDate.now();
        String monthStart = today.withDayOfMonth(1).toString();
        String weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).toString();

        long thisMonth = consultationMapper.countAdminPage(null, null);
        long thisWeek = consultationMapper.countAdminPage(null, null);
        vo.setNewThisMonth(thisMonth);
        vo.setNewThisWeek(thisWeek);

        List<Map<String, Object>> deptRows = consultationMapper.countByDepartment();
        Map<String, Long> deptMap = new HashMap<>();
        for (Map<String, Object> row : deptRows) {
            Object key = row.get("name");
            Object val = row.get("count");
            deptMap.put(String.valueOf(key), ((Number) val).longValue());
        }
        vo.setByDepartment(deptMap);

        BigDecimal paid = paymentOrderMapper.sumAmountByStatus(1);
        BigDecimal refunded = paymentOrderMapper.sumAmountByStatus(2);
        AdminDashboardVO.RevenueVO revenue = new AdminDashboardVO.RevenueVO();
        revenue.setTotal(paid != null ? paid : BigDecimal.ZERO);
        revenue.setPaid(paid != null ? paid : BigDecimal.ZERO);
        revenue.setRefunded(refunded != null ? refunded : BigDecimal.ZERO);
        vo.setRevenue(revenue);

        String trendStart = today.minusDays(29).toString();
        List<Map<String, Object>> trendRows = consultationMapper.countDailyTrend(trendStart);
        List<AdminDashboardVO.DailyTrendItem> trend = trendRows.stream().map(row -> {
            AdminDashboardVO.DailyTrendItem item = new AdminDashboardVO.DailyTrendItem();
            item.setDate(String.valueOf(row.get("date")));
            item.setCount(((Number) row.get("count")).longValue());
            return item;
        }).toList();
        vo.setDailyTrend(trend);

        List<Map<String, Object>> revenueRows = paymentOrderMapper.sumDailyRevenue(trendStart);
        Map<String, BigDecimal> revenueMap = new HashMap<>();
        for (Map<String, Object> row : revenueRows) {
            revenueMap.put(String.valueOf(row.get("date")), (BigDecimal) row.get("amount"));
        }
        List<AdminDashboardVO.DailyRevenueItem> dailyRevenue = new java.util.ArrayList<>();
        for (int i = 0; i < 30; i++) {
            String date = today.minusDays(29 - i).toString();
            AdminDashboardVO.DailyRevenueItem item = new AdminDashboardVO.DailyRevenueItem();
            item.setDate(date);
            item.setAmount(revenueMap.getOrDefault(date, BigDecimal.ZERO));
            dailyRevenue.add(item);
        }
        vo.setDailyRevenue(dailyRevenue);

        return vo;
    }
}