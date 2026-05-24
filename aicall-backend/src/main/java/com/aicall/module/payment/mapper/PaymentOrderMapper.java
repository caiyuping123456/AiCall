package com.aicall.module.payment.mapper;

import com.aicall.module.payment.entity.PaymentOrder;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Mapper
public interface PaymentOrderMapper {
    void insert(PaymentOrder order);
    BigDecimal sumAmountByStatus(@Param("status") Integer status);
    List<Map<String, Object>> sumDailyRevenue(@Param("startDate") String startDate);
}
