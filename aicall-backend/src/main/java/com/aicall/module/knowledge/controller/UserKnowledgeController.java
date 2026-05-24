package com.aicall.module.knowledge.controller;

import com.aicall.common.result.Result;
import com.aicall.module.knowledge.dto.ChatRequest;
import com.aicall.module.knowledge.dto.ChatResponse;
import com.aicall.module.knowledge.service.KnowledgeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user/knowledge")
@RequiredArgsConstructor
public class UserKnowledgeController {
    private final KnowledgeService knowledgeService;

    @PostMapping("/chat")
    public Result<ChatResponse> chat(@Valid @RequestBody ChatRequest request) {
        ChatResponse response = knowledgeService.chat(request.getQuestion());
        return Result.success(response);
    }
}
