package com.aicall.module.notification.mapper;

import com.aicall.module.notification.entity.Notification;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface NotificationMapper {
    void insert(Notification notification);

    List<Notification> findByUserId(@Param("userType") Integer userType, @Param("userId") Long userId,
                                    @Param("offset") int offset, @Param("size") int size);

    long countByUserId(@Param("userType") Integer userType, @Param("userId") Long userId);

    long countUnread(@Param("userType") Integer userType, @Param("userId") Long userId);

    void updateStatus(@Param("id") Long id, @Param("status") Integer status);
}
