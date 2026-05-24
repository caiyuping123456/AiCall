# Sub-project 5: Audio/Video Consultation Room

## Goal

Implement core audio/video consultation: TRTC room management, real-time AI subtitles via Web Speech API + WebSocket, post-meeting minutes generation via LLM, recording persistence, and screen sharing (display only).

## Architecture

Backend adds a `/live/**` API layer with room CRUD, TRTC UserSig generation, and WebSocket-based subtitle routing. Frontend doctor app adds a ConsultationRoom page using TRTC Web SDK for video, browser Web Speech API for speech-to-text, and WebSocket for subtitle broadcast. Admin app gains recording playback and minutes display in consultation detail.

## Tech Stack

- Backend: Spring Boot 3, MyBatis, WebSocket, TRTC UserSig (HMAC-SHA256 via Hutool), ChatLanguageModel (DeepSeek-V3.2)
- Frontend: Vue 3 + TypeScript, trtc-js-sdk, Web Speech API, WebSocket
- Database: existing live_room, live_recording tables + new live_subtitle table

---

## 1. Backend — Room Management

### LiveRoom Entity

Maps to `live_room` table: id, consultation_id, room_id (TRTC room number), status (0=pending, 1=active, 2=ended), start_time, end_time, create_time, update_time.

### LiveRecording Entity

Maps to `live_recording` table: id, room_id, file_url, file_size, duration, create_time.

### LiveSubtitle Entity (new table)

```sql
CREATE TABLE live_subtitle (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    user_name VARCHAR(50),
    content TEXT NOT NULL,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_room (room_id)
);
```

### LiveRoomMapper

- findByConsultationId(consultationId)
- findById(id)
- insert(LiveRoom)
- updateStatus(id, status, startTime/endTime as applicable)

### LiveRecordingMapper

- findByRoomId(roomId)
- insert(LiveRecording)

### LiveSubtitleMapper

- findByRoomId(roomId)
- insert(LiveSubtitle)

### LiveRoomService

- `createRoom(consultationId)` — Generate random TRTC room number (6-digit), set status=0, save to live_room
- `startRoom(roomId)` — Set status=1, record startTime
- `endRoom(roomId)` — Set status=2, record endTime, trigger minutes generation
- `generateUserSig(userId)` — Generate TRTC UserSig using SDKAppID + secret key with HMAC-SHA256
- `getRoomByConsultation(consultationId)` — Query room info
- `saveRecording(roomId, fileUrl, fileSize, duration)` — Save recording record

### TRTC Configuration

`application-dev.yml`:
```yaml
trtc:
  sdk-app-id: 0
  secret-key: placeholder
```

UserSig generation using Hutool HMAC-SHA256, base64-encoded. When sdk-app-id is 0, return a mock sig for development.

## 2. Backend — WebSocket Signaling + Subtitle Routing

### Message Protocol (JSON)

- `join`: `{type:"join", consultationId, userId, userName, role}`
- `leave`: `{type:"leave", consultationId, userId}`
- `subtitle`: `{type:"subtitle", consultationId, userId, userName, text}`
- `notice`: `{type:"notice", consultationId, message}`

### WebSocketHandler Changes

- Manage sessions grouped by consultationId (ConcurrentHashMap<String, CopyOnWriteArrayList<WebSocketSession>>)
- On `join`: add session to consultationId group, broadcast join notice
- On `leave`: remove session, broadcast leave notice
- On `subtitle`: persist to live_subtitle table, broadcast to all sessions in the same consultationId
- On `notice`: broadcast to all sessions in the consultationId
- Backend does NOT do speech recognition — subtitles come from frontend Web Speech API

## 3. Backend — AI Minutes Generation

### MinutesService

- `generateMinutes(consultationId)`:
  1. Load consultation info (patient, chief complaint, medical summary)
  2. Load all live_subtitle records for the room
  3. Concatenate subtitle text as "meeting transcript"
  4. Call ChatLanguageModel with prompt: generate structured meeting minutes in Markdown
  5. Save minutes to consultation table (new `minutes` TEXT column or reuse medical_summary)
  6. Update consultation status to 6 (completed)

### Consultation Table Update

Add `minutes` TEXT column to consultation table:
```sql
ALTER TABLE consultation ADD COLUMN minutes TEXT COMMENT '会议纪要';
```

## 4. Backend — API Layer

### LiveRoomController (`/live/rooms`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /live/rooms | Create room (body: consultationId) |
| GET | /live/rooms/consultation/{id} | Get room by consultationId |
| PUT | /live/rooms/{id}/start | Start consultation |
| PUT | /live/rooms/{id}/end | End consultation (triggers minutes) |
| GET | /live/rooms/{id}/sig | Get TRTC UserSig for current user |
| GET | /live/rooms/{id}/recordings | List recordings for room |
| POST | /live/rooms/{id}/recordings | Save recording (body: fileUrl, fileSize, duration) |

### SecurityConfig

- `/live/**` requires authenticated

## 5. Frontend — Shared API

### shared/src/api/live.ts

```typescript
createLiveRoom(consultationId: number)
getLiveRoomByConsultation(consultationId: number)
startLiveRoom(roomId: number)
endLiveRoom(roomId: number)
getTRTCUserSig(roomId: number)
getLiveRecordings(roomId: number)
saveLiveRecording(roomId: number, data: {...})
```

## 6. Frontend — Doctor Consultation Room

### ConsultationRoom.vue

Layout:
```
+---------------------------+------------------+
|                           |                  |
|     TRTC video area       |   Subtitle panel |
|  (remote + local streams) | (real-time scroll)|
|                           |                  |
+---------------------------+------------------+
|  Toolbar: camera | mic | screen share | end  |
+----------------------------------------------+
```

Features:
- On mount: call getTRTCUserSig, init TRTC client, join room, publish local stream
- Subscribe to remote streams automatically
- Toolbar: toggle camera/mic, screen share (getDisplayMedia), end consultation
- Right panel: Web Speech API recognition → WebSocket broadcast subtitle; listen for incoming subtitles
- On end: call endLiveRoom, TRTC leave room, redirect to consultation detail
- Screen share: use TRTC startScreenShare API (display only, no annotation)

### Dependencies

- `trtc-js-sdk` npm package

### Routing

- `/consultations/:id/room` — Only show "enter room" button when status=3/4/5

## 7. Frontend — Admin Recording Playback

### ConsultationDetail.vue Enhancement

- Add "会诊录像" card at bottom showing recording list (file URL, duration)
- Click to play via `<video>` tag
- Display meeting minutes text if available

## 8. Status Lifecycle Update

```
status=3 (已排期) / status=4 (待会诊)
  → Doctor clicks "进入会诊室" → creates live_room if not exists → status=5 (会诊中)
  → Doctor clicks "结束会诊" → status=6 (已完成) + end live_room + generate minutes
```

Doctor ConsultationDetail page:
- Show "进入会诊室" button when status=3/4
- Show "会诊进行中" badge when status=5

## 9. File List

| Operation | File |
|-----------|------|
| Create | `module/live/entity/LiveRoom.java` |
| Create | `module/live/entity/LiveRecording.java` |
| Create | `module/live/entity/LiveSubtitle.java` |
| Create | `module/live/mapper/LiveRoomMapper.java` |
| Create | `module/live/mapper/LiveRecordingMapper.java` |
| Create | `module/live/mapper/LiveSubtitleMapper.java` |
| Create | `resources/mapper/LiveRoomMapper.xml` |
| Create | `resources/mapper/LiveRecordingMapper.xml` |
| Create | `resources/mapper/LiveSubtitleMapper.xml` |
| Create | `module/live/dto/CreateRoomRequest.java` |
| Create | `module/live/dto/SaveRecordingRequest.java` |
| Create | `module/live/dto/RoomVO.java` |
| Create | `module/live/dto/RecordingVO.java` |
| Create | `module/live/dto/UserSigVO.java` |
| Create | `module/live/service/LiveRoomService.java` |
| Create | `module/live/service/MinutesService.java` |
| Create | `module/live/controller/LiveRoomController.java` |
| Modify | `infrastructure/websocket/WebSocketHandler.java` — room-based session management + subtitle routing |
| Modify | `config/WebSocketConfig.java` — adjust if needed |
| Modify | `config/SecurityConfig.java` — `/live/**` authenticated |
| Modify | `application-dev.yml` — add TRTC config |
| Modify | `sql/init.sql` — add live_subtitle table + consultation.minutes column |
| Create | `shared/src/api/live.ts` |
| Modify | `shared/src/index.ts` — export live API |
| Create | `doctor/src/views/ConsultationRoom.vue` |
| Modify | `doctor/src/views/ConsultationDetail.vue` — add enter room button |
| Modify | `doctor/src/router/index.ts` — add room route |
| Modify | `doctor/package.json` — add trtc-js-sdk |
| Modify | `admin/src/views/ConsultationDetail.vue` — add recording playback and minutes |
