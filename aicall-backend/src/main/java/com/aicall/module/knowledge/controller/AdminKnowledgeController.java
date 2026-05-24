package com.aicall.module.knowledge.controller;

import com.aicall.common.result.Result;
import com.aicall.module.knowledge.dto.DocumentVO;
import com.aicall.module.knowledge.service.KnowledgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/admin/knowledge")
@RequiredArgsConstructor
public class AdminKnowledgeController {
    private final KnowledgeService knowledgeService;

    @GetMapping("/documents")
    public Result<List<DocumentVO>> listDocuments() {
        return Result.success(knowledgeService.listDocuments());
    }

    @PostMapping("/documents")
    public Result<DocumentVO> uploadDocument(@RequestParam("file") MultipartFile file) {
        return Result.success(knowledgeService.uploadDocument(file));
    }

    @DeleteMapping("/documents/{id}")
    public Result<Void> deleteDocument(@PathVariable Long id) {
        knowledgeService.deleteDocument(id);
        return Result.success();
    }
}
