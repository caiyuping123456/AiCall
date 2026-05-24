package com.aicall.module.live.mapper;

import com.aicall.module.live.entity.LiveSubtitle;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface LiveSubtitleMapper {
    void insert(LiveSubtitle subtitle);

    List<LiveSubtitle> findByRoomId(@Param("roomId") Long roomId);
}
