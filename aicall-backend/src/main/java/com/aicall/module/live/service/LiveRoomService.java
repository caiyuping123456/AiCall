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
            vo.setUserSig(genTLSSig(userId));
        }
        return vo;
    }

    /**
     * Generate UserSig using TLSSigAPIv2 algorithm.
     * Reference: https://github.com/tencentyun/tls-sig-api-v2-java
     */
    private String genTLSSig(String userId) {
        long currTime = System.currentTimeMillis() / 1000;
        int expire = 86400 * 180; // 180 days

        // 1. Build JSON payload
        String sigDoc = "{"
                + "\"TLS.ver\":\"2.0\","
                + "\"TLS.identifier\":\"" + escapeJson(userId) + "\","
                + "\"TLS.sdkappid\":" + sdkAppId + ","
                + "\"TLS.expire\":" + expire + ","
                + "\"TLS.time\":" + currTime
                + "}";

        // 2. Build sign string (multiline format)
        String signContent = "TLS.identifier:" + userId + "\n"
                + "TLS.sdkappid:" + sdkAppId + "\n"
                + "TLS.time:" + currTime + "\n"
                + "TLS.expire:" + expire + "\n";

        // 3. HMAC-SHA256
        HMac hMac = new HMac(HmacAlgorithm.HmacSHA256, secretKey.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        byte[] sigBytes = hMac.digest(signContent);
        String sig = Base64.getEncoder().encodeToString(sigBytes);

        // 4. Append signature to JSON
        sigDoc = sigDoc.substring(0, sigDoc.length() - 1) + ",\"TLS.sig\":\"" + escapeJson(sig) + "\"}";

        // 5. Deflate compress
        byte[] compressed = deflate(sigDoc.getBytes(java.nio.charset.StandardCharsets.UTF_8));

        // 6. Base64URL encode
        return base64UrlEncode(compressed);
    }

    private byte[] deflate(byte[] data) {
        java.util.zip.Deflater deflater = new java.util.zip.Deflater();
        deflater.setInput(data);
        deflater.finish();
        java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
        byte[] buf = new byte[1024];
        try {
            while (!deflater.finished()) {
                baos.write(buf, 0, deflater.deflate(buf));
            }
        } finally {
            deflater.end();
        }
        return baos.toByteArray();
    }

    private String base64UrlEncode(byte[] data) {
        return Base64.getEncoder().encodeToString(data)
                .replace('+', '*')
                .replace('/', '-')
                .replace('=', '_');
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
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
