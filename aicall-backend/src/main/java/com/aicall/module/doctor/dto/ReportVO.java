package com.aicall.module.doctor.dto;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Map;

@Data
public class ReportVO {
    private Long id;
    private String content;
    private Integer status;
    private String signedByName;
    private LocalDateTime signedTime;
    private QcResultVO qcResult;

    private Map<String, String> fields;

    public Map<String, String> getFields() {
        if (fields == null && content != null) {
            try {
                String json = content.trim();
                if (json.startsWith("```")) {
                    json = json.replaceAll("```json\\s*", "").replaceAll("```\\s*$", "");
                }
                fields = new ObjectMapper().readValue(json, new TypeReference<Map<String, String>>() {});
            } catch (Exception e) {
                fields = Map.of("raw", content);
            }
        }
        return fields;
    }
}
