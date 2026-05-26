/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, nextTick } from 'vue';
import { chatWithKnowledge } from '@aicall/shared';
const visible = ref(false);
const input = ref('');
const sending = ref(false);
const messages = ref([]);
const msgListRef = ref();
async function send() {
    const q = input.value.trim();
    if (!q || sending.value)
        return;
    messages.value.push({ role: 'user', content: q });
    input.value = '';
    sending.value = true;
    await nextTick();
    scrollBottom();
    try {
        const res = await chatWithKnowledge(q);
        messages.value.push({ role: 'ai', content: res.answer, sources: res.sources });
    }
    catch (e) {
        messages.value.push({ role: 'ai', content: '抱歉，请求失败：' + (e.message || '未知错误') });
    }
    finally {
        sending.value = false;
        await nextTick();
        scrollBottom();
    }
}
function scrollBottom() {
    if (msgListRef.value) {
        msgListRef.value.scrollTop = msgListRef.value.scrollHeight;
    }
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['msg']} */ ;
/** @type {__VLS_StyleScopedClasses['msg']} */ ;
/** @type {__VLS_StyleScopedClasses['user']} */ ;
/** @type {__VLS_StyleScopedClasses['msg']} */ ;
/** @type {__VLS_StyleScopedClasses['msg-content']} */ ;
/** @type {__VLS_StyleScopedClasses['msg-content']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-input']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chat-widget" },
});
if (!__VLS_ctx.visible) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                if (!(!__VLS_ctx.visible))
                    return;
                __VLS_ctx.visible = true;
            } },
        ...{ class: "chat-fab" },
    });
    const __VLS_0 = {}.VanIcon;
    /** @type {[typeof __VLS_components.VanIcon, typeof __VLS_components.vanIcon, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        name: "chat-o",
        size: "24",
        color: "#fff",
    }));
    const __VLS_2 = __VLS_1({
        name: "chat-o",
        size: "24",
        color: "#fff",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "chat-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "chat-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    const __VLS_4 = {}.VanIcon;
    /** @type {[typeof __VLS_components.VanIcon, typeof __VLS_components.vanIcon, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        ...{ 'onClick': {} },
        name: "cross",
    }));
    const __VLS_6 = __VLS_5({
        ...{ 'onClick': {} },
        name: "cross",
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    let __VLS_8;
    let __VLS_9;
    let __VLS_10;
    const __VLS_11 = {
        onClick: (...[$event]) => {
            if (!!(!__VLS_ctx.visible))
                return;
            __VLS_ctx.visible = false;
        }
    };
    var __VLS_7;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "chat-messages" },
        ref: "msgListRef",
    });
    /** @type {typeof __VLS_ctx.msgListRef} */ ;
    if (__VLS_ctx.messages.length === 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "empty-tip" },
        });
    }
    for (const [msg, idx] of __VLS_getVForSourceType((__VLS_ctx.messages))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (idx),
            ...{ class: (['msg', msg.role]) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "msg-content" },
        });
        (msg.content);
        if (msg.sources && msg.sources.length) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "msg-sources" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "sources-title" },
            });
            for (const [s, si] of __VLS_getVForSourceType((msg.sources))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    key: (si),
                    ...{ class: "source-item" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "source-name" },
                });
                (s.fileName);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "source-snippet" },
                });
                (s.snippet);
            }
        }
    }
    if (__VLS_ctx.sending) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "msg ai" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "msg-content typing" },
        });
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "chat-input" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ onKeyup: (__VLS_ctx.send) },
        placeholder: "请输入医学问题...",
        disabled: (__VLS_ctx.sending),
    });
    (__VLS_ctx.input);
    const __VLS_12 = {}.VanButton;
    /** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        ...{ 'onClick': {} },
        size: "small",
        type: "primary",
        loading: (__VLS_ctx.sending),
        disabled: (!__VLS_ctx.input.trim()),
    }));
    const __VLS_14 = __VLS_13({
        ...{ 'onClick': {} },
        size: "small",
        type: "primary",
        loading: (__VLS_ctx.sending),
        disabled: (!__VLS_ctx.input.trim()),
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    let __VLS_16;
    let __VLS_17;
    let __VLS_18;
    const __VLS_19 = {
        onClick: (__VLS_ctx.send)
    };
    __VLS_15.slots.default;
    var __VLS_15;
}
/** @type {__VLS_StyleScopedClasses['chat-widget']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-fab']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-header']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-messages']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-tip']} */ ;
/** @type {__VLS_StyleScopedClasses['msg-content']} */ ;
/** @type {__VLS_StyleScopedClasses['msg-sources']} */ ;
/** @type {__VLS_StyleScopedClasses['sources-title']} */ ;
/** @type {__VLS_StyleScopedClasses['source-item']} */ ;
/** @type {__VLS_StyleScopedClasses['source-name']} */ ;
/** @type {__VLS_StyleScopedClasses['source-snippet']} */ ;
/** @type {__VLS_StyleScopedClasses['msg']} */ ;
/** @type {__VLS_StyleScopedClasses['ai']} */ ;
/** @type {__VLS_StyleScopedClasses['msg-content']} */ ;
/** @type {__VLS_StyleScopedClasses['typing']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-input']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            visible: visible,
            input: input,
            sending: sending,
            messages: messages,
            msgListRef: msgListRef,
            send: send,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
