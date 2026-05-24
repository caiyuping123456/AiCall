package com.aicall.module.payment.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PaymentOrder {
    private Long id;
    private String orderNo;
    private Long consultationId;
    private BigDecimal amount;
    private String feeDetail;
    private Integer status;
    private LocalDateTime payTime;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
