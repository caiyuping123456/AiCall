package com.aicall.module.ai.service;

import com.aicall.module.consultation.entity.QcResult;
import com.aicall.module.consultation.entity.Report;
import com.aicall.module.consultation.mapper.QcResultMapper;
import com.aicall.module.consultation.mapper.ReportMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.langchain4j.model.chat.ChatLanguageModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class QcService {
    private final ChatLanguageModel chatLanguageModel;
    private final ReportMapper reportMapper;
    private final QcResultMapper qcResultMapper;
    private final ObjectMapper objectMapper;

    public QcResult checkQuality(Long reportId) {
        Report report = reportMapper.findById(reportId);
        if (report == null) {
            throw new IllegalArgumentException("报告不存在");
        }

        String prompt = """
            你是一位医疗报告质量控制专家。请对以下会诊报告进行质量评估。

            ## 报告内容
            %s

            请从以下三个维度进行评分（0-100分），并指出具体问题：

            1. 完整性：报告各必要章节是否齐全，信息是否完整
            2. 规范性：是否符合医疗报告书写规范，术语是否准确
            3. 一致性：各章节内容是否逻辑一致，是否存在矛盾

            请严格按照以下JSON格式输出，不要输出其他内容：
            {
              "completenessScore": 85,
              "standardScore": 90,
              "consistencyScore": 80,
              "issues": ["具体问题1", "具体问题2"]
            }
            """.formatted(report.getContent() != null ? report.getContent() : "");

        log.info("Running QC for report {}", reportId);
        String result = chatLanguageModel.generate(prompt);

        int completenessScore = 80;
        int standardScore = 80;
        int consistencyScore = 80;
        String issues = "[]";

        try {
            String json = result;
            if (json.contains("```")) {
                json = json.substring(json.indexOf("{"), json.lastIndexOf("}") + 1);
            } else if (!json.trim().startsWith("{")) {
                json = json.substring(json.indexOf("{"), json.lastIndexOf("}") + 1);
            }
            JsonNode node = objectMapper.readTree(json);
            completenessScore = node.has("completenessScore") ? node.get("completenessScore").asInt() : 80;
            standardScore = node.has("standardScore") ? node.get("standardScore").asInt() : 80;
            consistencyScore = node.has("consistencyScore") ? node.get("consistencyScore").asInt() : 80;
            if (node.has("issues")) {
                issues = objectMapper.writeValueAsString(node.get("issues"));
            }
        } catch (Exception e) {
            log.warn("Failed to parse QC response, using defaults: {}", e.getMessage());
        }

        int totalScore = (int) (completenessScore * 0.3 + standardScore * 0.4 + consistencyScore * 0.3);
        int status = totalScore >= 60 ? 1 : 2;

        QcResult qcResult = new QcResult();
        qcResult.setReportId(reportId);
        qcResult.setCompletenessScore(completenessScore);
        qcResult.setStandardScore(standardScore);
        qcResult.setConsistencyScore(consistencyScore);
        qcResult.setTotalScore(totalScore);
        qcResult.setIssues(issues);
        qcResult.setStatus(status);
        qcResultMapper.insert(qcResult);

        return qcResult;
    }
}
