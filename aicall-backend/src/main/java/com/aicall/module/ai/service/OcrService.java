package com.aicall.module.ai.service;

import dev.langchain4j.data.message.ImageContent;
import dev.langchain4j.data.message.TextContent;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.model.chat.ChatLanguageModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class OcrService {
    private static final String OCR_PROMPT = """
            请识别这张医学图片中的所有文字内容，并按以下JSON格式输出：
            {"type":"图片类型(如化验单/影像报告/病理报告/其他)","items":[{"name":"指标名","value":"数值","status":"正常/偏高/偏低/异常"}]}
            如果不是表格类报告，直接输出识别的文字内容即可。
            """;

    private final ChatLanguageModel visionModel;

    public OcrService(@Qualifier("visionModel") ChatLanguageModel visionModel) {
        this.visionModel = visionModel;
    }

    public String recognize(String base64Image) {
        UserMessage userMessage = UserMessage.userMessage(
                TextContent.from(OCR_PROMPT),
                ImageContent.from(base64Image, "image/png")
        );
        String result = visionModel.generate(userMessage).content().text();
        log.info("OCR result length: {}", result.length());

        // Strip markdown code fences so frontend can parse the JSON directly
        result = result.trim();
        if (result.startsWith("```")) {
            int start = result.indexOf("\n");
            if (start > 0) {
                int end = result.lastIndexOf("```");
                if (end > start) {
                    result = result.substring(start + 1, end).trim();
                }
            }
        }

        return result;
    }
}
