package com.aicall.module.knowledge.dto;

import lombok.Data;
import java.util.List;

@Data
public class ChatResponse {
    private String answer;
    private List<SourceItem> sources;

    @Data
    public static class SourceItem {
        private String fileName;
        private String snippet;
    }
}
