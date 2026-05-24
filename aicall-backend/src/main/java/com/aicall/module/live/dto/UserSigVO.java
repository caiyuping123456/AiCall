package com.aicall.module.live.dto;

import lombok.Data;

@Data
public class UserSigVO {
    private String userSig;
    private int sdkAppId;
    private String roomId;
    private String userId;
}
