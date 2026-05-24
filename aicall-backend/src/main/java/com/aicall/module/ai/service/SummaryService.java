package com.aicall.module.ai.service;

import dev.langchain4j.model.chat.ChatLanguageModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class SummaryService {
    private static final String SUMMARY_PROMPT = """
            你是一位资深医学文书专家。请将以下患者的预问诊信息整理为结构化的病情摘要。

            要求：
            - 按以下结构输出，使用中文
            - 如果某项信息未提及，标注"未提供"

            格式：
            【主诉】...
            【现病史】...
            【既往史】...
            【过敏史】...
            【初步印象】...（基于已有信息给出初步医学印象，注明仅供参考）

            患者信息：
            %s
            """;

    private final ChatLanguageModel chatLanguageModel;

    public String generateSummary(String content) {
        String prompt = String.format(SUMMARY_PROMPT, content);
        return chatLanguageModel.generate(prompt).content().text();
    }
}
