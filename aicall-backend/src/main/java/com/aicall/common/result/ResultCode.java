package com.aicall.common.result;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ResultCode {
    SUCCESS(200, "操作成功"),
    PARAM_ERROR(400, "参数错误"),
    UNAUTHORIZED(401, "未认证"),
    FORBIDDEN(403, "无权限"),
    NOT_FOUND(404, "资源不存在"),
    INTERNAL_ERROR(500, "系统异常"),

    // 用户端 1xxxx
    USER_PHONE_NOT_FOUND(10001, "手机号未找到会诊记录"),
    USER_CONSULTATION_CANCELLED(10002, "会诊已取消"),

    // 医生端 2xxxx
    DOCTOR_LOGIN_FAILED(20001, "账号或密码错误"),
    DOCTOR_ACCOUNT_DISABLED(20002, "账号已禁用"),

    // 会诊 3xxxx
    CONSULTATION_NOT_FOUND(30001, "会诊不存在"),
    CONSULTATION_STATUS_ERROR(30002, "会诊状态异常"),

    // 支付 4xxxx
    PAYMENT_ORDER_NOT_FOUND(40001, "订单不存在"),
    PAYMENT_ALREADY_PAID(40002, "订单已支付"),

    // AI 5xxxx
    AI_CALL_FAILED(50001, "AI服务调用失败"),
    AI_TIMEOUT(50002, "AI服务超时");

    private final int code;
    private final String message;
}
