/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getUserReport } from '@aicall/shared';
import { showToast } from 'vant';
const route = useRoute();
const router = useRouter();
const id = Number(route.params.id);
const loading = ref(false);
const report = ref(null);
const labels = {
    chiefComplaint: '主诉',
    presentIllness: '现病史',
    pastHistory: '既往史',
    examinationFindings: '检查所见',
    diagnosis: '诊断意见',
    analysis: '分析说明',
    recommendation: '建议',
    followUp: '随访建议',
};
onMounted(async () => {
    loading.value = true;
    try {
        report.value = await getUserReport(id);
    }
    catch (e) {
        showToast(e.message || '加载失败');
    }
    finally {
        loading.value = false;
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
const __VLS_0 = {}.VanNavBar;
/** @type {[typeof __VLS_components.VanNavBar, typeof __VLS_components.vanNavBar, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClickLeft': {} },
    title: "会诊报告",
    leftArrow: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClickLeft': {} },
    title: "会诊报告",
    leftArrow: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClickLeft: (...[$event]) => {
        __VLS_ctx.router.back();
    }
};
var __VLS_3;
if (__VLS_ctx.report) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: {} },
    });
    for (const [label, key] of __VLS_getVForSourceType((__VLS_ctx.labels))) {
        const __VLS_8 = {}.VanCellGroup;
        /** @type {[typeof __VLS_components.VanCellGroup, typeof __VLS_components.vanCellGroup, typeof __VLS_components.VanCellGroup, typeof __VLS_components.vanCellGroup, ]} */ ;
        // @ts-ignore
        const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
            key: (key),
            title: (label),
            ...{ style: {} },
        }));
        const __VLS_10 = __VLS_9({
            key: (key),
            title: (label),
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_9));
        __VLS_11.slots.default;
        const __VLS_12 = {}.VanCell;
        /** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
            value: (__VLS_ctx.report.fields?.[key] || '无'),
        }));
        const __VLS_14 = __VLS_13({
            value: (__VLS_ctx.report.fields?.[key] || '无'),
        }, ...__VLS_functionalComponentArgsRest(__VLS_13));
        var __VLS_11;
    }
}
else if (!__VLS_ctx.loading) {
    const __VLS_16 = {}.VanEmpty;
    /** @type {[typeof __VLS_components.VanEmpty, typeof __VLS_components.vanEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        description: "报告不存在或尚未签发",
    }));
    const __VLS_18 = __VLS_17({
        description: "报告不存在或尚未签发",
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
}
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            router: router,
            loading: loading,
            report: report,
            labels: labels,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
