package com.aicall.config;

import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import dev.langchain4j.model.openai.OpenAiEmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.qdrant.QdrantEmbeddingStore;
import io.qdrant.client.QdrantClient;
import io.qdrant.client.QdrantGrpcClient;
import io.qdrant.client.grpc.Collections.CreateCollection;
import io.qdrant.client.grpc.Collections.Distance;
import io.qdrant.client.grpc.Collections.VectorParams;
import io.qdrant.client.grpc.Collections.VectorsConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.ExecutionException;

@Slf4j
@Configuration
public class AiConfig {
    @Value("${ai.silicon-flow.base-url}")
    private String baseUrl;

    @Value("${ai.silicon-flow.api-key}")
    private String apiKey;

    @Value("${ai.silicon-flow.chat-model}")
    private String chatModel;

    @Value("${ai.silicon-flow.embedding-model}")
    private String embeddingModelName;

    @Value("${ai.silicon-flow.vision-model}")
    private String visionModel;

    @Value("${ai.qdrant.host}")
    private String qdrantHost;

    @Value("${ai.qdrant.port}")
    private int qdrantPort;

    @Value("${ai.qdrant.collection-name}")
    private String qdrantCollectionName;

    @Bean
    public ChatLanguageModel chatLanguageModel() {
        return OpenAiChatModel.builder()
                .baseUrl(baseUrl)
                .apiKey(apiKey)
                .modelName(chatModel)
                .build();
    }

    @Bean
    @Qualifier("visionModel")
    public ChatLanguageModel visionChatModel() {
        return OpenAiChatModel.builder()
                .baseUrl(baseUrl)
                .apiKey(apiKey)
                .modelName(visionModel)
                .build();
    }

    @Bean
    public EmbeddingModel embeddingModel() {
        return OpenAiEmbeddingModel.builder()
                .baseUrl(baseUrl)
                .apiKey(apiKey)
                .modelName(embeddingModelName)
                .build();
    }

    @Bean
    public EmbeddingStore<TextSegment> embeddingStore(EmbeddingModel embeddingModel) {
        int dimension = embeddingModel.embed("test").content().dimension();
        ensureCollection(dimension);
        return QdrantEmbeddingStore.builder()
                .host(qdrantHost)
                .port(qdrantPort)
                .collectionName(qdrantCollectionName)
                .build();
    }

    private void ensureCollection(int vectorSize) {
        try (QdrantGrpcClient grpcClient = QdrantGrpcClient.newBuilder(qdrantHost, qdrantPort, false).build()) {
            QdrantClient client = new QdrantClient(grpcClient);
            boolean exists = client.getCollectionInfoAsync(qdrantCollectionName).get() != null;
            if (!exists) {
                // never reached — exception thrown if not found
            }
        } catch (Exception e) {
            log.info("Collection '{}' not found, creating with vectorSize={}...", qdrantCollectionName, vectorSize);
            try (QdrantGrpcClient grpcClient = QdrantGrpcClient.newBuilder(qdrantHost, qdrantPort, false).build()) {
                QdrantClient client = new QdrantClient(grpcClient);
                client.createCollectionAsync(
                        CreateCollection.newBuilder()
                                .setCollectionName(qdrantCollectionName)
                                .setVectorsConfig(VectorsConfig.newBuilder()
                                        .setParams(VectorParams.newBuilder()
                                                .setSize(vectorSize)
                                                .setDistance(Distance.Cosine)
                                                .build())
                                        .build())
                                .build()
                ).get();
                log.info("Collection '{}' created successfully", qdrantCollectionName);
            } catch (Exception ex) {
                log.warn("Failed to create collection: {}", ex.getMessage());
            }
        }
    }
}
