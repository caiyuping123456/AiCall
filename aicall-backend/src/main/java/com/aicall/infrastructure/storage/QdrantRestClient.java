package com.aicall.infrastructure.storage;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.langchain4j.data.document.Metadata;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.store.embedding.EmbeddingMatch;
import dev.langchain4j.store.embedding.RelevanceScore;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Qdrant REST API client for vector search.
 * Bypasses the langchain4j-qdrant GRPC bug where stored vectors return empty
 * from getVectors().getVector().getDataList().
 */
@Slf4j
public class QdrantRestClient {
    private final String baseUrl;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public QdrantRestClient(String host, int restPort) {
        this.baseUrl = "http://" + host + ":" + restPort;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public List<EmbeddingMatch<TextSegment>> search(
            String collectionName, float[] queryVector, int limit) {

        try {
            List<Double> vector = new ArrayList<>();
            for (float v : queryVector) {
                vector.add((double) v);
            }

            Map<String, Object> body = Map.of(
                    "vector", vector,
                    "limit", limit,
                    "with_payload", true,
                    "with_vector", true
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            String url = baseUrl + "/collections/" + collectionName + "/points/search";
            Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);

            if (response == null || !"ok".equals(response.get("status"))) {
                log.error("Qdrant search failed: {}", response);
                return Collections.emptyList();
            }

            List<Map<String, Object>> results = objectMapper.convertValue(
                    response.get("result"), new TypeReference<>() {});

            List<EmbeddingMatch<TextSegment>> matches = new ArrayList<>();
            for (Map<String, Object> point : results) {
                EmbeddingMatch<TextSegment> match = toEmbeddingMatch(point);
                if (match != null) {
                    matches.add(match);
                }
            }
            return matches;
        } catch (Exception e) {
            log.error("Qdrant REST search failed", e);
            return Collections.emptyList();
        }
    }

    @SuppressWarnings("unchecked")
    private EmbeddingMatch<TextSegment> toEmbeddingMatch(Map<String, Object> point) {
        try {
            Object idObj = point.get("id");
            String id = idObj != null ? idObj.toString() : "unknown";

            double score = ((Number) point.getOrDefault("score", 0.0)).doubleValue();

            // Parse vector
            List<Double> vectorList = (List<Double>) point.get("vector");
            float[] vector = new float[vectorList.size()];
            for (int i = 0; i < vectorList.size(); i++) {
                vector[i] = vectorList.get(i).floatValue();
            }
            Embedding embedding = Embedding.from(vector);

            // Parse payload
            Map<String, Object> payload = (Map<String, Object>) point.get("payload");
            TextSegment segment = null;
            if (payload != null) {
                String text = (String) payload.get("text_segment");
                Metadata metadata = new Metadata();
                for (Map.Entry<String, Object> entry : payload.entrySet()) {
                    if (!"text_segment".equals(entry.getKey())) {
                        metadata.add(entry.getKey(), entry.getValue());
                    }
                }
                if (text != null) {
                    segment = TextSegment.from(text, metadata);
                }
            }

            return new EmbeddingMatch<>(
                    RelevanceScore.fromCosineSimilarity(score),
                    id,
                    embedding,
                    segment);
        } catch (Exception e) {
            log.warn("Failed to convert Qdrant point to EmbeddingMatch: {}", e.getMessage());
            return null;
        }
    }
}
