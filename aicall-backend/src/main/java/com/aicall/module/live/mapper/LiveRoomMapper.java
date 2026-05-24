package com.aicall.module.live.mapper;

import com.aicall.module.live.entity.LiveRoom;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;

@Mapper
public interface LiveRoomMapper {
    void insert(LiveRoom room);

    LiveRoom findById(@Param("id") Long id);

    LiveRoom findByConsultationId(@Param("consultationId") Long consultationId);

    void updateStatus(@Param("id") Long id, @Param("status") Integer status);

    void updateStartTime(@Param("id") Long id, @Param("startTime") LocalDateTime startTime);

    void updateEndTime(@Param("id") Long id, @Param("endTime") LocalDateTime endTime);
}
