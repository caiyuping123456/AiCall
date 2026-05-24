package com.aicall.module.knowledge.service;

import com.aicall.common.exception.BusinessException;
import com.aicall.common.result.ResultCode;
import com.aicall.infrastructure.storage.MinioStorageService;
import com.aicall.module.knowledge.dto.ChatResponse;
import com.aicall.module.knowledge.dto.DocumentVO;
import com.aicall.module.knowledge.entity.MedicalDocument;
import com.aicall.module.knowledge.mapper.MedicalDocumentMapper;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.store.embedding.EmbeddingMatch;
import dev.langchain4j.data.segment.TextSegment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class KnowledgeService {
    private final MedicalDocumentMapper medicalDocumentMapper;
    private final MinioStorageService minioStorageService;
    private final TextParserService textParserService;
    private final KnowledgeEmbeddingService knowledgeEmbeddingService;
    private final ChatLanguageModel chatLanguageModel;

    @Transactional
    public DocumentVO uploadDocument(MultipartFile file) {
        String fileName = file.getOriginalFilename();
        String objectName = "knowledge/" + UUID.randomUUID() + "_" + fileName;

        try (InputStream inputStream = file.getInputStream()) {
            // Upload to MinIO
            String fileUrl = minioStorageService.upload(objectName, inputStream, file.getContentType(), file.getSize());

            // Re-read input stream for text parsing (multipart can be read multiple times via getInputStream)
            String content;
            try (InputStream parseStream = file.getInputStream()) {
                content = textParserService.parseText(parseStream, fileName);
            }

            // Create database record
            MedicalDocument document = new MedicalDocument();
            document.setFileName(fileName);
            document.setFileUrl(fileUrl);
            document.setContent(content);
            document.setChunkCount(0);
            document.setStatus(1);

            medicalDocumentMapper.insert(document);

            // Store chunks if text is not empty
            if (content != null && !content.isBlank()) {
                knowledgeEmbeddingService.storeDocumentChunks(content, document.getId());
                // Update chunk count (estimate: ~500 chars per chunk)
                int estimatedChunks = (int) Math.ceil(content.length() / 500.0);
                document.setChunkCount(estimatedChunks);
            }

            return toDocumentVO(document);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to upload document: {}", fileName, e);
            throw BusinessException.fail(ResultCode.INTERNAL_ERROR.getCode(), "文档上传失败: " + e.getMessage());
        }
    }

    public ChatResponse chat(String question) {
        // Search relevant chunks
        List<EmbeddingMatch<TextSegment>> matches = knowledgeEmbeddingService.search(question, 5);

        // Build knowledge context
        StringBuilder contextBuilder = new StringBuilder();
        List<ChatResponse.SourceItem> sources = new ArrayList<>();

        for (EmbeddingMatch<TextSegment> match : matches) {
            TextSegment segment = match.embedded();
            String chunkText = segment.text();

            String fileName = null;
            String documentIdStr = null;
            if (segment.metadata() != null) {
                documentIdStr = segment.metadata().getString("documentId");
            }

            // Try to look up file name from document record
            if (documentIdStr != null) {
                try {
                    Long docId = Long.valueOf(documentIdStr);
                    MedicalDocument doc = medicalDocumentMapper.findById(docId);
                    if (doc != null) {
                        fileName = doc.getFileName();
                    }
                } catch (NumberFormatException ignored) {
                }
            }

            if (fileName == null) {
                fileName = "未知文档";
            }

            contextBuilder.append("【来源：").append(fileName).append("】\n");
            contextBuilder.append(chunkText).append("\n\n");

            sources.add(createSourceItem(fileName, chunkText));
        }

        contextBuilder.append("用户问题：").append(question);

        String prompt = """
            你是一个专业的医学知识助手，请基于以下医学知识库内容回答用户问题。

            知识库内容：
            %s

            请根据上述知识库内容给出专业、准确的回答。如果知识库中没有相关信息，请如实告知。
            回答时请使用中文，保持专业、清晰、易懂的医学沟通风格。
            """.formatted(contextBuilder.toString());

        String answer;
        try {
            answer = chatLanguageModel.generate(prompt);
        } catch (Exception e) {
            log.error("AI chat failed", e);
            answer = "抱歉，AI服务暂时不可用，请稍后重试。";
        }

        ChatResponse response = new ChatResponse();
        response.setAnswer(answer);
        response.setSources(sources);
        return response;
    }

    public List<DocumentVO> listDocuments() {
        List<MedicalDocument> documents = medicalDocumentMapper.findAll();
        return documents.stream()
                .map(this::toDocumentVO)
                .collect(Collectors.toList());
    }

    public void deleteDocument(Long id) {
        MedicalDocument doc = medicalDocumentMapper.findById(id);
        if (doc == null) {
            throw BusinessException.fail(ResultCode.NOT_FOUND.getCode(), "文档不存在");
        }
        medicalDocumentMapper.deleteById(id);
    }

    private DocumentVO toDocumentVO(MedicalDocument doc) {
        DocumentVO vo = new DocumentVO();
        vo.setId(doc.getId());
        vo.setFileName(doc.getFileName());
        vo.setFileUrl(doc.getFileUrl());
        vo.setChunkCount(doc.getChunkCount());
        vo.setCreateTime(doc.getCreateTime());
        return vo;
    }

    private ChatResponse.SourceItem createSourceItem(String fileName, String snippet) {
        ChatResponse.SourceItem item = new ChatResponse.SourceItem();
        item.setFileName(fileName);
        // Limit snippet length
        if (snippet != null && snippet.length() > 200) {
            snippet = snippet.substring(0, 200) + "...";
        }
        item.setSnippet(snippet);
        return item;
    }
}
