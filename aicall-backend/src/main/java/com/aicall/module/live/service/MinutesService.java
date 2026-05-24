package com.aicall.module.live.service;

import com.aicall.common.exception.BusinessException;
import com.aicall.module.consultation.mapper.ConsultationMapper;
import com.aicall.module.live.entity.LiveRoom;
import com.aicall.module.live.entity.LiveSubtitle;
import com.aicall.module.live.mapper.LiveRoomMapper;
import com.aicall.module.live.mapper.LiveSubtitleMapper;
import dev.langchain4j.model.chat.ChatLanguageModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MinutesService {
    private static final String MINUTES_PROMPT = """
            你是一位资深医学会议记录专家。请根据以下MDT多学科会诊的实时转录文字，生成结构化的会诊纪要。

            要求：
            - 使用中文，Markdown格式
            - 提取关键信息，忽略口语化冗余
            - 按以下结构输出：

            ## 会诊纪要

            ### 参与专家
            （列出所有发言者姓名）

            ### 讨论要点
            （按议题归纳）

            ### 诊断意见
            （综合专家意见）

            ### 治疗建议
            （具体方案与分工）

            ### 随访计划
            （后续跟进事项）

            ---
            会诊转录：
            %s
            """;

    private final LiveRoomMapper liveRoomMapper;
    private final LiveSubtitleMapper liveSubtitleMapper;
    private final ConsultationMapper consultationMapper;
    private final ChatLanguageModel chatLanguageModel;

    @Transactional
    public String generateMinutes(Long consultationId) {
        LiveRoom room = liveRoomMapper.findByConsultationId(consultationId);
        if (room == null) throw BusinessException.fail("会诊室不存在");

        List<LiveSubtitle> subtitles = liveSubtitleMapper.findByRoomId(room.getId());
        if (subtitles.isEmpty()) throw BusinessException.fail("没有字幕记录，无法生成纪要");

        String transcript = subtitles.stream()
                .map(s -> s.getUserName() + "：" + s.getContent())
                .collect(Collectors.joining("\n"));

        String prompt = String.format(MINUTES_PROMPT, transcript);
        String minutes = chatLanguageModel.generate(prompt);

        consultationMapper.updateMinutes(consultationId, minutes);
        consultationMapper.updateStatus(consultationId, 6);

        return minutes;
    }
}
