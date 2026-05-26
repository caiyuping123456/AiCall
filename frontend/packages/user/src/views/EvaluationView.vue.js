/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, onMounted, reactive } from 'vue';
import { showToast } from 'vant';
import { getPendingEvaluations, submitEvaluation } from '@aicall/shared';
const list = ref([]);
const loading = ref(false);
const submitting = ref(0);
const scores = reactive({});
const services = reactive({});
const comments = reactive({});
onMounted(async () => {
    loading.value = true;
    try {
        list.value = await getPendingEvaluations();
        list.value.forEach(e => { scores[e.consultationId] = 0; services[e.consultationId] = 0; comments[e.consultationId] = ''; });
    }
    catch (e) {
        showToast(e.message || '加载失败');
    }
    finally {
        loading.value = false;
    }
});
async function handleSubmit(consultationId) {
    submitting.value = consultationId;
    try {
        await submitEvaluation(consultationId, {
            doctorScore: scores[consultationId],
            serviceScore: services[consultationId],
            comment: comments[consultationId],
        });
        showToast('感谢反馈');
        list.value = list.value.filter(e => e.consultationId !== consultationId);
    }
    catch (e) {
        showToast(e.message || '提交失败');
    }
    finally {
        submitting.value = 0;
    }
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
    title: "会诊评价",
}));
const __VLS_2 = __VLS_1({
    title: "会诊评价",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content" },
});
if (!__VLS_ctx.loading && __VLS_ctx.list.length === 0) {
    const __VLS_4 = {}.VanEmpty;
    /** @type {[typeof __VLS_components.VanEmpty, typeof __VLS_components.vanEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        description: "暂无待评价会诊",
    }));
    const __VLS_6 = __VLS_5({
        description: "暂无待评价会诊",
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
}
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.list))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (item.id),
        ...{ class: "eval-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "eval-header" },
    });
    (item.consultationNo);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "eval-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    const __VLS_8 = {}.VanRate;
    /** @type {[typeof __VLS_components.VanRate, typeof __VLS_components.vanRate, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        modelValue: (__VLS_ctx.scores[item.consultationId]),
        count: (5),
    }));
    const __VLS_10 = __VLS_9({
        modelValue: (__VLS_ctx.scores[item.consultationId]),
        count: (5),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "eval-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    const __VLS_12 = {}.VanRate;
    /** @type {[typeof __VLS_components.VanRate, typeof __VLS_components.vanRate, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        modelValue: (__VLS_ctx.services[item.consultationId]),
        count: (5),
    }));
    const __VLS_14 = __VLS_13({
        modelValue: (__VLS_ctx.services[item.consultationId]),
        count: (5),
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    const __VLS_16 = {}.VanField;
    /** @type {[typeof __VLS_components.VanField, typeof __VLS_components.vanField, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        modelValue: (__VLS_ctx.comments[item.consultationId]),
        type: "textarea",
        rows: (2),
        placeholder: "文字评价（可选）",
    }));
    const __VLS_18 = __VLS_17({
        modelValue: (__VLS_ctx.comments[item.consultationId]),
        type: "textarea",
        rows: (2),
        placeholder: "文字评价（可选）",
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    const __VLS_20 = {}.VanButton;
    /** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
        loading: (__VLS_ctx.submitting === item.consultationId),
        ...{ style: {} },
    }));
    const __VLS_22 = __VLS_21({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
        loading: (__VLS_ctx.submitting === item.consultationId),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    let __VLS_24;
    let __VLS_25;
    let __VLS_26;
    const __VLS_27 = {
        onClick: (...[$event]) => {
            __VLS_ctx.handleSubmit(item.consultationId);
        }
    };
    __VLS_23.slots.default;
    var __VLS_23;
}
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
/** @type {__VLS_StyleScopedClasses['eval-card']} */ ;
/** @type {__VLS_StyleScopedClasses['eval-header']} */ ;
/** @type {__VLS_StyleScopedClasses['eval-row']} */ ;
/** @type {__VLS_StyleScopedClasses['eval-row']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            list: list,
            loading: loading,
            submitting: submitting,
            scores: scores,
            services: services,
            comments: comments,
            handleSubmit: handleSubmit,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
