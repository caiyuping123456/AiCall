package com.aicall.module.ai.service;

import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.EmbeddingMatch;
import dev.langchain4j.data.segment.TextSegment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmbeddingService {
    private final EmbeddingModel embeddingModel;
    private final EmbeddingStore<TextSegment> embeddingStore;

    public void storeDocument(Long consultationId, Long uploadId, String text) {
        TextSegment segment = TextSegment.from(text,
                new dev.langchain4j.data.document.Metadata()
                        .add("consultationId", consultationId)
                        .add("uploadId", uploadId));
        var embedding = embeddingModel.embed(segment).content();
        embeddingStore.add(embedding, segment);
        log.info("Stored embedding for consultationId={}, uploadId={}", consultationId, uploadId);
    }

    public List<EmbeddingMatch<TextSegment>> search(String query, int maxResults) {
        var queryEmbedding = embeddingModel.embed(query).content();
        return embeddingStore.findRelevant(queryEmbedding, maxResults);
    }
}
