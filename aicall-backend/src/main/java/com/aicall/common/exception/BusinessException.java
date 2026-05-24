package com.aicall.common.exception;

import com.aicall.common.result.ResultCode;
import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {
    private final int code;

    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }

    public BusinessException(ResultCode resultCode) {
        super(resultCode.getMessage());
        this.code = resultCode.getCode();
    }

    public static BusinessException fail(String message) {
        return new BusinessException(ResultCode.INTERNAL_ERROR.getCode(), message);
    }

    public static BusinessException fail(ResultCode resultCode) {
        return new BusinessException(resultCode);
    }
}
