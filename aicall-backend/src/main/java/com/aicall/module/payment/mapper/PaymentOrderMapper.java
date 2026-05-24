package com.aicall.module.payment.mapper;

import com.aicall.module.payment.entity.PaymentOrder;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface PaymentOrderMapper {
    void insert(PaymentOrder order);
}
