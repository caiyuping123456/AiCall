package com.aicall.module.knowledge.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MedicalDocument {
    private Long id;
    private String fileName;
    private String fileUrl;
    private String content;
    private Integer chunkCount;
    private Integer status;
    private LocalDateTime createTime;
}
