package com.aicall.module.ai.service;

import com.aicall.module.consultation.dto.ChatResponse;
import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.data.message.SystemMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.model.chat.ChatLanguageModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class PreDiagnosisService {
    private static final String CHAT_KEY_PREFIX = "chat:";
    private static final long CHAT_TTL_HOURS = 2;
    private static final int MAX_MESSAGES = 20;
    private static final String SYSTEM_PROMPT = """
            你是一位专业的分诊护士。你需要通过对话收集患者的病情信息。
            请按以下顺序追问：
            1. 主诉：患者最主要的不适是什么？持续多久？
            2. 现病史：症状的详细描述，包括起病缓急、部位、性质、诱因、加重/缓解因素
            3. 既往史：是否有慢性疾病、手术史、住院史
            4. 过敏史：是否有药物或食物过敏

            要求：
            - 每次只问一个问题，语气亲切专业
            - 根据患者回答灵活追问，不要机械地按顺序问
            - 如果患者回答中已包含某个方面的信息，不需要重复追问
            - 当主诉、现病史、既往史、过敏史都已收集到时，回复必须以 [DIAGNOSIS_COMPLETE] 开头，然后给出简短总结
            """;

    private final ChatLanguageModel chatLanguageModel;
    private final RedisTemplate<String, Object> redisTemplate;

    public ChatResponse chat(Long consultationId, String userMessage) {
        String key = CHAT_KEY_PREFIX + consultationId;
        List<ChatMessage> messages = loadMessages(key);

        if (messages.isEmpty()) {
            messages.add(SystemMessage.from(SYSTEM_PROMPT));
        }
        messages.add(UserMessage.from(userMessage));
        trimMessages(messages);

        String aiReply = chatLanguageModel.generate(messages).content().text();
        messages.add(AiMessage.from(aiReply));
        saveMessages(key, messages);

        boolean finished = aiReply.contains("[DIAGNOSIS_COMPLETE]");
        if (finished) {
            aiReply = aiReply.replace("[DIAGNOSIS_COMPLETE]", "").trim();
        }

        return new ChatResponse(aiReply, finished);
    }

    public String getFullConversation(Long consultationId) {
        String key = CHAT_KEY_PREFIX + consultationId;
        List<ChatMessage> messages = loadMessages(key);
        StringBuilder sb = new StringBuilder();
        for (ChatMessage msg : messages) {
            if (msg instanceof SystemMessage) continue;
            if (msg instanceof UserMessage um) {
                sb.append("患者：").append(um.singleText()).append("\n");
            } else if (msg instanceof AiMessage am) {
                sb.append("护士：").append(am.singleText()).append("\n");
            }
        }
        return sb.toString();
    }

    private List<ChatMessage> loadMessages(String key) {
        Object obj = redisTemplate.opsForValue().get(key);
        if (obj == null) return new ArrayList<>();
        if (obj instanceof List<?> list) {
            @SuppressWarnings("unchecked")
            List<ChatMessage> result = (List<ChatMessage>) list;
            return new ArrayList<>(result);
        }
        return new ArrayList<>();
    }

    private void saveMessages(String key, List<ChatMessage> messages) {
        redisTemplate.opsForValue().set(key, messages, CHAT_TTL_HOURS, TimeUnit.HOURS);
    }

    private void trimMessages(List<ChatMessage> messages) {
        while (messages.size() > MAX_MESSAGES + 1) {
            messages.remove(1);
        }
    }
}
