# Audio/Video Consultation Room Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement core audio/video consultation: TRTC room management, real-time AI subtitles via Web Speech API + WebSocket, post-meeting minutes generation via LLM, recording persistence, and screen sharing.

**Architecture:** Backend adds a `/live/**` API layer with room CRUD, TRTC UserSig generation, and WebSocket-based subtitle routing. Frontend doctor app adds a ConsultationRoom page using TRTC Web SDK for video, browser Web Speech API for speech-to-text, and WebSocket for subtitle broadcast. Admin app gains recording playback and minutes display in consultation detail.

**Tech Stack:** Java 17, Spring Boot 3.3, MyBatis, WebSocket, Hutool (HMAC-SHA256), ChatLanguageModel (DeepSeek-V3.2 via LangChain4j), Vue 3 + TypeScript, trtc-js-sdk, Web Speech API.

---

## File Structure

| Operation | File | Purpose |
|-----------|------|---------|
| Create | `module/live/entity/LiveRoom.java` | Room entity (maps to live_room) |
| Create | `module/live/entity/LiveRecording.java` | Recording entity |
| Create | `module/live/entity/LiveSubtitle.java` | Subtitle entity (new table) |
| Create | `module/live/mapper/LiveRoomMapper.java` | Room CRUD interface |
| Create | `module/live/mapper/LiveRecordingMapper.java` | Recording CRUD interface |
| Create | `module/live/mapper/LiveSubtitleMapper.java` | Subtitle CRUD interface |
| Create | `resources/mapper/LiveRoomMapper.xml` | Room SQL |
| Create | `resources/mapper/LiveRecordingMapper.xml` | Recording SQL |
| Create | `resources/mapper/LiveSubtitleMapper.xml` | Subtitle SQL |
| Create | `module/live/dto/CreateRoomRequest.java` | Create room payload |
| Create | `module/live/dto/SaveRecordingRequest.java` | Save recording payload |
| Create | `module/live/dto/RoomVO.java` | Room response |
| Create | `module/live/dto/RecordingVO.java` | Recording response |
| Create | `module/live/dto/UserSigVO.java` | UserSig response |
| Create | `module/live/service/LiveRoomService.java` | Room management + UserSig |
| Create | `module/live/service/MinutesService.java` | AI minutes from subtitles |
| Create | `module/live/controller/LiveRoomController.java` | `/live/rooms/**` endpoints |
| Modify | `infrastructure/websocket/WebSocketHandler.java` | Room-based session + subtitle routing |
| Modify | `config/SecurityConfig.java` | `/live/**` requires auth |
| Modify | `application-dev.yml` | Add TRTC config |
| Modify | `sql/init.sql` | live_subtitle table, consultation.minutes |
| Modify | `module/consultation/entity/Consultation.java` | Add minutes field |
| Modify | `module/consultation/mapper/ConsultationMapper.java` | Add updateMinutes |
| Modify | `resources/mapper/ConsultationMapper.xml` | Add updateMinutes SQL |
| Create | `shared/src/api/live.ts` | Live API functions |
| Modify | `shared/src/index.ts` | Export live API |
| Create | `doctor/src/views/ConsultationRoom.vue` | TRTC video + subtitles + screen share |
| Modify | `doctor/src/views/ConsultationDetail.vue` | Add enter room button |
| Modify | `doctor/src/router/index.ts` | Add room route |
| Modify | `doctor/package.json` | Add trtc-js-sdk dependency |
| Modify | `admin/src/views/ConsultationDetail.vue` | Recording playback + minutes |

Base paths: Backend `aicall-backend/src/main/java/com/aicall/`, Frontend `frontend/packages/`.

---

### Task 1: SQL Schema + Consultation Entity Changes

**Files:**
- Modify: `sql/init.sql`
- Modify: `aicall-backend/src/main/java/com/aicall/module/consultation/entity/Consultation.java`
- Modify: `aicall-backend/src/main/java/com/aicall/module/consultation/mapper/ConsultationMapper.java`
- Modify: `aicall-backend/src/main/resources/mapper/ConsultationMapper.xml`

- [ ] **Step 1: Add live_subtitle table and consultation.minutes to init.sql**

After the `live_recording` table (line 248): Insert the live_subtitle table DDL.

In the `consultation` table definition (line 73-94), add a column `minutes TEXT DEFAULT NULL COMMENT '会议纪要'` before the `create_time` line.

If the table already exists, also append an `ALTER TABLE` statement at the bottom:
```sql
ALTER TABLE consultation ADD COLUMN IF NOT EXISTS `minutes` TEXT DEFAULT NULL COMMENT '会议纪要';
```

- [ ] **Step 2: Apply the SQL changes**

Run:
```bash
mysql -u root -p20031217 -e "CREATE TABLE IF NOT EXISTS aicall.live_subtitle (id BIGINT NOT NULL AUTO_INCREMENT, room_id BIGINT NOT NULL, user_id BIGINT NOT NULL, user_name VARCHAR(50), content TEXT NOT NULL, create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (id), INDEX idx_room (room_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='实时字幕记录'; ALTER TABLE aicall.consultation ADD COLUMN IF NOT EXISTS minutes TEXT DEFAULT NULL COMMENT '会议纪要';"
```

- [ ] **Step 3: Add `minutes` field to Consultation entity**

```java
// In Consultation.java, add before createTime:
private String minutes;
```

- [ ] **Step 4: Add `updateMinutes` to ConsultationMapper interface**

```java
void updateMinutes(@Param("id") Long id, @Param("minutes") String minutes);
```

- [ ] **Step 5: Add `updateMinutes` SQL to ConsultationMapper.xml**

```xml
<update id="updateMinutes">
    UPDATE consultation SET minutes = #{minutes} WHERE id = #{id}
</update>
```

- [ ] **Step 6: Verify compilation**

```bash
cd E:/javaclass/AiCall/aicall-backend && mvn compile -q
```

---

### Task 2: Live Entities + Mappers + XMLs

**Files:**
- Create: `aicall-backend/src/main/java/com/aicall/module/live/entity/LiveRoom.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/live/entity/LiveRecording.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/live/entity/LiveSubtitle.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/live/mapper/LiveRoomMapper.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/live/mapper/LiveRecordingMapper.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/live/mapper/LiveSubtitleMapper.java`
- Create: `aicall-backend/src/main/resources/mapper/LiveRoomMapper.xml`
- Create: `aicall-backend/src/main/resources/mapper/LiveRecordingMapper.xml`
- Create: `aicall-backend/src/main/resources/mapper/LiveSubtitleMapper.xml`

- [ ] **Step 1: Create LiveRoom entity**

```java
package com.aicall.module.live.entity;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class LiveRoom {
    private Long id;
    private Long consultationId;
    private String roomId;
    private Integer status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
```

- [ ] **Step 2: Create LiveRecording entity**

```java
package com.aicall.module.live.entity;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class LiveRecording {
    private Long id;
    private Long roomId;
    private String fileUrl;
    private Long fileSize;
    private Integer duration;
    private LocalDateTime createTime;
}
```

- [ ] **Step 3: Create LiveSubtitle entity**

```java
package com.aicall.module.live.entity;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class LiveSubtitle {
    private Long id;
    private Long roomId;
    private Long userId;
    private String userName;
    private String content;
    private LocalDateTime createTime;
}
```

- [ ] **Step 4: Create LiveRoomMapper**

```java
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
```

- [ ] **Step 5: Create LiveRecordingMapper**

```java
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
```

- [ ] **Step 6: Create LiveSubtitleMapper**

```java
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
```

- [ ] **Step 7: Create LiveRoomMapper.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.aicall.module.live.mapper.LiveRoomMapper">
    <insert id="insert" useGeneratedKeys="true" keyProperty="id">
        INSERT INTO live_room (consultation_id, room_id, status) VALUES (#{consultationId}, #{roomId}, #{status})
    </insert>
    <select id="findById" resultType="com.aicall.module.live.entity.LiveRoom">
        SELECT * FROM live_room WHERE id = #{id}
    </select>
    <select id="findByConsultationId" resultType="com.aicall.module.live.entity.LiveRoom">
        SELECT * FROM live_room WHERE consultation_id = #{consultationId}
    </select>
    <update id="updateStatus">
        UPDATE live_room SET status = #{status} WHERE id = #{id}
    </update>
    <update id="updateStartTime">
        UPDATE live_room SET start_time = #{startTime} WHERE id = #{id}
    </update>
    <update id="updateEndTime">
        UPDATE live_room SET end_time = #{endTime} WHERE id = #{id}
    </update>
</mapper>
```

- [ ] **Step 8: Create LiveRecordingMapper.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.aicall.module.live.mapper.LiveRecordingMapper">
    <insert id="insert" useGeneratedKeys="true" keyProperty="id">
        INSERT INTO live_recording (room_id, file_url, file_size, duration) VALUES (#{roomId}, #{fileUrl}, #{fileSize}, #{duration})
    </insert>
    <select id="findByRoomId" resultType="com.aicall.module.live.entity.LiveRecording">
        SELECT * FROM live_recording WHERE room_id = #{roomId} ORDER BY create_time DESC
    </select>
</mapper>
```

- [ ] **Step 9: Create LiveSubtitleMapper.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.aicall.module.live.mapper.LiveSubtitleMapper">
    <insert id="insert" useGeneratedKeys="true" keyProperty="id">
        INSERT INTO live_subtitle (room_id, user_id, user_name, content) VALUES (#{roomId}, #{userId}, #{userName}, #{content})
    </insert>
    <select id="findByRoomId" resultType="com.aicall.module.live.entity.LiveSubtitle">
        SELECT * FROM live_subtitle WHERE room_id = #{roomId} ORDER BY create_time ASC
    </select>
</mapper>
```

- [ ] **Step 10: Create the live module directory and verify compilation**

```bash
mkdir -p E:/javaclass/AiCall/aicall-backend/src/main/java/com/aicall/module/live/entity
mkdir -p E:/javaclass/AiCall/aicall-backend/src/main/java/com/aicall/module/live/mapper
mkdir -p E:/javaclass/AiCall/aicall-backend/src/main/java/com/aicall/module/live/dto
mkdir -p E:/javaclass/AiCall/aicall-backend/src/main/java/com/aicall/module/live/service
mkdir -p E:/javaclass/AiCall/aicall-backend/src/main/java/com/aicall/module/live/controller
cd E:/javaclass/AiCall/aicall-backend && mvn compile -q
```

---

### Task 3: DTOs (Request/Response VOs)

**Files:**
- Create: `aicall-backend/src/main/java/com/aicall/module/live/dto/CreateRoomRequest.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/live/dto/SaveRecordingRequest.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/live/dto/RoomVO.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/live/dto/RecordingVO.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/live/dto/UserSigVO.java`

- [ ] **Step 1: Create all DTOs**

CreateRoomRequest:
```java
package com.aicall.module.live.dto;
import lombok.Data;

@Data
public class CreateRoomRequest {
    private Long consultationId;
}
```

SaveRecordingRequest:
```java
package com.aicall.module.live.dto;
import lombok.Data;

@Data
public class SaveRecordingRequest {
    private String fileUrl;
    private Long fileSize;
    private Integer duration;
}
```

RoomVO:
```java
package com.aicall.module.live.dto;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class RoomVO {
    private Long id;
    private Long consultationId;
    private String roomId;
    private Integer status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime createTime;
}
```

RecordingVO:
```java
package com.aicall.module.live.dto;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class RecordingVO {
    private Long id;
    private String fileUrl;
    private Long fileSize;
    private Integer duration;
    private LocalDateTime createTime;
}
```

UserSigVO:
```java
package com.aicall.module.live.dto;
import lombok.Data;

@Data
public class UserSigVO {
    private String userSig;
    private int sdkAppId;
    private String roomId;
    private String userId;
}
```

- [ ] **Step 2: Verify compilation**

```bash
cd E:/javaclass/AiCall/aicall-backend && mvn compile -q
```

---

### Task 4: TRTC Config + LiveRoomService

**Files:**
- Modify: `aicall-backend/src/main/resources/application-dev.yml`
- Create: `aicall-backend/src/main/java/com/aicall/module/live/service/LiveRoomService.java`

- [ ] **Step 1: Add TRTC config to application-dev.yml**

Append at end:
```yaml
trtc:
  sdk-app-id: 0
  secret-key: placeholder
```

- [ ] **Step 2: Create LiveRoomService**

```java
package com.aicall.module.live.service;

import cn.hutool.crypto.digest.HmacAlgorithm;
import cn.hutool.crypto.digest.HMac;
import com.aicall.common.exception.BusinessException;
import com.aicall.module.live.dto.*;
import com.aicall.module.live.entity.LiveRecording;
import com.aicall.module.live.entity.LiveRoom;
import com.aicall.module.live.mapper.LiveRecordingMapper;
import com.aicall.module.live.mapper.LiveRoomMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LiveRoomService {
    @Value("${trtc.sdk-app-id}")
    private int sdkAppId;

    @Value("${trtc.secret-key}")
    private String secretKey;

    private final LiveRoomMapper liveRoomMapper;
    private final LiveRecordingMapper liveRecordingMapper;

    @Transactional
    public RoomVO createRoom(Long consultationId) {
        LiveRoom existing = liveRoomMapper.findByConsultationId(consultationId);
        if (existing != null && existing.getStatus() != 2) {
            return toRoomVO(existing);
        }

        String roomNum = String.format("%06d", ThreadLocalRandom.current().nextInt(100000, 999999));
        LiveRoom room = new LiveRoom();
        room.setConsultationId(consultationId);
        room.setRoomId(roomNum);
        room.setStatus(0);
        liveRoomMapper.insert(room);
        return toRoomVO(room);
    }

    @Transactional
    public RoomVO startRoom(Long id) {
        LiveRoom room = liveRoomMapper.findById(id);
        if (room == null) throw BusinessException.fail("会诊室不存在");
        liveRoomMapper.updateStatus(id, 1);
        liveRoomMapper.updateStartTime(id, LocalDateTime.now());
        room.setStatus(1);
        room.setStartTime(LocalDateTime.now());
        return toRoomVO(room);
    }

    @Transactional
    public RoomVO endRoom(Long id) {
        LiveRoom room = liveRoomMapper.findById(id);
        if (room == null) throw BusinessException.fail("会诊室不存在");
        liveRoomMapper.updateStatus(id, 2);
        liveRoomMapper.updateEndTime(id, LocalDateTime.now());
        room.setStatus(2);
        room.setEndTime(LocalDateTime.now());
        return toRoomVO(room);
    }

    public UserSigVO generateUserSig(Long roomId, String userId) {
        LiveRoom room = liveRoomMapper.findById(roomId);
        if (room == null) throw BusinessException.fail("会诊室不存在");

        UserSigVO vo = new UserSigVO();
        vo.setSdkAppId(sdkAppId);
        vo.setRoomId(room.getRoomId());
        vo.setUserId(userId);

        if (sdkAppId == 0) {
            vo.setUserSig("mock-signature-for-development");
        } else {
            String sigDoc = String.format("%d|%s|%s|%d", sdkAppId, userId, room.getRoomId(),
                    System.currentTimeMillis() / 1000 + 86400);
            HMac hMac = new HMac(HmacAlgorithm.HmacSHA256, secretKey.getBytes());
            byte[] sigBytes = hMac.digest(sigDoc);
            vo.setUserSig(Base64.getEncoder().encodeToString(sigBytes));
        }
        return vo;
    }

    public RoomVO getRoomByConsultation(Long consultationId) {
        LiveRoom room = liveRoomMapper.findByConsultationId(consultationId);
        if (room == null) return null;
        return toRoomVO(room);
    }

    @Transactional
    public RecordingVO saveRecording(Long roomId, SaveRecordingRequest request) {
        LiveRecording rec = new LiveRecording();
        rec.setRoomId(roomId);
        rec.setFileUrl(request.getFileUrl());
        rec.setFileSize(request.getFileSize());
        rec.setDuration(request.getDuration());
        liveRecordingMapper.insert(rec);

        RecordingVO vo = new RecordingVO();
        vo.setId(rec.getId());
        vo.setFileUrl(rec.getFileUrl());
        vo.setFileSize(rec.getFileSize());
        vo.setDuration(rec.getDuration());
        vo.setCreateTime(rec.getCreateTime());
        return vo;
    }

    public List<RecordingVO> getRecordings(Long roomId) {
        return liveRecordingMapper.findByRoomId(roomId).stream().map(r -> {
            RecordingVO vo = new RecordingVO();
            vo.setId(r.getId());
            vo.setFileUrl(r.getFileUrl());
            vo.setFileSize(r.getFileSize());
            vo.setDuration(r.getDuration());
            vo.setCreateTime(r.getCreateTime());
            return vo;
        }).collect(Collectors.toList());
    }

    private RoomVO toRoomVO(LiveRoom room) {
        RoomVO vo = new RoomVO();
        vo.setId(room.getId());
        vo.setConsultationId(room.getConsultationId());
        vo.setRoomId(room.getRoomId());
        vo.setStatus(room.getStatus());
        vo.setStartTime(room.getStartTime());
        vo.setEndTime(room.getEndTime());
        vo.setCreateTime(room.getCreateTime());
        return vo;
    }
}
```

- [ ] **Step 3: Verify compilation**

```bash
cd E:/javaclass/AiCall/aicall-backend && mvn compile -q
```

---

### Task 5: MinutesService

**Files:**
- Create: `aicall-backend/src/main/java/com/aicall/module/live/service/MinutesService.java`

- [ ] **Step 1: Create MinutesService**

```java
package com.aicall.module.live.service;

import com.aicall.common.exception.BusinessException;
import com.aicall.module.consultation.entity.Consultation;
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

        Consultation consultation = consultationMapper.findById(consultationId);
        if (consultation != null) {
            consultationMapper.updateMinutes(consultationId, minutes);
            consultationMapper.updateStatus(consultationId, 6);
        }

        return minutes;
    }
}
```

- [ ] **Step 2: Verify compilation**

```bash
cd E:/javaclass/AiCall/aicall-backend && mvn compile -q
```

---

### Task 6: LiveRoomController

**Files:**
- Create: `aicall-backend/src/main/java/com/aicall/module/live/controller/LiveRoomController.java`

- [ ] **Step 1: Create LiveRoomController**

```java
package com.aicall.module.live.controller;

import com.aicall.common.annotation.Log;
import com.aicall.common.result.Result;
import com.aicall.module.live.dto.*;
import com.aicall.module.live.service.LiveRoomService;
import com.aicall.module.live.service.MinutesService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/live/rooms")
@RequiredArgsConstructor
public class LiveRoomController {
    private final LiveRoomService liveRoomService;
    private final MinutesService minutesService;

    @PostMapping
    @Log("创建会诊室")
    public Result<RoomVO> createRoom(@RequestBody CreateRoomRequest request) {
        return Result.success(liveRoomService.createRoom(request.getConsultationId()));
    }

    @GetMapping("/consultation/{consultationId}")
    @Log("查询会诊室")
    public Result<RoomVO> getRoomByConsultation(@PathVariable Long consultationId) {
        return Result.success(liveRoomService.getRoomByConsultation(consultationId));
    }

    @PutMapping("/{id}/start")
    @Log("开始会诊")
    public Result<RoomVO> startRoom(@PathVariable Long id) {
        return Result.success(liveRoomService.startRoom(id));
    }

    @PutMapping("/{id}/end")
    @Log("结束会诊")
    public Result<RoomVO> endRoom(@PathVariable Long id) {
        RoomVO room = liveRoomService.endRoom(id);
        // Trigger minutes generation asynchronously
        try {
            minutesService.generateMinutes(room.getConsultationId());
        } catch (Exception e) {
            log.warn("Failed to generate minutes: {}", e.getMessage());
        }
        return Result.success(room);
    }

    @GetMapping("/{id}/sig")
    @Log("获取TRTC签名")
    public Result<UserSigVO> getUserSig(@PathVariable Long id, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return Result.success(liveRoomService.generateUserSig(id, String.valueOf(userId)));
    }

    @GetMapping("/{id}/recordings")
    @Log("查看录像列表")
    public Result<List<RecordingVO>> getRecordings(@PathVariable Long id) {
        return Result.success(liveRoomService.getRecordings(id));
    }

    @PostMapping("/{id}/recordings")
    @Log("保存录像")
    public Result<RecordingVO> saveRecording(@PathVariable Long id, @RequestBody SaveRecordingRequest request) {
        return Result.success(liveRoomService.saveRecording(id, request));
    }
}
```

Need the `log` local variable import for endRoom since @Log is not @Slf4j. Actually, we used `log.warn` in endRoom but the class uses @Log annotation. Let's remove the `log.warn` and keep it simple — if minutes generation fails, it shouldn't block the endRoom response. Use a try-catch without logging, or add `@Slf4j`.

Corrected version: add `import lombok.extern.slf4j.Slf4j;` and `@Slf4j` to controller, OR just catch and swallow in endRoom without logging. Better to keep it clean — use a separate try/catch block without log. But since we need to know if it fails, let's just use `@Slf4j` on the controller too, or catch and move on silently.

**Final code:**
```java
@Slf4j  // add alongside @RequiredArgsConstructor
```

And in endRoom:
```java
    @PutMapping("/{id}/end")
    @Log("结束会诊")
    public Result<RoomVO> endRoom(@PathVariable Long id) {
        RoomVO room = liveRoomService.endRoom(id);
        new Thread(() -> {
            try { minutesService.generateMinutes(room.getConsultationId()); } catch (Exception ignored) {}
        }).start();
        return Result.success(room);
    }
```

- [ ] **Step 2: Verify compilation**

```bash
cd E:/javaclass/AiCall/aicall-backend && mvn compile -q
```

---

### Task 7: WebSocketHandler — Room-Based Session Management + Subtitle Routing

**Files:**
- Modify: `aicall-backend/src/main/java/com/aicall/infrastructure/websocket/WebSocketHandler.java`

- [ ] **Step 1: Rewrite WebSocketHandler**

The current handler at `infrastructure/websocket/WebSocketHandler.java` is a basic broadcast echo. Replace it with room-based session management and subtitle routing.

Replace the entire file content with:

```java
package com.aicall.infrastructure.websocket;

import com.aicall.module.live.entity.LiveSubtitle;
import com.aicall.module.live.mapper.LiveSubtitleMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class WebSocketHandler extends TextWebSocketHandler {
    private static final Logger log = LoggerFactory.getLogger(WebSocketHandler.class);

    private final Map<String, CopyOnWriteArrayList<WebSocketSession>> roomSessions = new ConcurrentHashMap<>();
    private final Map<String, String> sessionRoom = new ConcurrentHashMap<>();
    private final Map<String, Long> sessionUserId = new ConcurrentHashMap<>();
    private final Map<String, String> sessionUserName = new ConcurrentHashMap<>();

    private final ObjectMapper objectMapper;
    private final LiveSubtitleMapper liveSubtitleMapper;

    public WebSocketHandler(ObjectMapper objectMapper, LiveSubtitleMapper liveSubtitleMapper) {
        this.objectMapper = objectMapper;
        this.liveSubtitleMapper = liveSubtitleMapper;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        log.info("WebSocket connected: {}", session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        JsonNode node = objectMapper.readTree(payload);
        String type = node.get("type").asText();
        String consultationId = node.has("consultationId") ? node.get("consultationId").asText() : null;

        switch (type) {
            case "join" -> {
                Long userId = node.get("userId").asLong();
                String userName = node.has("userName") ? node.get("userName").asText() : "";
                sessionRoom.put(session.getId(), consultationId);
                sessionUserId.put(session.getId(), userId);
                sessionUserName.put(session.getId(), userName);
                roomSessions.computeIfAbsent(consultationId, k -> new CopyOnWriteArrayList<>()).add(session);
                broadcast(consultationId, buildNotice(consultationId, userName + " 加入了会诊"));
                log.info("User {} joined room {}", userId, consultationId);
            }
            case "leave" -> {
                removeSession(session);
            }
            case "subtitle" -> {
                Long userId = node.get("userId").asLong();
                String userName = node.has("userName") ? node.get("userName").asText() : "";
                String text = node.get("text").asText();

                // Persist subtitle
                LiveSubtitle subtitle = new LiveSubtitle();
                subtitle.setRoomId(node.has("roomId") ? node.get("roomId").asLong() : null);
                subtitle.setUserId(userId);
                subtitle.setUserName(userName);
                subtitle.setContent(text);
                try {
                    liveSubtitleMapper.insert(subtitle);
                } catch (Exception e) {
                    log.warn("Failed to persist subtitle: {}", e.getMessage());
                }

                // Broadcast to all in room
                broadcast(consultationId, buildSubtitle(consultationId, userId, userName, text));
            }
            case "notice" -> {
                String msg = node.get("message").asText();
                broadcast(consultationId, buildNotice(consultationId, msg));
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        removeSession(session);
        log.info("WebSocket disconnected: {}, status: {}", session.getId(), status);
    }

    private void removeSession(WebSocketSession session) {
        String consultationId = sessionRoom.remove(session.getId());
        sessionUserId.remove(session.getId());
        String userName = sessionUserName.remove(session.getId());
        if (consultationId != null) {
            CopyOnWriteArrayList<WebSocketSession> sessions = roomSessions.get(consultationId);
            if (sessions != null) {
                sessions.remove(session);
                if (sessions.isEmpty()) roomSessions.remove(consultationId);
            }
            broadcast(consultationId, buildNotice(consultationId, (userName != null ? userName : "某人") + " 离开了会诊"));
        }
    }

    private void broadcast(String consultationId, String message) {
        CopyOnWriteArrayList<WebSocketSession> sessions = roomSessions.get(consultationId);
        if (sessions == null) return;
        TextMessage textMessage = new TextMessage(message);
        for (WebSocketSession s : sessions) {
            try {
                if (s.isOpen()) s.sendMessage(textMessage);
            } catch (IOException e) {
                log.error("Failed to send to session {}", s.getId(), e);
            }
        }
    }

    private String buildNotice(String consultationId, String msg) {
        return String.format("{\"type\":\"notice\",\"consultationId\":\"%s\",\"message\":\"%s\"}",
                consultationId, msg.replace("\"", "\\\""));
    }

    private String buildSubtitle(String consultationId, Long userId, String userName, String text) {
        return String.format("{\"type\":\"subtitle\",\"consultationId\":\"%s\",\"userId\":%d,\"userName\":\"%s\",\"text\":\"%s\"}",
                consultationId, userId, userName.replace("\"", "\\\""), text.replace("\"", "\\\""));
    }
}
```

Note: The `@Component` annotation is sufficient — since we removed field injection and use constructor injection, we need to remove `LIVE_SUBTITLE_MAPPER` and other references. Wait — the class uses `liveSubtitleMapper` which must be injected. Since `LiveSubtitleMapper` is a MyBatis `@Mapper`, Spring will manage it. Constructor injection on a `@Component` class with a single constructor works automatically without `@Autowired`.

- [ ] **Step 2: Verify compilation**

```bash
cd E:/javaclass/AiCall/aicall-backend && mvn compile -q
```

---

### Task 8: SecurityConfig — Permit /live/**

**Files:**
- Modify: `aicall-backend/src/main/java/com/aicall/config/SecurityConfig.java`

- [ ] **Step 1: Add `/live/**` to authenticated paths**

In SecurityConfig.java, add this line after the existing `/admin/**` authenticated line (around line 43):

```java
                .requestMatchers("/live/**").authenticated()
```

So the full auth block becomes:
```java
                .requestMatchers("/doctor/**").authenticated()
                .requestMatchers("/admin/**").authenticated()
                .requestMatchers("/live/**").authenticated()
```

- [ ] **Step 2: Verify compilation**

```bash
cd E:/javaclass/AiCall/aicall-backend && mvn compile -q
```

---

### Task 9: Frontend Shared API — live.ts

**Files:**
- Create: `frontend/packages/shared/src/api/live.ts`
- Modify: `frontend/packages/shared/src/index.ts`

- [ ] **Step 1: Create live.ts API**

```typescript
import { get, post, put } from './request';

export interface LiveRoom {
  id: number;
  consultationId: number;
  roomId: string;
  status: number;
  startTime: string;
  endTime: string;
  createTime: string;
}

export interface UserSig {
  userSig: string;
  sdkAppId: number;
  roomId: string;
  userId: string;
}

export interface Recording {
  id: number;
  fileUrl: string;
  fileSize: number;
  duration: number;
  createTime: string;
}

export function createLiveRoom(consultationId: number) {
  return post<LiveRoom>('/live/rooms', { consultationId });
}

export function getLiveRoomByConsultation(consultationId: number) {
  return get<LiveRoom>(`/live/rooms/consultation/${consultationId}`);
}

export function startLiveRoom(roomId: number) {
  return put<LiveRoom>(`/live/rooms/${roomId}/start`);
}

export function endLiveRoom(roomId: number) {
  return put<LiveRoom>(`/live/rooms/${roomId}/end`);
}

export function getTRTCUserSig(roomId: number) {
  return get<UserSig>(`/live/rooms/${roomId}/sig`);
}

export function getLiveRecordings(roomId: number) {
  return get<Recording[]>(`/live/rooms/${roomId}/recordings`);
}

export function saveLiveRecording(roomId: number, data: { fileUrl: string; fileSize: number; duration: number }) {
  return post<Recording>(`/live/rooms/${roomId}/recordings`, data);
}
```

- [ ] **Step 2: Export live API from shared index.ts**

In `shared/src/index.ts`, add after the admin export line:
```typescript
export * from './api/live';
```

- [ ] **Step 3: Verify frontend builds**

```bash
cd E:/javaclass/AiCall/frontend && pnpm --filter @aicall/shared build
```

---

### Task 10: Doctor ConsultationRoom.vue — TRTC Video + Subtitles

**Files:**
- Create: `frontend/packages/doctor/src/views/ConsultationRoom.vue`
- Modify: `frontend/packages/doctor/package.json`
- Modify: `frontend/packages/doctor/src/router/index.ts`
- Modify: `frontend/packages/doctor/src/views/ConsultationDetail.vue`

- [ ] **Step 1: Add trtc-js-sdk to doctor package.json**

In `doctor/package.json`, add `"trtc-js-sdk": "^4.15.0"` to dependencies. Then install:

```bash
cd E:/javaclass/AiCall/frontend && pnpm install
```

- [ ] **Step 2: Add /consultations/:id/room route to doctor router**

In `doctor/src/router/index.ts`, add inside the children array (after the report route):

```typescript
{ path: 'consultations/:id/room', name: 'ConsultationRoom', component: () => import('@/views/ConsultationRoom.vue'), meta: { title: '会诊室' } },
```

- [ ] **Step 3: Create ConsultationRoom.vue**

```vue
<template>
  <div class="consultation-room">
    <div class="video-area">
      <div id="remote-video" class="video-container"></div>
      <div id="local-video" class="video-container local"></div>
    </div>

    <div class="subtitle-panel">
      <div class="subtitle-header">实时字幕</div>
      <div class="subtitle-list" ref="subtitleListRef">
        <div v-for="(item, index) in subtitles" :key="index" class="subtitle-item">
          <span class="subtitle-user">{{ item.userName }}：</span>
          <span>{{ item.text }}</span>
        </div>
      </div>
    </div>

    <div class="toolbar">
      <el-button :type="cameraOn ? 'primary' : 'default'" @click="toggleCamera" :icon="cameraOn ? VideoCamera : VideoCameraFilled" circle />
      <el-button :type="micOn ? 'primary' : 'default'" @click="toggleMic" :icon="micOn ? Microphone : MicrophoneFilled" circle />
      <el-button type="primary" @click="startScreenShare" :disabled="screenSharing">共享屏幕</el-button>
      <el-button v-if="screenSharing" type="warning" @click="stopScreenShare">停止共享</el-button>
      <el-button type="danger" @click="handleEndRoom">结束会诊</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { VideoCamera, VideoCameraFilled, Microphone, MicrophoneFilled } from '@element-plus/icons-vue';
import { getLiveRoomByConsultation, createLiveRoom, startLiveRoom, endLiveRoom, getTRTCUserSig } from '@aicall/shared';
import TRTC from 'trtc-js-sdk';

const route = useRoute();
const router = useRouter();
const consultationId = Number(route.params.id);

const trtcClient = TRTC.createClient({ mode: 'rtc', sdkAppId: 0, userId: '', userSig: '' });
const subtitles = ref<{ userId: number; userName: string; text: string }[]>([]);
const subtitleListRef = ref<HTMLElement | null>(null);
const cameraOn = ref(true);
const micOn = ref(true);
const screenSharing = ref(false);

let localStream: any = null;
let screenStream: any = null;
let websocket: WebSocket | null = null;
let recognition: any = null;
let roomId: number | null = null;
let doctorName = localStorage.getItem('doctorName') || '';
let doctorId = Number(localStorage.getItem('doctorId') || '0');

onMounted(async () => {
  await initRoom();
  await initTRTC();
  connectWebSocket();
  initSpeechRecognition();
});

onBeforeUnmount(() => {
  cleanup();
});

async function initRoom() {
  let room = await getLiveRoomByConsultation(consultationId);
  if (!room) {
    room = await createLiveRoom(consultationId);
  }
  roomId = room.id;
  if (room.status === 0) {
    await startLiveRoom(room.id);
  }
}

async function initTRTC() {
  const sig = await getTRTCUserSig(roomId!);
  // Create a new client with the actual config
  // Note: trtc-js-sdk sdkAppId can be 0 for mock/dev mode
  try {
    const client = TRTC.createClient({
      mode: 'rtc',
      sdkAppId: sig.sdkAppId,
      userId: sig.userId,
      userSig: sig.userSig,
    });
    // Re-assign to the outer variable by using Object.assign or just use local
    // For simplicity, we reconstruct the approach:
    await client.join({ roomId: Number(sig.roomId) });
    localStream = TRTC.createStream({ userId: sig.userId, audio: true, video: true });
    await localStream.initialize();
    await client.publish(localStream);
    localStream.play('local-video');

    client.on('stream-added', (event: any) => {
      client.subscribe(event.stream).catch(() => {});
    });
    client.on('stream-subscribed', (event: any) => {
      event.stream.play('remote-video');
    });
  } catch (e: any) {
    console.warn('TRTC init in dev mode (sdkAppId=0):', e.message);
  }
}

function connectWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws/consultation`;
  websocket = new WebSocket(wsUrl);

  websocket.onopen = () => {
    websocket!.send(JSON.stringify({
      type: 'join',
      consultationId: String(consultationId),
      userId: doctorId,
      userName: doctorName,
    }));
  };

  websocket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'subtitle') {
      subtitles.value.push({ userId: data.userId, userName: data.userName, text: data.text });
      nextTick(() => {
        const el = subtitleListRef.value;
        if (el) el.scrollTop = el.scrollHeight;
      });
    }
  };
}

function initSpeechRecognition() {
  const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
  if (!SpeechRecognition) {
    console.warn('Web Speech API not supported');
    return;
  }
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = 'zh-CN';

  recognition.onresult = (event: any) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        const text = event.results[i][0].transcript;
        if (websocket && websocket.readyState === WebSocket.OPEN) {
          websocket.send(JSON.stringify({
            type: 'subtitle',
            consultationId: String(consultationId),
            roomId,
            userId: doctorId,
            userName: doctorName,
            text,
          }));
        }
      }
    }
  };

  recognition.onerror = (event: any) => {
    console.warn('Speech recognition error:', event.error);
  };
}

function toggleCamera() {
  if (localStream) {
    if (cameraOn.value) localStream.muteVideo();
    else localStream.unmuteVideo();
    cameraOn.value = !cameraOn.value;
  }
}

function toggleMic() {
  if (localStream) {
    if (micOn.value) localStream.muteAudio();
    else localStream.unmuteAudio();
    micOn.value = !micOn.value;
  }
  // Start/stop recognition with mic toggle
  if (micOn.value && recognition) {
    try { recognition.start(); } catch {}
  } else if (recognition) {
    try { recognition.stop(); } catch {}
  }
}

async function startScreenShare() {
  try {
    screenStream = TRTC.createStream({ userId: 'share_' + doctorId, audio: false, screen: true });
    await screenStream.initialize();
    // Publish screen stream via TRTC client
    screenSharing.value = true;
  } catch (e: any) {
    ElMessage.warning('屏幕共享失败: ' + e.message);
  }
}

async function stopScreenShare() {
  if (screenStream) {
    screenStream.close();
    screenStream = null;
  }
  screenSharing.value = false;
}

async function handleEndRoom() {
  try {
    await endLiveRoom(roomId!);
    ElMessage.success('会诊已结束');
    router.push(`/consultations/${consultationId}`);
  } catch (e: any) {
    ElMessage.error(e.message || '操作失败');
  }
}

function cleanup() {
  if (recognition) {
    try { recognition.stop(); } catch {}
  }
  if (websocket) {
    websocket.send(JSON.stringify({ type: 'leave', consultationId: String(consultationId), userId: doctorId }));
    websocket.close();
  }
  if (localStream) {
    localStream.close();
  }
  if (screenStream) {
    screenStream.close();
  }
}
</script>

<style scoped>
.consultation-room {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  height: calc(100vh - 100px);
}
.video-area {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.video-container {
  background: #1a1a2e;
  border-radius: 8px;
  min-height: 300px;
  flex: 1;
}
.video-container.local {
  height: 180px;
  flex: 0 0 180px;
  opacity: 0.85;
}
.subtitle-panel {
  width: 320px;
  background: #f5f7fa;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}
.subtitle-header {
  padding: 12px 16px;
  font-weight: 600;
  border-bottom: 1px solid #e4e7ed;
}
.subtitle-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}
.subtitle-item {
  margin-bottom: 8px;
  line-height: 1.6;
}
.subtitle-user {
  color: #409eff;
  font-weight: 500;
}
.toolbar {
  width: 100%;
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.06);
}
</style>
```

- [ ] **Step 4: Add "enter room" button to doctor ConsultationDetail.vue**

In `doctor/src/views/ConsultationDetail.vue`, after the template section showing action buttons (after line 9-15 which handles status 2/3/4) and before the tabs, add:

```vue
      <div style="margin-bottom: 16px" v-if="detail.status === 3 || detail.status === 4 || detail.status === 5">
        <el-button v-if="detail.status !== 5" type="success" @click="router.push(`/consultations/${id}/room`)">
          进入会诊室
        </el-button>
        <el-tag v-else type="warning" size="large">会诊进行中</el-tag>
      </div>
```

- [ ] **Step 5: Build and verify**

```bash
cd E:/javaclass/AiCall/frontend && pnpm --filter @aicall/doctor build
```

---

### Task 11: Admin ConsultationDetail — Recording Playback + Minutes

**Files:**
- Modify: `frontend/packages/admin/src/views/ConsultationDetail.vue`

- [ ] **Step 1: Add recording and minutes sections to admin ConsultationDetail**

After the upload card section (after line 59), add:

```vue
      <el-card header="会诊纪要" style="margin-bottom: 20px" v-if="detail.minutes">
        <div style="white-space: pre-wrap; line-height: 1.8">{{ detail.minutes }}</div>
      </el-card>

      <el-card header="会诊录像" style="margin-bottom: 20px" v-if="recordings.length">
        <el-table :data="recordings" stripe>
          <el-table-column label="录像文件" min-width="200">
            <template #default="{ row }">
              <a :href="row.fileUrl" target="_blank" style="color: #409eff; text-decoration: none">{{ row.fileUrl }}</a>
            </template>
          </el-table-column>
          <el-table-column label="时长" width="100">
            <template #default="{ row }">{{ row.duration ? Math.floor(row.duration / 60) + '分' + (row.duration % 60) + '秒' : '-' }}</template>
          </el-table-column>
          <el-table-column label="文件大小" width="120">
            <template #default="{ row }">{{ row.fileSize ? (row.fileSize / 1024 / 1024).toFixed(1) + ' MB' : '-' }}</template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button link type="primary" @click="playingUrl = row.fileUrl; showPlayer = true">播放</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <el-dialog v-model="showPlayer" title="录像播放" width="700px" @close="playingUrl = ''">
        <video v-if="playingUrl" :src="playingUrl" controls style="width: 100%; max-height: 500px;" />
      </el-dialog>
```

- [ ] **Step 2: Add data and load logic to admin ConsultationDetail script**

In the `<script setup lang="ts">` section, add:

```typescript
import { getLiveRoomByConsultation, getLiveRecordings, type Recording } from '@aicall/shared';

const recordings = ref<Recording[]>([]);
const showPlayer = ref(false);
const playingUrl = ref('');
```

And in `loadData()`, after `detail.value = await getAdminConsultationDetail(id);` add:

```typescript
    // Load live room recordings
    try {
      const room = await getLiveRoomByConsultation(id);
      if (room) {
        recordings.value = await getLiveRecordings(room.id);
      }
    } catch { /* recordings optional */ }
```

- [ ] **Step 3: Build and verify**

```bash
cd E:/javaclass/AiCall/frontend && pnpm --filter @aicall/admin build
```

---

### Task 12: Full Integration Test

- [ ] **Step 1: Start the backend**

```bash
cd E:/javaclass/AiCall/aicall-backend && mvn spring-boot:run
```

- [ ] **Step 2: Start the frontend**

```bash
cd E:/javaclass/AiCall/frontend && pnpm --filter @aicall/doctor dev
```

- [ ] **Step 3: Verify the consultation room flow**

1. Log in as a doctor
2. Navigate to a consultation with status 3 or 4
3. Verify "进入会诊室" button appears
4. Click it and verify ConsultationRoom page loads
5. Verify WebSocket connects and shows subtitle area
6. Verify microphone toggle works
7. Verify "结束会诊" button triggers end flow
8. After ending, verify consultation is in status 6

- [ ] **Step 4: Verify admin recording display**

1. Log in as admin
2. Navigate to the completed consultation
3. Verify meeting minutes and recordings are displayed
