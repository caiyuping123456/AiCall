package com.aicall.module.knowledge.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class DocumentVO {
    private Long id;
    private String fileName;
    private String fileUrl;
    private Integer chunkCount;
    private LocalDateTime createTime;
}
