package com.aicall.module.ai.service;

import com.aicall.infrastructure.storage.QdrantRestClient;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.EmbeddingMatch;
import dev.langchain4j.data.segment.TextSegment;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class EmbeddingService {
    private final EmbeddingModel embeddingModel;
    private final EmbeddingStore<TextSegment> embeddingStore;
    private final QdrantRestClient qdrantRestClient;
    private final String collectionName;

    public EmbeddingService(EmbeddingModel embeddingModel,
                            @Qualifier("consultationEmbeddingStore") EmbeddingStore<TextSegment> embeddingStore,
                            QdrantRestClient qdrantRestClient,
                            @Qualifier("consultationCollectionName") String collectionName) {
        this.embeddingModel = embeddingModel;
        this.embeddingStore = embeddingStore;
        this.qdrantRestClient = qdrantRestClient;
        this.collectionName = collectionName;
    }

    public void storeDocument(Long consultationId, Long uploadId, String text) {
        TextSegment segment = TextSegment.from(text,
                new dev.langchain4j.data.document.Metadata()
                        .add("consultationId", consultationId)
                        .add("uploadId", uploadId));
        var embedding = embeddingModel.embed(segment).content();
        if (embedding == null || embedding.vector().length == 0) {
            log.error("Empty embedding for consultationId={}, uploadId={}, skipping store", consultationId, uploadId);
            return;
        }
        embeddingStore.add(embedding, segment);
        log.info("Stored embedding for consultationId={}, uploadId={}", consultationId, uploadId);
    }

    public List<EmbeddingMatch<TextSegment>> search(String query, int maxResults) {
        var queryEmbedding = embeddingModel.embed(query).content();
        if (queryEmbedding == null || queryEmbedding.vector().length == 0) {
            log.error("Embedding model returned empty vector for query: '{}'", query);
            return List.of();
        }
        return qdrantRestClient.search(collectionName, queryEmbedding.vector(), maxResults);
    }
}
