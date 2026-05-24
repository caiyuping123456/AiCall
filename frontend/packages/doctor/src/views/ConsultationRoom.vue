<template>
  <div class="room-wrap">
    <header class="room-header">
      <div class="header-left">
        <el-button text @click="handleEndRoom">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <span class="header-title">{{ patientName || '会诊室' }}</span>
        <span class="status-badge" :class="connected ? 'online' : 'offline'">
          {{ connected ? '已连接' : '等待患者' }}
        </span>
      </div>
      <div class="header-right">
        <span class="room-id">房间号: {{ roomId || '--' }}</span>
        <span class="duration" v-if="startTime">{{ elapsed }}</span>
      </div>
    </header>

    <div class="room-body">
      <div class="video-section">
        <div id="remote-video" class="remote-video">
          <div v-if="!hasRemote" class="video-empty">
            <el-icon :size="64"><VideoCamera /></el-icon>
            <p>等待患者加入...</p>
          </div>
        </div>
        <div class="video-overlays">
          <div id="local-video" class="local-pip"></div>
          <div id="screen-video" class="screen-view" v-show="screenSharing"></div>
        </div>
      </div>

      <aside class="side-panel">
        <el-tabs v-model="sideTab" class="side-tabs">
          <el-tab-pane label="实时字幕" name="subtitle">
            <div class="subtitle-list" ref="subRef">
              <div v-if="subtitles.length === 0" class="sub-empty">
                开启麦克风后，语音将实时转写为字幕
              </div>
              <div v-for="(s, i) in subtitles" :key="i"
                   class="sub-bubble" :class="{ mine: s.userId === doctorId }">
                <div class="sub-name">{{ s.userName || '未知' }}</div>
                <div class="sub-text">{{ s.text }}</div>
              </div>
            </div>
            <div class="input-bar">
              <el-input v-model="inputText" placeholder="输入消息..." size="small" @keyup.enter="sendMessage" />
              <el-button size="small" type="primary" @click="sendMessage">发送</el-button>
            </div>
          </el-tab-pane>
          <el-tab-pane label="患者信息" name="info">
            <div class="info-panel" v-if="detail">
              <el-descriptions :column="1" border size="small">
                <el-descriptions-item label="姓名">{{ detail.patientName }}</el-descriptions-item>
                <el-descriptions-item label="年龄">{{ detail.patientAge }}岁</el-descriptions-item>
                <el-descriptions-item label="性别">{{ detail.patientGender }}</el-descriptions-item>
                <el-descriptions-item label="科室">{{ detail.department }}</el-descriptions-item>
                <el-descriptions-item label="主诉">{{ detail.chiefComplaint }}</el-descriptions-item>
              </el-descriptions>
              <div v-if="detail.medicalSummary" style="margin-top:12px">
                <strong>病情摘要</strong>
                <p style="white-space:pre-wrap;margin-top:4px;color:#666;font-size:13px">{{ detail.medicalSummary }}</p>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </aside>
    </div>

    <footer class="room-footer">
      <div class="footer-left">
        <el-tooltip :content="cameraOn ? '关闭摄像头' : '开启摄像头'">
          <span class="tool-btn" :class="{ active: cameraOn }" @click="toggleCamera">
            <el-icon :size="22"><VideoCamera /></el-icon>
          </span>
        </el-tooltip>
        <el-tooltip :content="micOn ? '静音' : '取消静音'">
          <span class="tool-btn" :class="{ active: micOn }" @click="toggleMic">
            <el-icon :size="22"><Microphone /></el-icon>
          </span>
        </el-tooltip>
        <el-tooltip :content="screenSharing ? '停止共享' : '共享屏幕'">
          <span class="tool-btn" :class="{ active: screenSharing }"
                @click="screenSharing ? stopScreenShare() : startScreenShare()">
            <el-icon :size="22"><Monitor /></el-icon>
          </span>
        </el-tooltip>
      </div>
      <span class="hangup-btn" @click="handleEndRoom">
        <el-icon :size="28"><Phone /></el-icon>
      </span>
      <div class="footer-right">
        <el-tooltip content="全屏">
          <span class="tool-btn" @click="toggleFullscreen">
            <el-icon :size="22"><FullScreen /></el-icon>
          </span>
        </el-tooltip>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowLeft, VideoCamera, Microphone, Monitor, Phone, FullScreen } from '@element-plus/icons-vue';
import { getLiveRoomByConsultation, createLiveRoom, startLiveRoom, endLiveRoom, getTRTCUserSig } from '@aicall/shared';
import { getDoctorConsultationDetail } from '@aicall/shared';

const route = useRoute();
const router = useRouter();
const consultationId = Number(route.params.id);

const subtitles = ref<{ userId: number; userName: string; text: string }[]>([]);
const subRef = ref<HTMLElement | null>(null);
const inputText = ref('');
const sideTab = ref('subtitle');
const cameraOn = ref(true);
const micOn = ref(true);
const screenSharing = ref(false);
const connected = ref(false);
const hasRemote = ref(false);
const roomId = ref<string | null>(null);
const patientName = ref('');
const detail = ref<any>(null);
const startTime = ref<number>(0);
const elapsed = ref('00:00');

const doctorId = Number(localStorage.getItem('doctorId') || '0');
const doctorName = localStorage.getItem('doctorName') || '';

let localStream: any = null;
let screenStream: any = null;
let trtcClient: any = null;
let websocket: WebSocket | null = null;
let recognition: any = null;
let timerInterval: any = null;
let liveRoomId: number | null = null;

const connectedText = computed(() => connected.value ? '已连接' : '等待患者');

onMounted(() => init());
onBeforeUnmount(() => cleanup());

async function init() {
  await initRoom();
  await loadDetail();
  connectWebSocket();
  await initTRTC();
  initSpeechRecognition();
  startTime.value = Date.now();
  timerInterval = setInterval(() => {
    const diff = Math.floor((Date.now() - startTime.value) / 1000);
    const m = String(Math.floor(diff / 60)).padStart(2, '0');
    const s = String(diff % 60).padStart(2, '0');
    elapsed.value = `${m}:${s}`;
  }, 1000);
}

async function initRoom() {
  let room = await getLiveRoomByConsultation(consultationId);
  if (!room) room = await createLiveRoom(consultationId);
  liveRoomId = room.id;
  roomId.value = room.roomId;
  if (room.status === 0) await startLiveRoom(room.id);
}

async function loadDetail() {
  try { detail.value = await getDoctorConsultationDetail(consultationId); } catch {}
}

async function initTRTC() {
  try {
    const sig = await getTRTCUserSig(liveRoomId!);
    if (sig.sdkAppId === 0) { console.warn('TRTC SDK not configured'); return; }
    const TRTC = (await import('trtc-js-sdk')).default;
    trtcClient = TRTC.createClient({ mode: 'rtc', sdkAppId: sig.sdkAppId, userId: sig.userId, userSig: sig.userSig });

    trtcClient.on('stream-added', (event: any) => {
      const uid = String(event.stream.getUserId?.() || event.stream.userId || '');
      if (uid.startsWith('share_')) { screenSharing.value = true; }
      else { hasRemote.value = true; connected.value = true; }
      trtcClient.subscribe(event.stream).catch((e: any) => console.warn('subscribe failed:', e.message));
    });
    trtcClient.on('stream-subscribed', (event: any) => {
      const uid = String(event.stream.getUserId?.() || event.stream.userId || '');
      if (uid.startsWith('share_')) { event.stream.play('screen-video'); screenSharing.value = true; }
      else { event.stream.play('remote-video'); }
    });
    trtcClient.on('stream-removed', (event: any) => {
      const uid = String(event.stream.getUserId?.() || event.stream.userId || '');
      if (!uid.startsWith('share_')) { hasRemote.value = false; }
      else { screenSharing.value = false; }
    });

    await trtcClient.join({ roomId: Number(sig.roomId) });

    localStream = TRTC.createStream({ userId: sig.userId, audio: true, video: true });
    await localStream.initialize();
    await trtcClient.publish(localStream);
    localStream.play('local-video');
  } catch (e: any) { console.warn('TRTC:', e.message); }
}

function connectWebSocket() {
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  websocket = new WebSocket(`${proto}//${location.host}/api/ws/consultation`);

  websocket.onopen = () => {
    connected.value = true;
    websocket!.send(JSON.stringify({
      type: 'join', consultationId: String(consultationId), userId: doctorId, userName: doctorName,
    }));
  };
  websocket.onmessage = (e) => {
    const data = JSON.parse(e.data);
    if (data.type === 'subtitle') {
      if (data.userName && !patientName.value && data.userId !== doctorId) {
        patientName.value = data.userName;
      }
      subtitles.value.push({ userId: data.userId, userName: data.userName, text: data.text });
      nextTick(() => { const el = subRef.value; if (el) el.scrollTop = el.scrollHeight; });
    } else if (data.type === 'notice') {
      const msg: string = data.message || '';
      if (msg.includes('加入了')) {
        connected.value = true;
        const name = msg.replace(' 加入了会诊', '');
        if (name && name !== doctorName) patientName.value = name;
      } else if (msg.includes('离开了')) {
        const name = msg.replace(' 离开了会诊', '');
        if (name && name !== doctorName) connected.value = false;
      }
      subtitles.value.push({ userId: 0, userName: '系统', text: msg });
      nextTick(() => { const el = subRef.value; if (el) el.scrollTop = el.scrollHeight; });
    }
  };
  websocket.onclose = () => { connected.value = false; };
}

function initSpeechRecognition() {
  const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
  if (!SR) return;
  recognition = new SR();
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = 'zh-CN';
  recognition.onresult = (event: any) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        const text = event.results[i][0].transcript;
        subtitles.value.push({ userId: doctorId, userName: doctorName, text });
        nextTick(() => { const el = subRef.value; if (el) el.scrollTop = el.scrollHeight; });
        if (websocket?.readyState === WebSocket.OPEN) {
          websocket.send(JSON.stringify({ type: 'subtitle', consultationId: String(consultationId), userId: doctorId, userName: doctorName, text }));
        }
      }
    }
  };
  recognition.onend = () => {
    if (micOn.value) { try { recognition.start(); } catch {} }
  };
  try { recognition.start(); } catch {}
}

function toggleCamera() {
  if (localStream) { if (cameraOn.value) localStream.muteVideo(); else localStream.unmuteVideo(); cameraOn.value = !cameraOn.value; }
}
function toggleMic() {
  if (localStream) { if (micOn.value) localStream.muteAudio(); else localStream.unmuteAudio(); micOn.value = !micOn.value; }
  if (micOn.value && recognition) { try { recognition.start(); } catch {} }
  else if (recognition) { try { recognition.stop(); } catch {} }
}
function sendMessage() {
  const text = inputText.value.trim();
  if (!text) return;
  subtitles.value.push({ userId: doctorId, userName: doctorName, text });
  nextTick(() => { const el = subRef.value; if (el) el.scrollTop = el.scrollHeight; });
  if (websocket?.readyState === WebSocket.OPEN) {
    websocket.send(JSON.stringify({ type: 'subtitle', consultationId: String(consultationId), userId: doctorId, userName: doctorName, text }));
  }
  inputText.value = '';
}

async function startScreenShare() {
  try {
    const TRTC = (await import('trtc-js-sdk')).default;
    screenStream = TRTC.createStream({ userId: 'share_' + doctorId, audio: false, screen: true });
    await screenStream.initialize();
    if (trtcClient) await trtcClient.publish(screenStream);
    screenSharing.value = true;
    ElMessage.success('屏幕共享已开始');
  } catch (e: any) { ElMessage.warning('屏幕共享失败: ' + e.message); }
}
async function stopScreenShare() {
  if (screenStream) { await trtcClient?.unpublish(screenStream); screenStream.close(); screenStream = null; }
  screenSharing.value = false;
}
async function handleEndRoom() {
  try {
    await ElMessageBox.confirm('确定要结束会诊吗？', '结束会诊', { type: 'warning' });
    await endLiveRoom(liveRoomId!);
    cleanup();
    router.push(`/consultations/${consultationId}`);
  } catch {}
}
function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen();
}
function cleanup() {
  if (timerInterval) clearInterval(timerInterval);
  if (recognition) { try { recognition.stop(); } catch {} }
  if (websocket) {
    try { if (websocket.readyState === WebSocket.OPEN) websocket.send(JSON.stringify({ type: 'leave', consultationId: String(consultationId), userId: doctorId })); } catch {}
    websocket.close();
  }
  if (localStream) { try { localStream.close(); } catch {} }
  if (screenStream) { try { screenStream.close(); } catch {} }
}
</script>

<style scoped>
.room-wrap { display:flex; flex-direction:column; height:100vh; background:#0f1923; color:#e0e0e0; }

.room-header { display:flex; justify-content:space-between; align-items:center; padding:0 20px; height:56px; background:rgba(255,255,255,0.04); border-bottom:1px solid rgba(255,255,255,0.08); flex-shrink:0; }
.header-left { display:flex; align-items:center; gap:12px; }
.header-title { font-size:16px; font-weight:600; }
.status-badge { font-size:12px; padding:2px 10px; border-radius:10px; }
.status-badge.online { background:rgba(76,175,80,0.2); color:#81c784; }
.status-badge.offline { background:rgba(255,152,0,0.2); color:#ffb74d; }
.header-right { display:flex; gap:20px; font-size:13px; color:rgba(255,255,255,0.6); }

.room-body { flex:1; display:flex; min-height:0; }
.video-section { flex:1; position:relative; min-width:0; }
.remote-video { width:100%; height:100%; background:#000; }
.remote-video video { width:100%; height:100%; object-fit:contain; }
.video-empty { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); text-align:center; color:rgba(255,255,255,0.4); }
.video-empty p { margin-top:16px; font-size:15px; }
.video-overlays { position:absolute; inset:0; pointer-events:none; }
.local-pip { position:absolute; bottom:16px; right:16px; width:200px; height:140px; border-radius:8px; overflow:hidden; border:2px solid rgba(255,255,255,0.2); background:#1a1a2e; pointer-events:auto; }
.local-pip video { width:100%; height:100%; object-fit:cover; }
.screen-view { position:absolute; top:16px; right:16px; width:40%; border-radius:8px; overflow:hidden; border:2px solid #67c23a; pointer-events:auto; }

.side-panel { width:340px; background:rgba(255,255,255,0.96); color:#333; display:flex; flex-direction:column; flex-shrink:0; }
.side-panel :deep(.el-tabs__header) { margin:0; padding:0 16px; }
.side-panel :deep(.el-tabs__content) { flex:1; overflow:auto; padding:0; }
.subtitle-list { height:calc(100% - 50px); overflow-y:auto; padding:12px 16px; }
.input-bar { display:flex; gap:8px; padding:8px 16px; border-top:1px solid #eee; flex-shrink:0; }
.sub-empty { color:#bbb; text-align:center; padding-top:80px; font-size:14px; }
.sub-bubble { margin-bottom:10px; padding:8px 12px; background:#f5f7fa; border-radius:8px; }
.sub-bubble.mine { background:#e6f7ff; border-left:3px solid #1890ff; }
.sub-name { font-size:12px; color:#409eff; font-weight:500; margin-bottom:2px; }
.sub-text { font-size:13px; line-height:1.5; }
.info-panel { padding:12px 16px; }

.room-footer { display:flex; justify-content:space-between; align-items:center; padding:12px 32px; background:rgba(255,255,255,0.04); border-top:1px solid rgba(255,255,255,0.08); flex-shrink:0; }
.footer-left, .footer-right { display:flex; gap:16px; }
.tool-btn { display:flex; align-items:center; justify-content:center; width:44px; height:44px; border-radius:50%; background:rgba(255,255,255,0.1); color:rgba(255,255,255,0.7); cursor:pointer; transition:all .2s; }
.tool-btn:hover { background:rgba(255,255,255,0.2); }
.tool-btn.active { background:rgba(64,158,255,0.3); color:#409eff; }
.hangup-btn { display:flex; align-items:center; justify-content:center; width:52px; height:52px; border-radius:50%; background:#ff4d4f; color:#fff; cursor:pointer; transition:all .2s; }
.hangup-btn:hover { background:#ff7875; transform:scale(1.05); }
</style>
