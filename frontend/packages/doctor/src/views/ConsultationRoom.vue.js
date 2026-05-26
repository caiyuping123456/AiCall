/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowLeft, VideoCamera, Microphone, Monitor, Phone, FullScreen } from '@element-plus/icons-vue';
import { getLiveRoomByConsultation, createLiveRoom, startLiveRoom, endLiveRoom, getTRTCUserSig } from '@aicall/shared';
import { getDoctorConsultationDetail } from '@aicall/shared';
const route = useRoute();
const router = useRouter();
const consultationId = Number(route.params.id);
const subtitles = ref([]);
const subRef = ref(null);
const inputText = ref('');
const sideTab = ref('subtitle');
const cameraOn = ref(true);
const micOn = ref(true);
const screenSharing = ref(false);
const connected = ref(false);
const hasRemote = ref(false);
const roomId = ref(null);
const patientName = ref('');
const detail = ref(null);
const startTime = ref(0);
const elapsed = ref('00:00');
const doctorId = Number(localStorage.getItem('doctorId') || '0');
const doctorName = localStorage.getItem('doctorName') || '';
let localStream = null;
let screenStream = null;
let trtcClient = null;
let websocket = null;
let recognition = null;
let timerInterval = null;
let liveRoomId = null;
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
    if (!room)
        room = await createLiveRoom(consultationId);
    liveRoomId = room.id;
    roomId.value = room.roomId;
    if (room.status === 0)
        await startLiveRoom(room.id);
}
async function loadDetail() {
    try {
        detail.value = await getDoctorConsultationDetail(consultationId);
    }
    catch { }
}
async function initTRTC() {
    try {
        const sig = await getTRTCUserSig(liveRoomId);
        if (sig.sdkAppId === 0) {
            console.warn('TRTC SDK not configured');
            return;
        }
        const TRTC = (await import('trtc-js-sdk')).default;
        trtcClient = TRTC.createClient({ mode: 'rtc', sdkAppId: sig.sdkAppId, userId: sig.userId, userSig: sig.userSig });
        trtcClient.on('stream-added', (event) => {
            const uid = String(event.stream.getUserId?.() || event.stream.userId || '');
            if (uid.startsWith('share_')) {
                screenSharing.value = true;
            }
            else {
                hasRemote.value = true;
                connected.value = true;
            }
            trtcClient.subscribe(event.stream).catch((e) => console.warn('subscribe failed:', e.message));
        });
        trtcClient.on('stream-subscribed', (event) => {
            const uid = String(event.stream.getUserId?.() || event.stream.userId || '');
            if (uid.startsWith('share_')) {
                event.stream.play('screen-video');
                screenSharing.value = true;
            }
            else {
                event.stream.play('remote-video');
            }
        });
        trtcClient.on('stream-removed', (event) => {
            const uid = String(event.stream.getUserId?.() || event.stream.userId || '');
            if (!uid.startsWith('share_')) {
                hasRemote.value = false;
            }
            else {
                screenSharing.value = false;
            }
        });
        await trtcClient.join({ roomId: Number(sig.roomId) });
        localStream = TRTC.createStream({ userId: sig.userId, audio: true, video: true });
        await localStream.initialize();
        await trtcClient.publish(localStream);
        localStream.play('local-video');
    }
    catch (e) {
        console.warn('TRTC:', e.message);
    }
}
function connectWebSocket() {
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    websocket = new WebSocket(`${proto}//${location.host}/api/ws/consultation`);
    websocket.onopen = () => {
        connected.value = true;
        websocket.send(JSON.stringify({
            type: 'join', consultationId: String(consultationId), userId: doctorId, userName: doctorName,
        }));
    };
    websocket.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.type === 'subtitle') {
            if (data.userName && !patientName.value && data.userId !== doctorId) {
                patientName.value = data.userName;
            }
            // Skip own messages — already added locally before sending
            if (data.userId === doctorId)
                return;
            subtitles.value.push({ userId: data.userId, userName: data.userName, text: data.text });
            nextTick(() => { const el = subRef.value; if (el)
                el.scrollTop = el.scrollHeight; });
        }
        else if (data.type === 'notice') {
            const msg = data.message || '';
            if (msg.includes('加入了')) {
                connected.value = true;
                const name = msg.replace(' 加入了会诊', '');
                if (name && name !== doctorName)
                    patientName.value = name;
            }
            else if (msg.includes('离开了')) {
                const name = msg.replace(' 离开了会诊', '');
                if (name && name !== doctorName)
                    connected.value = false;
            }
            subtitles.value.push({ userId: 0, userName: '系统', text: msg });
            nextTick(() => { const el = subRef.value; if (el)
                el.scrollTop = el.scrollHeight; });
        }
    };
    websocket.onclose = () => { connected.value = false; };
}
function initSpeechRecognition() {
    const SR = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SR)
        return;
    recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'zh-CN';
    recognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                const text = event.results[i][0].transcript;
                subtitles.value.push({ userId: doctorId, userName: doctorName, text });
                nextTick(() => { const el = subRef.value; if (el)
                    el.scrollTop = el.scrollHeight; });
                if (websocket?.readyState === WebSocket.OPEN) {
                    websocket.send(JSON.stringify({ type: 'subtitle', consultationId: String(consultationId), userId: doctorId, userName: doctorName, text }));
                }
            }
        }
    };
    recognition.onend = () => {
        if (micOn.value) {
            try {
                recognition.start();
            }
            catch { }
        }
    };
    try {
        recognition.start();
    }
    catch { }
}
function toggleCamera() {
    if (localStream) {
        if (cameraOn.value)
            localStream.muteVideo();
        else
            localStream.unmuteVideo();
        cameraOn.value = !cameraOn.value;
    }
}
function toggleMic() {
    if (localStream) {
        if (micOn.value)
            localStream.muteAudio();
        else
            localStream.unmuteAudio();
        micOn.value = !micOn.value;
    }
    if (micOn.value && recognition) {
        try {
            recognition.start();
        }
        catch { }
    }
    else if (recognition) {
        try {
            recognition.stop();
        }
        catch { }
    }
}
function sendMessage() {
    const text = inputText.value.trim();
    if (!text)
        return;
    subtitles.value.push({ userId: doctorId, userName: doctorName, text });
    nextTick(() => { const el = subRef.value; if (el)
        el.scrollTop = el.scrollHeight; });
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
        if (trtcClient)
            await trtcClient.publish(screenStream);
        screenSharing.value = true;
        ElMessage.success('屏幕共享已开始');
    }
    catch (e) {
        ElMessage.warning('屏幕共享失败: ' + e.message);
    }
}
async function stopScreenShare() {
    if (screenStream) {
        await trtcClient?.unpublish(screenStream);
        screenStream.close();
        screenStream = null;
    }
    screenSharing.value = false;
}
async function handleEndRoom() {
    try {
        await ElMessageBox.confirm('确定要结束会诊吗？', '结束会诊', { type: 'warning' });
        await endLiveRoom(liveRoomId);
        cleanup();
        router.push(`/consultations/${consultationId}`);
    }
    catch { }
}
function toggleFullscreen() {
    if (document.fullscreenElement)
        document.exitFullscreen();
    else
        document.documentElement.requestFullscreen();
}
function cleanup() {
    if (timerInterval)
        clearInterval(timerInterval);
    if (recognition) {
        try {
            recognition.stop();
        }
        catch { }
    }
    if (websocket) {
        try {
            if (websocket.readyState === WebSocket.OPEN)
                websocket.send(JSON.stringify({ type: 'leave', consultationId: String(consultationId), userId: doctorId }));
        }
        catch { }
        websocket.close();
    }
    if (localStream) {
        try {
            localStream.close();
        }
        catch { }
    }
    if (screenStream) {
        try {
            screenStream.close();
        }
        catch { }
    }
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['status-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['status-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['remote-video']} */ ;
/** @type {__VLS_StyleScopedClasses['video-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['local-pip']} */ ;
/** @type {__VLS_StyleScopedClasses['side-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['side-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['sub-bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['hangup-btn']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "room-wrap" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
    ...{ class: "room-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-left" },
});
const __VLS_0 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    text: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    text: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (__VLS_ctx.handleEndRoom)
};
__VLS_3.slots.default;
const __VLS_8 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
const __VLS_12 = {}.ArrowLeft;
/** @type {[typeof __VLS_components.ArrowLeft, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
var __VLS_11;
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "header-title" },
});
(__VLS_ctx.patientName || '会诊室');
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "status-badge" },
    ...{ class: (__VLS_ctx.connected ? 'online' : 'offline') },
});
(__VLS_ctx.connected ? '已连接' : '等待患者');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-right" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "room-id" },
});
(__VLS_ctx.roomId || '--');
if (__VLS_ctx.startTime) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "duration" },
    });
    (__VLS_ctx.elapsed);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "room-body" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "video-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    id: "remote-video",
    ...{ class: "remote-video" },
});
if (!__VLS_ctx.hasRemote) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "video-empty" },
    });
    const __VLS_16 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        size: (64),
    }));
    const __VLS_18 = __VLS_17({
        size: (64),
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    __VLS_19.slots.default;
    const __VLS_20 = {}.VideoCamera;
    /** @type {[typeof __VLS_components.VideoCamera, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
    const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
    var __VLS_19;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "video-overlays" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    id: "local-video",
    ...{ class: "local-pip" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    id: "screen-video",
    ...{ class: "screen-view" },
});
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.screenSharing) }, null, null);
__VLS_asFunctionalElement(__VLS_intrinsicElements.aside, __VLS_intrinsicElements.aside)({
    ...{ class: "side-panel" },
});
const __VLS_24 = {}.ElTabs;
/** @type {[typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    modelValue: (__VLS_ctx.sideTab),
    ...{ class: "side-tabs" },
}));
const __VLS_26 = __VLS_25({
    modelValue: (__VLS_ctx.sideTab),
    ...{ class: "side-tabs" },
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
const __VLS_28 = {}.ElTabPane;
/** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    label: "实时字幕",
    name: "subtitle",
}));
const __VLS_30 = __VLS_29({
    label: "实时字幕",
    name: "subtitle",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "subtitle-list" },
    ref: "subRef",
});
/** @type {typeof __VLS_ctx.subRef} */ ;
if (__VLS_ctx.subtitles.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "sub-empty" },
    });
}
for (const [s, i] of __VLS_getVForSourceType((__VLS_ctx.subtitles))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (i),
        ...{ class: "sub-bubble" },
        ...{ class: ({ mine: s.userId === __VLS_ctx.doctorId }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "sub-name" },
    });
    (s.userName || '未知');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "sub-text" },
    });
    (s.text);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-bar" },
});
const __VLS_32 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.inputText),
    placeholder: "输入消息...",
    size: "small",
}));
const __VLS_34 = __VLS_33({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.inputText),
    placeholder: "输入消息...",
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
let __VLS_36;
let __VLS_37;
let __VLS_38;
const __VLS_39 = {
    onKeyup: (__VLS_ctx.sendMessage)
};
var __VLS_35;
const __VLS_40 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    ...{ 'onClick': {} },
    size: "small",
    type: "primary",
}));
const __VLS_42 = __VLS_41({
    ...{ 'onClick': {} },
    size: "small",
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
let __VLS_44;
let __VLS_45;
let __VLS_46;
const __VLS_47 = {
    onClick: (__VLS_ctx.sendMessage)
};
__VLS_43.slots.default;
var __VLS_43;
var __VLS_31;
const __VLS_48 = {}.ElTabPane;
/** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    label: "患者信息",
    name: "info",
}));
const __VLS_50 = __VLS_49({
    label: "患者信息",
    name: "info",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
if (__VLS_ctx.detail) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-panel" },
    });
    const __VLS_52 = {}.ElDescriptions;
    /** @type {[typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        column: (1),
        border: true,
        size: "small",
    }));
    const __VLS_54 = __VLS_53({
        column: (1),
        border: true,
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    __VLS_55.slots.default;
    const __VLS_56 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
        label: "姓名",
    }));
    const __VLS_58 = __VLS_57({
        label: "姓名",
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    __VLS_59.slots.default;
    (__VLS_ctx.detail.patientName);
    var __VLS_59;
    const __VLS_60 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
        label: "年龄",
    }));
    const __VLS_62 = __VLS_61({
        label: "年龄",
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    __VLS_63.slots.default;
    (__VLS_ctx.detail.patientAge);
    var __VLS_63;
    const __VLS_64 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
        label: "性别",
    }));
    const __VLS_66 = __VLS_65({
        label: "性别",
    }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    __VLS_67.slots.default;
    (__VLS_ctx.detail.patientGender);
    var __VLS_67;
    const __VLS_68 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
        label: "科室",
    }));
    const __VLS_70 = __VLS_69({
        label: "科室",
    }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    __VLS_71.slots.default;
    (__VLS_ctx.detail.department);
    var __VLS_71;
    const __VLS_72 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
        label: "主诉",
    }));
    const __VLS_74 = __VLS_73({
        label: "主诉",
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    __VLS_75.slots.default;
    (__VLS_ctx.detail.chiefComplaint);
    var __VLS_75;
    var __VLS_55;
    if (__VLS_ctx.detail.medicalSummary) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ style: {} },
        });
        (__VLS_ctx.detail.medicalSummary);
    }
}
var __VLS_51;
var __VLS_27;
__VLS_asFunctionalElement(__VLS_intrinsicElements.footer, __VLS_intrinsicElements.footer)({
    ...{ class: "room-footer" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "footer-left" },
});
const __VLS_76 = {}.ElTooltip;
/** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    content: (__VLS_ctx.cameraOn ? '关闭摄像头' : '开启摄像头'),
}));
const __VLS_78 = __VLS_77({
    content: (__VLS_ctx.cameraOn ? '关闭摄像头' : '开启摄像头'),
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ onClick: (__VLS_ctx.toggleCamera) },
    ...{ class: "tool-btn" },
    ...{ class: ({ active: __VLS_ctx.cameraOn }) },
});
const __VLS_80 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    size: (22),
}));
const __VLS_82 = __VLS_81({
    size: (22),
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
__VLS_83.slots.default;
const __VLS_84 = {}.VideoCamera;
/** @type {[typeof __VLS_components.VideoCamera, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({}));
const __VLS_86 = __VLS_85({}, ...__VLS_functionalComponentArgsRest(__VLS_85));
var __VLS_83;
var __VLS_79;
const __VLS_88 = {}.ElTooltip;
/** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    content: (__VLS_ctx.micOn ? '静音' : '取消静音'),
}));
const __VLS_90 = __VLS_89({
    content: (__VLS_ctx.micOn ? '静音' : '取消静音'),
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
__VLS_91.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ onClick: (__VLS_ctx.toggleMic) },
    ...{ class: "tool-btn" },
    ...{ class: ({ active: __VLS_ctx.micOn }) },
});
const __VLS_92 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    size: (22),
}));
const __VLS_94 = __VLS_93({
    size: (22),
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
__VLS_95.slots.default;
const __VLS_96 = {}.Microphone;
/** @type {[typeof __VLS_components.Microphone, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({}));
const __VLS_98 = __VLS_97({}, ...__VLS_functionalComponentArgsRest(__VLS_97));
var __VLS_95;
var __VLS_91;
const __VLS_100 = {}.ElTooltip;
/** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    content: (__VLS_ctx.screenSharing ? '停止共享' : '共享屏幕'),
}));
const __VLS_102 = __VLS_101({
    content: (__VLS_ctx.screenSharing ? '停止共享' : '共享屏幕'),
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
__VLS_103.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.screenSharing ? __VLS_ctx.stopScreenShare() : __VLS_ctx.startScreenShare();
        } },
    ...{ class: "tool-btn" },
    ...{ class: ({ active: __VLS_ctx.screenSharing }) },
});
const __VLS_104 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    size: (22),
}));
const __VLS_106 = __VLS_105({
    size: (22),
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
__VLS_107.slots.default;
const __VLS_108 = {}.Monitor;
/** @type {[typeof __VLS_components.Monitor, ]} */ ;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({}));
const __VLS_110 = __VLS_109({}, ...__VLS_functionalComponentArgsRest(__VLS_109));
var __VLS_107;
var __VLS_103;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ onClick: (__VLS_ctx.handleEndRoom) },
    ...{ class: "hangup-btn" },
});
const __VLS_112 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    size: (28),
}));
const __VLS_114 = __VLS_113({
    size: (28),
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
__VLS_115.slots.default;
const __VLS_116 = {}.Phone;
/** @type {[typeof __VLS_components.Phone, ]} */ ;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({}));
const __VLS_118 = __VLS_117({}, ...__VLS_functionalComponentArgsRest(__VLS_117));
var __VLS_115;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "footer-right" },
});
const __VLS_120 = {}.ElTooltip;
/** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
    content: "全屏",
}));
const __VLS_122 = __VLS_121({
    content: "全屏",
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
__VLS_123.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ onClick: (__VLS_ctx.toggleFullscreen) },
    ...{ class: "tool-btn" },
});
const __VLS_124 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
    size: (22),
}));
const __VLS_126 = __VLS_125({
    size: (22),
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
__VLS_127.slots.default;
const __VLS_128 = {}.FullScreen;
/** @type {[typeof __VLS_components.FullScreen, ]} */ ;
// @ts-ignore
const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({}));
const __VLS_130 = __VLS_129({}, ...__VLS_functionalComponentArgsRest(__VLS_129));
var __VLS_127;
var __VLS_123;
/** @type {__VLS_StyleScopedClasses['room-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['room-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-left']} */ ;
/** @type {__VLS_StyleScopedClasses['header-title']} */ ;
/** @type {__VLS_StyleScopedClasses['status-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['header-right']} */ ;
/** @type {__VLS_StyleScopedClasses['room-id']} */ ;
/** @type {__VLS_StyleScopedClasses['duration']} */ ;
/** @type {__VLS_StyleScopedClasses['room-body']} */ ;
/** @type {__VLS_StyleScopedClasses['video-section']} */ ;
/** @type {__VLS_StyleScopedClasses['remote-video']} */ ;
/** @type {__VLS_StyleScopedClasses['video-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['video-overlays']} */ ;
/** @type {__VLS_StyleScopedClasses['local-pip']} */ ;
/** @type {__VLS_StyleScopedClasses['screen-view']} */ ;
/** @type {__VLS_StyleScopedClasses['side-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['side-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['subtitle-list']} */ ;
/** @type {__VLS_StyleScopedClasses['sub-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['sub-bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['sub-name']} */ ;
/** @type {__VLS_StyleScopedClasses['sub-text']} */ ;
/** @type {__VLS_StyleScopedClasses['input-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['info-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['room-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-left']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['hangup-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-right']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ArrowLeft: ArrowLeft,
            VideoCamera: VideoCamera,
            Microphone: Microphone,
            Monitor: Monitor,
            Phone: Phone,
            FullScreen: FullScreen,
            subtitles: subtitles,
            subRef: subRef,
            inputText: inputText,
            sideTab: sideTab,
            cameraOn: cameraOn,
            micOn: micOn,
            screenSharing: screenSharing,
            connected: connected,
            hasRemote: hasRemote,
            roomId: roomId,
            patientName: patientName,
            detail: detail,
            startTime: startTime,
            elapsed: elapsed,
            doctorId: doctorId,
            toggleCamera: toggleCamera,
            toggleMic: toggleMic,
            sendMessage: sendMessage,
            startScreenShare: startScreenShare,
            stopScreenShare: stopScreenShare,
            handleEndRoom: handleEndRoom,
            toggleFullscreen: toggleFullscreen,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
