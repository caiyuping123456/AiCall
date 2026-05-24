<template>
  <div class="room-page">
    <van-nav-bar title="会诊室" left-arrow @click-left="handleLeave">
      <template #right>
        <span class="status-dot" :class="connected ? 'online' : 'offline'"></span>
        <span style="font-size:13px;color:#fff">{{ connected ? '已连接' : '等待中' }}</span>
      </template>
    </van-nav-bar>

    <div class="video-main">
      <div id="remote-video" class="remote-video">
        <div v-if="!hasRemote" class="video-placeholder">
          <van-icon name="video-o" size="48" />
          <p>{{ connected ? '等待医生开启视频...' : '正在连接医生...' }}</p>
        </div>
      </div>
      <div id="local-video" class="local-pip"></div>
      <div id="screen-video" class="screen-video" v-show="screenSharing"></div>
    </div>

    <div class="bottom-panel">
      <van-tabs v-model:active="activeTab" shrink>
        <van-tab title="实时字幕">
          <div class="subtitle-area" ref="subRef">
            <div v-if="subtitles.length === 0" class="sub-empty">医生语音将实时转写成字幕...</div>
            <div v-for="(s, i) in subtitles" :key="i" class="sub-item" :class="{ mine: s.userId === patientId }">
              <span class="sub-speaker">{{ s.userName || '未知' }}</span>
              <span class="sub-text">{{ s.text }}</span>
            </div>
          </div>
          <div class="input-bar">
            <van-field v-model="inputText" placeholder="输入消息..." size="small" @keyup.enter="sendMessage" />
            <van-button size="small" type="primary" @click="sendMessage">发送</van-button>
          </div>
        </van-tab>
        <van-tab title="会诊信息">
          <div class="info-area">
            <van-cell-group inset>
              <van-cell title="会诊编号" :value="consultationId" />
              <van-cell title="医生" :value="doctorName || '等待接入'" />
              <van-cell title="状态" :value="connected ? '会诊中' : '等待中'" />
            </van-cell-group>
          </div>
        </van-tab>
      </van-tabs>

      <div class="controls">
        <div class="ctrl-btn" :class="{ active: cameraOn }" @click="toggleCamera">
          <van-icon :name="cameraOn ? 'video-o' : 'video-o'" size="24" />
          <span>{{ cameraOn ? '摄像头' : '已关闭' }}</span>
        </div>
        <div class="ctrl-btn hangup" @click="handleLeave">
          <van-icon name="phone-o" size="28" />
          <span>挂断</span>
        </div>
        <div class="ctrl-btn" :class="{ active: micOn }" @click="toggleMic">
          <van-icon :name="micOn ? 'audio-o' : 'audio-o'" size="24" />
          <span>{{ micOn ? '麦克风' : '已静音' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast, showDialog } from 'vant';
import { getLiveRoomByConsultation, createLiveRoom, getTRTCUserSig, getConsultationDetail, getProfile } from '@aicall/shared';

const route = useRoute();
const router = useRouter();
const consultationId = Number(route.params.id);

const subtitles = ref<{ userId: number; userName: string; text: string }[]>([]);
const subRef = ref<HTMLElement | null>(null);
const inputText = ref('');
const activeTab = ref(0);
const cameraOn = ref(true);
const micOn = ref(true);
const connected = ref(false);
const hasRemote = ref(false);
const screenSharing = ref(false);
const doctorName = ref('');

const patientId = Number(localStorage.getItem('patientId') || '0');
let patientName = localStorage.getItem('patientName') || '';

let localStream: any = null;
let trtcClient: any = null;
let websocket: WebSocket | null = null;
let roomId: number | null = null;
let reconnectTimer: any = null;

onMounted(() => init());
onBeforeUnmount(() => cleanup());

async function init() {
  await initRoom();
  await loadDetail();
  connectWebSocket();
  await initTRTC();
}

async function loadDetail() {
  try {
    const d = await getConsultationDetail(consultationId);
    if (d.doctorName) doctorName.value = d.doctorName;
  } catch {}
  if (!patientName) {
    try {
      const p: any = await getProfile();
      patientName = p.name || '';
    } catch {}
  }
}

async function initRoom() {
  try {
    let room = await getLiveRoomByConsultation(consultationId);
    if (!room) {
      room = await createLiveRoom(consultationId);
    }
    roomId = room.id;
  } catch (e: any) {
    showToast('创建会诊室失败');
    router.back();
  }
}

async function initTRTC() {
  try {
    const sig = await getTRTCUserSig(roomId!);
    if (sig.sdkAppId === 0) {
      console.warn('TRTC SDK not configured, using mock mode');
      return;
    }
    const TRTC = (await import('trtc-js-sdk')).default;
    trtcClient = TRTC.createClient({ mode: 'rtc', sdkAppId: sig.sdkAppId, userId: sig.userId, userSig: sig.userSig });

    trtcClient.on('stream-added', (event: any) => {
      const uid = String(event.stream.getUserId?.() || event.stream.userId || '');
      if (uid.startsWith('share_')) {
        screenSharing.value = true;
      } else {
        hasRemote.value = true;
        connected.value = true;
      }
      trtcClient.subscribe(event.stream).catch((e: any) => console.warn('subscribe failed:', e.message));
    });
    trtcClient.on('stream-subscribed', (event: any) => {
      const uid = String(event.stream.getUserId?.() || event.stream.userId || '');
      if (uid.startsWith('share_')) {
        event.stream.play('screen-video');
        screenSharing.value = true;
      } else {
        event.stream.play('remote-video');
      }
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
  } catch (e: any) {
    console.warn('TRTC init:', e.message);
  }
}

function connectWebSocket() {
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  websocket = new WebSocket(`${proto}//${location.host}/api/ws/consultation`);

  websocket.onopen = () => {
    connected.value = true;
    websocket!.send(JSON.stringify({
      type: 'join', consultationId: String(consultationId), userId: patientId, userName: patientName,
    }));
  };
  websocket.onmessage = (e) => {
    const data = JSON.parse(e.data);
    if (data.type === 'subtitle') {
      if (data.userName && !doctorName.value && data.userId !== patientId) {
        doctorName.value = data.userName;
      }
      subtitles.value.push({ userId: data.userId, userName: data.userName, text: data.text });
      nextTick(() => { const el = subRef.value; if (el) el.scrollTop = el.scrollHeight; });
    } else if (data.type === 'notice') {
      const msg: string = data.message || '';
      if (msg.includes('加入了')) {
        connected.value = true;
        const name = msg.replace(' 加入了会诊', '');
        if (name && name !== patientName) doctorName.value = name;
      } else if (msg.includes('离开了')) {
        const name = msg.replace(' 离开了会诊', '');
        if (name && name !== patientName) connected.value = false;
      }
      subtitles.value.push({ userId: 0, userName: '系统', text: msg });
      nextTick(() => { const el = subRef.value; if (el) el.scrollTop = el.scrollHeight; });
    }
  };
  websocket.onclose = () => { connected.value = false; };
}

function sendMessage() {
  const text = inputText.value.trim();
  if (!text) return;
  subtitles.value.push({ userId: patientId, userName: patientName, text });
  nextTick(() => { const el = subRef.value; if (el) el.scrollTop = el.scrollHeight; });
  if (websocket?.readyState === WebSocket.OPEN) {
    websocket.send(JSON.stringify({ type: 'subtitle', consultationId: String(consultationId), userId: patientId, userName: patientName, text }));
  }
  inputText.value = '';
}

function toggleCamera() {
  if (localStream) {
    if (cameraOn.value) localStream.muteVideo(); else localStream.unmuteVideo();
    cameraOn.value = !cameraOn.value;
  }
}
function toggleMic() {
  if (localStream) {
    if (micOn.value) localStream.muteAudio(); else localStream.unmuteAudio();
    micOn.value = !micOn.value;
  }
}
function handleLeave() {
  showDialog({ title: '离开会诊', message: '确定要离开吗？' }).then(() => {
    cleanup();
    router.back();
  }).catch(() => {});
}
function cleanup() {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  if (websocket) {
    try { if (websocket.readyState === WebSocket.OPEN) websocket.send(JSON.stringify({ type: 'leave', consultationId: String(consultationId), userId: patientId })); } catch {}
    websocket.close();
  }
  if (localStream) { try { localStream.close(); } catch {} }
}
</script>

<style scoped>
.room-page { display:flex; flex-direction:column; height:100vh; background:linear-gradient(180deg, #0f1923 0%, #1a2a3a 100%); }
.room-page :deep(.van-nav-bar) { background:transparent; }
.room-page :deep(.van-nav-bar__title) { color:#fff; }
.room-page :deep(.van-nav-bar__arrow) { color:#fff; }
.room-page :deep(.van-hairline--bottom:after) { border-color:rgba(255,255,255,0.1); }
.status-dot { display:inline-block; width:8px; height:8px; border-radius:50%; margin-right:4px; }
.status-dot.online { background:#4caf50; box-shadow:0 0 6px #4caf50; }
.status-dot.offline { background:#ff9800; animation:pulse 1.5s infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

.video-main { flex:1; position:relative; min-height:0; }
.remote-video { width:100%; height:100%; background:#000; }
.remote-video video { width:100%; height:100%; object-fit:cover; }
.video-placeholder { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); text-align:center; color:rgba(255,255,255,0.6); }
.video-placeholder p { margin-top:12px; font-size:14px; }
.local-pip { position:absolute; top:12px; right:12px; width:100px; height:140px; border-radius:8px; overflow:hidden; border:2px solid rgba(255,255,255,0.3); z-index:10; background:#1a1a2e; }
.local-pip video { width:100%; height:100%; object-fit:cover; }
.screen-video { position:absolute; bottom:8px; left:8px; width:60%; border-radius:8px; overflow:hidden; border:2px solid #67c23a; z-index:10; }

.bottom-panel { flex:0 0 auto; background:rgba(255,255,255,0.95); border-radius:16px 16px 0 0; display:flex; flex-direction:column; max-height:50vh; }
.bottom-panel :deep(.van-tabs__content) { flex:1; overflow:auto; }
.subtitle-area { height:160px; overflow-y:auto; padding:8px 16px; }
.input-bar { display:flex; gap:8px; padding:4px 16px 8px; align-items:center; }
.input-bar :deep(.van-field) { flex:1; background:#f5f7fa; border-radius:8px; padding:4px 10px; }
.sub-empty { color:#999; text-align:center; padding-top:60px; font-size:14px; }
.sub-item { margin-bottom:6px; padding:6px 10px; background:#f5f7fa; border-radius:8px; font-size:13px; line-height:1.5; }
.sub-item.mine { background:#e6f7ff; border-left:3px solid #1890ff; }
.sub-speaker { color:#409eff; font-weight:500; margin-right:6px; }
.info-area { padding:12px 0; }

.controls { display:flex; justify-content:space-around; align-items:center; padding:12px 20px 20px; border-top:1px solid #f0f0f0; }
.ctrl-btn { display:flex; flex-direction:column; align-items:center; gap:4px; padding:10px 16px; border-radius:12px; background:#f5f7fa; color:#666; cursor:pointer; transition:all .2s; font-size:12px; }
.ctrl-btn.active { background:#e6f7ff; color:#1890ff; }
.ctrl-btn.hangup { background:#ff4d4f; color:#fff; padding:12px 20px; border-radius:50%; }
.ctrl-btn.hangup:hover { background:#ff7875; }
</style>
