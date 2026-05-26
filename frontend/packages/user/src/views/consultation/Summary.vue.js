/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import { getSummary, updateSummary } from '@aicall/shared';
import { useConsultationFlowStore } from '@/stores/consultationFlow';
const route = useRoute();
const router = useRouter();
const flow = useConsultationFlowStore();
const summary = ref('');
const loading = ref(false);
const generating = ref(false);
// If accessed with a consultation ID, load from API (legacy/external navigation)
// Otherwise use Pinia store (new flow)
const hasConsultationId = !!route.params.id;
function goBack() {
    if (hasConsultationId) {
        // Registration flow: back to doctor detail
        router.back();
    }
    else {
        // Full flow: back to chat or form
        router.back();
    }
}
const MAX_RETRIES = 30; // 30 retries × 2s = 60s max wait
let retryCount = 0;
let pollTimer = null;
onMounted(() => {
    if (hasConsultationId) {
        retryCount = 0;
        fetchSummary();
    }
    else {
        // Load from Pinia store for the new flow
        if (flow.state.medicalSummary) {
            summary.value = flow.state.medicalSummary;
        }
        else if (flow.state.chatHistory.length > 0) {
            generating.value = true;
            setTimeout(() => {
                summary.value = buildSummaryFromChat(flow.state.chatHistory);
                generating.value = false;
            }, 1500);
        }
        else {
            summary.value = flow.state.chiefComplaint
                ? `主诉：${flow.state.chiefComplaint}`
                : '';
        }
    }
});
onUnmounted(() => {
    if (pollTimer !== null) {
        clearTimeout(pollTimer);
        pollTimer = null;
    }
});
function buildSummaryFromChat(chat) {
    const userMessages = chat.filter(m => m.role === 'user').map(m => m.content);
    return [
        '主诉：' + (flow.state.chiefComplaint || userMessages[0] || ''),
        ...userMessages.slice(1).map((m, i) => `补充信息${i + 1}：${m}`),
    ].join('\n');
}
async function fetchSummary() {
    if (!hasConsultationId)
        return;
    const consultationId = Number(route.params.id);
    try {
        const result = await getSummary(consultationId);
        if (result) {
            summary.value = result;
            generating.value = false;
        }
        else {
            generating.value = true;
            retryCount++;
            if (retryCount > MAX_RETRIES) {
                generating.value = false;
                showToast('摘要生成时间较长，请稍后刷新页面查看');
                return;
            }
            pollTimer = setTimeout(fetchSummary, 2000);
        }
    }
    catch (e) {
        showToast(e.message || '获取摘要失败');
        generating.value = false;
    }
}
async function confirm() {
    if (!summary.value) {
        showToast('摘要不能为空');
        return;
    }
    loading.value = true;
    if (hasConsultationId) {
        // Registration flow: save summary, store ID, then continue to upload → pay
        const consultationId = Number(route.params.id);
        try {
            await updateSummary(consultationId, summary.value);
            flow.setMedicalSummary(summary.value);
            flow.setConsultationId(consultationId);
            flow.nextStep(4);
            router.push('/consultation/upload');
        }
        catch (e) {
            showToast(e.message || '保存失败');
        }
    }
    else {
        // New flow: store in Pinia and continue
        flow.setMedicalSummary(summary.value);
        flow.nextStep(4);
        router.push('/consultation/upload');
    }
    loading.value = false;
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page" },
});
const __VLS_0 = {}.VanNavBar;
/** @type {[typeof __VLS_components.VanNavBar, typeof __VLS_components.vanNavBar, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClickLeft': {} },
    title: "病情摘要",
    leftArrow: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClickLeft': {} },
    title: "病情摘要",
    leftArrow: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClickLeft: (__VLS_ctx.goBack)
};
var __VLS_3;
const __VLS_8 = {}.VanSteps;
/** @type {[typeof __VLS_components.VanSteps, typeof __VLS_components.vanSteps, typeof __VLS_components.VanSteps, typeof __VLS_components.vanSteps, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    active: (2),
    activeColor: "#1989fa",
}));
const __VLS_10 = __VLS_9({
    active: (2),
    activeColor: "#1989fa",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
const __VLS_12 = {}.VanStep;
/** @type {[typeof __VLS_components.VanStep, typeof __VLS_components.vanStep, typeof __VLS_components.VanStep, typeof __VLS_components.vanStep, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
var __VLS_15;
const __VLS_16 = {}.VanStep;
/** @type {[typeof __VLS_components.VanStep, typeof __VLS_components.vanStep, typeof __VLS_components.VanStep, typeof __VLS_components.vanStep, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({}));
const __VLS_18 = __VLS_17({}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
var __VLS_19;
const __VLS_20 = {}.VanStep;
/** @type {[typeof __VLS_components.VanStep, typeof __VLS_components.vanStep, typeof __VLS_components.VanStep, typeof __VLS_components.vanStep, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
var __VLS_23;
const __VLS_24 = {}.VanStep;
/** @type {[typeof __VLS_components.VanStep, typeof __VLS_components.vanStep, typeof __VLS_components.VanStep, typeof __VLS_components.vanStep, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
var __VLS_27;
const __VLS_28 = {}.VanStep;
/** @type {[typeof __VLS_components.VanStep, typeof __VLS_components.vanStep, typeof __VLS_components.VanStep, typeof __VLS_components.vanStep, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({}));
const __VLS_30 = __VLS_29({}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
var __VLS_31;
const __VLS_32 = {}.VanStep;
/** @type {[typeof __VLS_components.VanStep, typeof __VLS_components.vanStep, typeof __VLS_components.VanStep, typeof __VLS_components.vanStep, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({}));
const __VLS_34 = __VLS_33({}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
var __VLS_35;
var __VLS_11;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content" },
});
if (__VLS_ctx.generating) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "generating" },
    });
    const __VLS_36 = {}.VanLoading;
    /** @type {[typeof __VLS_components.VanLoading, typeof __VLS_components.vanLoading, typeof __VLS_components.VanLoading, typeof __VLS_components.vanLoading, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        size: "24px",
        vertical: true,
    }));
    const __VLS_38 = __VLS_37({
        size: "24px",
        vertical: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    __VLS_39.slots.default;
    var __VLS_39;
}
else {
    const __VLS_40 = {}.VanCellGroup;
    /** @type {[typeof __VLS_components.VanCellGroup, typeof __VLS_components.vanCellGroup, typeof __VLS_components.VanCellGroup, typeof __VLS_components.vanCellGroup, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        inset: true,
        title: "病情摘要",
    }));
    const __VLS_42 = __VLS_41({
        inset: true,
        title: "病情摘要",
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    __VLS_43.slots.default;
    const __VLS_44 = {}.VanField;
    /** @type {[typeof __VLS_components.VanField, typeof __VLS_components.vanField, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        modelValue: (__VLS_ctx.summary),
        type: "textarea",
        rows: "10",
        autosize: true,
        placeholder: "请查看并编辑病情摘要",
    }));
    const __VLS_46 = __VLS_45({
        modelValue: (__VLS_ctx.summary),
        type: "textarea",
        rows: "10",
        autosize: true,
        placeholder: "请查看并编辑病情摘要",
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    var __VLS_43;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "btn-area" },
    });
    const __VLS_48 = {}.VanButton;
    /** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
        ...{ 'onClick': {} },
        type: "primary",
        block: true,
        loading: (__VLS_ctx.loading),
    }));
    const __VLS_50 = __VLS_49({
        ...{ 'onClick': {} },
        type: "primary",
        block: true,
        loading: (__VLS_ctx.loading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    let __VLS_52;
    let __VLS_53;
    let __VLS_54;
    const __VLS_55 = {
        onClick: (__VLS_ctx.confirm)
    };
    __VLS_51.slots.default;
    var __VLS_51;
}
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
/** @type {__VLS_StyleScopedClasses['generating']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-area']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            summary: summary,
            loading: loading,
            generating: generating,
            goBack: goBack,
            confirm: confirm,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
