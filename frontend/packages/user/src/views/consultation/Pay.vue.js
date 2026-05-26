/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { submitConsultation, payConsultation } from '@aicall/shared';
import { useConsultationFlowStore } from '@/stores/consultationFlow';
const router = useRouter();
const flow = useConsultationFlowStore();
const loading = ref(false);
function goBack() {
    if (flow.state.consultationId != null) {
        // Registration flow: back to upload
        router.push('/consultation/upload');
    }
    else {
        // Full flow: back to select type
        router.push('/consultation/select-type');
    }
}
const consultationTypeLabel = computed(() => flow.state.selectedType === 2 ? '多学科MDT会诊' : '单学科会诊');
const feeCents = computed(() => flow.state.selectedType === 2 ? 1500.00 : 500.00);
const feeLabel = computed(() => `¥${feeCents.value.toFixed(2)}`);
async function handlePay() {
    if (!flow.state.chiefComplaint) {
        showToast('缺少主诉信息，请返回重新填写');
        return;
    }
    loading.value = true;
    try {
        if (flow.state.consultationId != null) {
            // Registration flow: consultation already created, just pay
            await payConsultation(flow.state.consultationId);
        }
        else {
            // Full flow: create consultation with all data
            await submitConsultation({
                department: flow.state.department || '未指定',
                type: flow.state.selectedType || 1,
                doctorIds: flow.state.selectedDoctorIds,
                chiefComplaint: flow.state.chiefComplaint,
                medicalSummary: flow.state.medicalSummary,
                chatHistory: flow.state.chatHistory,
                fileIds: flow.state.uploadedFileIds,
            });
        }
        flow.nextStep(7);
        router.push('/consultation/success');
    }
    catch (e) {
        showToast(e.message || '提交失败');
    }
    finally {
        loading.value = false;
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
    ...{ 'onClickLeft': {} },
    title: "确认支付",
    leftArrow: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClickLeft': {} },
    title: "确认支付",
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
    active: (5),
    activeColor: "#1989fa",
}));
const __VLS_10 = __VLS_9({
    active: (5),
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
const __VLS_36 = {}.VanCellGroup;
/** @type {[typeof __VLS_components.VanCellGroup, typeof __VLS_components.vanCellGroup, typeof __VLS_components.VanCellGroup, typeof __VLS_components.vanCellGroup, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    inset: true,
}));
const __VLS_38 = __VLS_37({
    inset: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
const __VLS_40 = {}.VanCell;
/** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    title: "会诊类型",
    value: (__VLS_ctx.consultationTypeLabel),
}));
const __VLS_42 = __VLS_41({
    title: "会诊类型",
    value: (__VLS_ctx.consultationTypeLabel),
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
const __VLS_44 = {}.VanCell;
/** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    title: "会诊费用",
    value: (__VLS_ctx.feeLabel),
}));
const __VLS_46 = __VLS_45({
    title: "会诊费用",
    value: (__VLS_ctx.feeLabel),
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
var __VLS_39;
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
    onClick: (__VLS_ctx.handlePay)
};
__VLS_51.slots.default;
(__VLS_ctx.feeLabel);
var __VLS_51;
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-area']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            loading: loading,
            goBack: goBack,
            consultationTypeLabel: consultationTypeLabel,
            feeLabel: feeLabel,
            handlePay: handlePay,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
