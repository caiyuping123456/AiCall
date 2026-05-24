package com.aicall.module.admin.service;

import com.aicall.module.admin.dto.AdminDashboardVO;
import com.aicall.module.consultation.mapper.ConsultationMapper;
import com.aicall.module.payment.mapper.PaymentOrderMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminDashboardServiceTest {

    @Mock
    private ConsultationMapper consultationMapper;
    @Mock
    private PaymentOrderMapper paymentOrderMapper;
    @Mock
    private com.aicall.module.consultation.mapper.ConsultationDoctorMapper consultationDoctorMapper;
    @Mock
    private com.aicall.module.doctor.mapper.DoctorMapper doctorMapper;
    @InjectMocks
    private AdminDashboardService adminDashboardService;

    @Test
    void dashboardIncludesRevenueTotals() {
        when(paymentOrderMapper.sumAmountByStatus(1)).thenReturn(new BigDecimal("60000"));
        when(paymentOrderMapper.sumAmountByStatus(2)).thenReturn(new BigDecimal("5000"));
        when(consultationMapper.countAdminPage(null, null)).thenReturn(0L);
        when(consultationMapper.countByStatus()).thenReturn(java.util.List.of());
        when(consultationMapper.countByDepartment()).thenReturn(java.util.List.of());
        when(consultationMapper.countDailyTrend(org.mockito.ArgumentMatchers.anyString())).thenReturn(java.util.List.of());

        AdminDashboardVO dashboard = adminDashboardService.getDashboard();

        assertEquals(new BigDecimal("60000"), dashboard.getRevenue().getPaid());
        assertEquals(new BigDecimal("5000"), dashboard.getRevenue().getRefunded());
    }
}