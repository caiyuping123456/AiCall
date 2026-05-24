package com.aicall.module.knowledge.service;

import com.aicall.infrastructure.storage.QdrantRestClient;
import dev.langchain4j.data.document.Metadata;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingMatch;
import dev.langchain4j.store.embedding.EmbeddingStore;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class KnowledgeEmbeddingService {
    private final EmbeddingModel embeddingModel;
    private final EmbeddingStore<TextSegment> embeddingStore;
    private final QdrantRestClient qdrantRestClient;
    private final String collectionName;

    public KnowledgeEmbeddingService(EmbeddingModel embeddingModel,
                                     @Qualifier("knowledgeEmbeddingStore") EmbeddingStore<TextSegment> embeddingStore,
                                     QdrantRestClient qdrantRestClient,
                                     @Qualifier("knowledgeCollectionName") String collectionName) {
        this.embeddingModel = embeddingModel;
        this.embeddingStore = embeddingStore;
        this.qdrantRestClient = qdrantRestClient;
        this.collectionName = collectionName;
    }

    public void storeDocumentChunks(String text, Long documentId) {
        if (text == null || text.isBlank()) {
            log.warn("Empty text for documentId={}, skipping embedding", documentId);
            return;
        }

        List<String> chunks = splitText(text, 500, 50);
        List<TextSegment> segments = new ArrayList<>();
        List<Embedding> embeddings = new ArrayList<>();

        for (int i = 0; i < chunks.size(); i++) {
            String chunk = chunks.get(i);
            Metadata metadata = new Metadata()
                    .add("documentId", documentId)
                    .add("chunkIndex", i);
            TextSegment segment = TextSegment.from(chunk, metadata);
            Embedding embedding = embeddingModel.embed(segment).content();

            if (embedding == null || embedding.vector().length == 0) {
                log.warn("Empty embedding for documentId={}, chunkIndex={}, skipping", documentId, i);
                continue;
            }

            segments.add(segment);
            embeddings.add(embedding);
        }

        if (embeddings.isEmpty()) {
            log.error("All embeddings empty for documentId={}, skipping store", documentId);
            return;
        }

        embeddingStore.addAll(embeddings, segments);
        log.info("Stored {} chunks for documentId={}", chunks.size(), documentId);
    }

    public List<EmbeddingMatch<TextSegment>> search(String query, int maxResults) {
        Embedding queryEmbedding = embeddingModel.embed(query).content();
        if (queryEmbedding == null || queryEmbedding.vector().length == 0) {
            log.error("Embedding model returned empty vector for query: '{}'", query);
            return List.of();
        }
        return qdrantRestClient.search(collectionName, queryEmbedding.vector(), maxResults);
    }

    private List<String> splitText(String text, int chunkSize, int overlap) {
        List<String> chunks = new ArrayList<>();
        if (text.length() <= chunkSize) {
            chunks.add(text);
            return chunks;
        }

        int start = 0;
        while (start < text.length()) {
            int end = Math.min(start + chunkSize, text.length());
            chunks.add(text.substring(start, end));
            start += (chunkSize - overlap);
        }

        return chunks;
    }
}
