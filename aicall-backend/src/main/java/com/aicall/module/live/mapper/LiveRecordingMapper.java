package com.aicall.module.live.mapper;

import com.aicall.module.live.entity.LiveRecording;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface LiveRecordingMapper {
    void insert(LiveRecording recording);

    List<LiveRecording> findByRoomId(@Param("roomId") Long roomId);
}
