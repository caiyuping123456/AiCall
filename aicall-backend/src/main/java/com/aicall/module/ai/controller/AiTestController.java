package com.aicall.module.ai.controller;

import com.aicall.common.result.Result;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.embedding.EmbeddingModel;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiTestController {
    private final ChatLanguageModel chatLanguageModel;
    private final EmbeddingModel embeddingModel;

    @GetMapping("/chat")
    public Result<Map<String, String>> chat(@RequestParam String message) {
        String response = chatLanguageModel.generate(message);
        return Result.success(Map.of("response", response));
    }

    @GetMapping("/embedding")
    public Result<Map<String, Object>> embedding(@RequestParam String text) {
        var response = embeddingModel.embed(text);
        return Result.success(Map.of(
                "dimension", response.content().dimension(),
                "vectorSize", response.content().vector().length
        ));
    }
}
