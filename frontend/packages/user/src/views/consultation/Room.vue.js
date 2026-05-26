/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast, showDialog } from 'vant';
import { getLiveRoomByConsultation, createLiveRoom, getTRTCUserSig, getConsultationDetail, getProfile } from '@aicall/shared';
const route = useRoute();
const router = useRouter();
const consultationId = Number(route.params.id);
const subtitles = ref([]);
const subRef = ref(null);
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
let localStream = null;
let trtcClient = null;
let websocket = null;
let roomId = null;
let reconnectTimer = null;
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
        if (d.doctorName)
            doctorName.value = d.doctorName;
    }
    catch { }
    if (!patientName) {
        try {
            const p = await getProfile();
            patientName = p.name || '';
        }
        catch { }
    }
}
async function initRoom() {
    try {
        let room = await getLiveRoomByConsultation(consultationId);
        if (!room) {
            room = await createLiveRoom(consultationId);
        }
        roomId = room.id;
    }
    catch (e) {
        showToast('创建会诊室失败');
        router.back();
    }
}
async function initTRTC() {
    try {
        const sig = await getTRTCUserSig(roomId);
        if (sig.sdkAppId === 0) {
            console.warn('TRTC SDK not configured, using mock mode');
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
        console.warn('TRTC init:', e.message);
    }
}
function connectWebSocket() {
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    websocket = new WebSocket(`${proto}//${location.host}/api/ws/consultation`);
    websocket.onopen = () => {
        connected.value = true;
        websocket.send(JSON.stringify({
            type: 'join', consultationId: String(consultationId), userId: patientId, userName: patientName,
        }));
    };
    websocket.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.type === 'subtitle') {
            if (data.userName && !doctorName.value && data.userId !== patientId) {
                doctorName.value = data.userName;
            }
            // Skip own messages — already added locally before sending
            if (data.userId === patientId)
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
                if (name && name !== patientName)
                    doctorName.value = name;
            }
            else if (msg.includes('离开了')) {
                const name = msg.replace(' 离开了会诊', '');
                if (name && name !== patientName)
                    connected.value = false;
            }
            subtitles.value.push({ userId: 0, userName: '系统', text: msg });
            nextTick(() => { const el = subRef.value; if (el)
                el.scrollTop = el.scrollHeight; });
        }
    };
    websocket.onclose = () => { connected.value = false; };
}
function sendMessage() {
    const text = inputText.value.trim();
    if (!text)
        return;
    subtitles.value.push({ userId: patientId, userName: patientName, text });
    nextTick(() => { const el = subRef.value; if (el)
        el.scrollTop = el.scrollHeight; });
    if (websocket?.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify({ type: 'subtitle', consultationId: String(consultationId), userId: patientId, userName: patientName, text }));
    }
    inputText.value = '';
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
}
function handleLeave() {
    showDialog({ title: '离开会诊', message: '确定要离开吗？' }).then(() => {
        cleanup();
        router.back();
    }).catch(() => { });
}
function cleanup() {
    if (reconnectTimer)
        clearTimeout(reconnectTimer);
    if (websocket) {
        try {
            if (websocket.readyState === WebSocket.OPEN)
                websocket.send(JSON.stringify({ type: 'leave', consultationId: String(consultationId), userId: patientId }));
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
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['room-page']} */ ;
/** @type {__VLS_StyleScopedClasses['room-page']} */ ;
/** @type {__VLS_StyleScopedClasses['room-page']} */ ;
/** @type {__VLS_StyleScopedClasses['room-page']} */ ;
/** @type {__VLS_StyleScopedClasses['status-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['status-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['remote-video']} */ ;
/** @type {__VLS_StyleScopedClasses['video-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['local-pip']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['input-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['sub-item']} */ ;
/** @type {__VLS_StyleScopedClasses['ctrl-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ctrl-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ctrl-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['hangup']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "room-page" },
});
const __VLS_0 = {}.VanNavBar;
/** @type {[typeof __VLS_components.VanNavBar, typeof __VLS_components.vanNavBar, typeof __VLS_components.VanNavBar, typeof __VLS_components.vanNavBar, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClickLeft': {} },
    title: "会诊室",
    leftArrow: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClickLeft': {} },
    title: "会诊室",
    leftArrow: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClickLeft: (__VLS_ctx.handleLeave)
};
__VLS_3.slots.default;
{
    const { right: __VLS_thisSlot } = __VLS_3.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "status-dot" },
        ...{ class: (__VLS_ctx.connected ? 'online' : 'offline') },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ style: {} },
    });
    (__VLS_ctx.connected ? '已连接' : '等待中');
}
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "video-main" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    id: "remote-video",
    ...{ class: "remote-video" },
});
if (!__VLS_ctx.hasRemote) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "video-placeholder" },
    });
    const __VLS_8 = {}.VanIcon;
    /** @type {[typeof __VLS_components.VanIcon, typeof __VLS_components.vanIcon, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        name: "video-o",
        size: "48",
    }));
    const __VLS_10 = __VLS_9({
        name: "video-o",
        size: "48",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.connected ? '等待医生开启视频...' : '正在连接医生...');
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    id: "local-video",
    ...{ class: "local-pip" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    id: "screen-video",
    ...{ class: "screen-video" },
});
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.screenSharing) }, null, null);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "bottom-panel" },
});
const __VLS_12 = {}.VanTabs;
/** @type {[typeof __VLS_components.VanTabs, typeof __VLS_components.vanTabs, typeof __VLS_components.VanTabs, typeof __VLS_components.vanTabs, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    active: (__VLS_ctx.activeTab),
    shrink: true,
}));
const __VLS_14 = __VLS_13({
    active: (__VLS_ctx.activeTab),
    shrink: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
const __VLS_16 = {}.VanTab;
/** @type {[typeof __VLS_components.VanTab, typeof __VLS_components.vanTab, typeof __VLS_components.VanTab, typeof __VLS_components.vanTab, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    title: "实时字幕",
}));
const __VLS_18 = __VLS_17({
    title: "实时字幕",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "subtitle-area" },
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
        ...{ class: "sub-item" },
        ...{ class: ({ mine: s.userId === __VLS_ctx.patientId }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "sub-speaker" },
    });
    (s.userName || '未知');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "sub-text" },
    });
    (s.text);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-bar" },
});
const __VLS_20 = {}.VanField;
/** @type {[typeof __VLS_components.VanField, typeof __VLS_components.vanField, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.inputText),
    placeholder: "输入消息...",
}));
const __VLS_22 = __VLS_21({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.inputText),
    placeholder: "输入消息...",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
let __VLS_24;
let __VLS_25;
let __VLS_26;
const __VLS_27 = {
    onKeyup: (__VLS_ctx.sendMessage)
};
var __VLS_23;
const __VLS_28 = {}.VanButton;
/** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    ...{ 'onClick': {} },
    size: "small",
    type: "primary",
}));
const __VLS_30 = __VLS_29({
    ...{ 'onClick': {} },
    size: "small",
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
let __VLS_32;
let __VLS_33;
let __VLS_34;
const __VLS_35 = {
    onClick: (__VLS_ctx.sendMessage)
};
__VLS_31.slots.default;
var __VLS_31;
var __VLS_19;
const __VLS_36 = {}.VanTab;
/** @type {[typeof __VLS_components.VanTab, typeof __VLS_components.vanTab, typeof __VLS_components.VanTab, typeof __VLS_components.vanTab, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    title: "会诊信息",
}));
const __VLS_38 = __VLS_37({
    title: "会诊信息",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-area" },
});
const __VLS_40 = {}.VanCellGroup;
/** @type {[typeof __VLS_components.VanCellGroup, typeof __VLS_components.vanCellGroup, typeof __VLS_components.VanCellGroup, typeof __VLS_components.vanCellGroup, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    inset: true,
}));
const __VLS_42 = __VLS_41({
    inset: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
const __VLS_44 = {}.VanCell;
/** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    title: "会诊编号",
    value: (__VLS_ctx.consultationId),
}));
const __VLS_46 = __VLS_45({
    title: "会诊编号",
    value: (__VLS_ctx.consultationId),
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
const __VLS_48 = {}.VanCell;
/** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    title: "医生",
    value: (__VLS_ctx.doctorName || '等待接入'),
}));
const __VLS_50 = __VLS_49({
    title: "医生",
    value: (__VLS_ctx.doctorName || '等待接入'),
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
const __VLS_52 = {}.VanCell;
/** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    title: "状态",
    value: (__VLS_ctx.connected ? '会诊中' : '等待中'),
}));
const __VLS_54 = __VLS_53({
    title: "状态",
    value: (__VLS_ctx.connected ? '会诊中' : '等待中'),
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
var __VLS_43;
var __VLS_39;
var __VLS_15;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "controls" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (__VLS_ctx.toggleCamera) },
    ...{ class: "ctrl-btn" },
    ...{ class: ({ active: __VLS_ctx.cameraOn }) },
});
const __VLS_56 = {}.VanIcon;
/** @type {[typeof __VLS_components.VanIcon, typeof __VLS_components.vanIcon, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    name: (__VLS_ctx.cameraOn ? 'video-o' : 'video-o'),
    size: "24",
}));
const __VLS_58 = __VLS_57({
    name: (__VLS_ctx.cameraOn ? 'video-o' : 'video-o'),
    size: "24",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.cameraOn ? '摄像头' : '已关闭');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (__VLS_ctx.handleLeave) },
    ...{ class: "ctrl-btn hangup" },
});
const __VLS_60 = {}.VanIcon;
/** @type {[typeof __VLS_components.VanIcon, typeof __VLS_components.vanIcon, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    name: "phone-o",
    size: "28",
}));
const __VLS_62 = __VLS_61({
    name: "phone-o",
    size: "28",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (__VLS_ctx.toggleMic) },
    ...{ class: "ctrl-btn" },
    ...{ class: ({ active: __VLS_ctx.micOn }) },
});
const __VLS_64 = {}.VanIcon;
/** @type {[typeof __VLS_components.VanIcon, typeof __VLS_components.vanIcon, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    name: (__VLS_ctx.micOn ? 'audio-o' : 'audio-o'),
    size: "24",
}));
const __VLS_66 = __VLS_65({
    name: (__VLS_ctx.micOn ? 'audio-o' : 'audio-o'),
    size: "24",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.micOn ? '麦克风' : '已静音');
/** @type {__VLS_StyleScopedClasses['room-page']} */ ;
/** @type {__VLS_StyleScopedClasses['status-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['video-main']} */ ;
/** @type {__VLS_StyleScopedClasses['remote-video']} */ ;
/** @type {__VLS_StyleScopedClasses['video-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['local-pip']} */ ;
/** @type {__VLS_StyleScopedClasses['screen-video']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['subtitle-area']} */ ;
/** @type {__VLS_StyleScopedClasses['sub-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['sub-item']} */ ;
/** @type {__VLS_StyleScopedClasses['sub-speaker']} */ ;
/** @type {__VLS_StyleScopedClasses['sub-text']} */ ;
/** @type {__VLS_StyleScopedClasses['input-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['info-area']} */ ;
/** @type {__VLS_StyleScopedClasses['controls']} */ ;
/** @type {__VLS_StyleScopedClasses['ctrl-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ctrl-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['hangup']} */ ;
/** @type {__VLS_StyleScopedClasses['ctrl-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            consultationId: consultationId,
            subtitles: subtitles,
            subRef: subRef,
            inputText: inputText,
            activeTab: activeTab,
            cameraOn: cameraOn,
            micOn: micOn,
            connected: connected,
            hasRemote: hasRemote,
            screenSharing: screenSharing,
            doctorName: doctorName,
            patientId: patientId,
            sendMessage: sendMessage,
            toggleCamera: toggleCamera,
            toggleMic: toggleMic,
            handleLeave: handleLeave,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
