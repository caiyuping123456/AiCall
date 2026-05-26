/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showToast } from 'vant';
import { getDoctorDetail, registerConsultation } from '@aicall/shared';
import { useConsultationFlowStore } from '@/stores/consultationFlow';
const router = useRouter();
const route = useRoute();
const flow = useConsultationFlowStore();
const doctor = ref({ id: 0, name: '', title: '', department: '', avatar: '', introduction: '' });
const showDialog = ref(false);
const chiefComplaint = ref('');
const registering = ref(false);
async function handleRegister() {
    if (!chiefComplaint.value.trim()) {
        showToast('请输入主诉');
        throw new Error('VALIDATION'); // prevent dialog from closing
    }
    const consultationId = await registerConsultation({
        chiefComplaint: chiefComplaint.value,
        doctorId: doctor.value.id,
        department: doctor.value.department,
    });
    // Save registration data to flow store for downstream pages (Upload, Pay)
    flow.setChiefComplaint(chiefComplaint.value);
    flow.setDepartment(doctor.value.department);
    flow.setConsultationId(consultationId);
    // Close dialog before navigation
    showDialog.value = false;
    showToast('挂号成功，AI正在生成摘要...');
    router.push(`/consultation/${consultationId}/summary`);
}
async function beforeClose(action) {
    if (action === 'cancel')
        return true;
    if (registering.value)
        return false;
    registering.value = true;
    try {
        await handleRegister();
    }
    catch (e) {
        if (e?.message !== 'VALIDATION') {
            showToast(e.message || '挂号失败');
        }
        registering.value = false;
        return false;
    }
    registering.value = false;
    return false; // Dialog already closed manually on success, or we navigated away
}
onMounted(async () => {
    try {
        doctor.value = await getDoctorDetail(Number(route.params.id));
    }
    catch {
        showToast('获取医生信息失败');
        router.back();
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['profile-card']} */ ;
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
    title: "医生详情",
    leftArrow: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClickLeft': {} },
    title: "医生详情",
    leftArrow: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClickLeft: (...[$event]) => {
        __VLS_ctx.$router.back();
    }
};
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "profile-card mobile-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "profile-top" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "profile-avatar" },
});
if (__VLS_ctx.doctor.avatar) {
    const __VLS_8 = {}.VanImage;
    /** @type {[typeof __VLS_components.VanImage, typeof __VLS_components.vanImage, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        src: (__VLS_ctx.doctor.avatar),
        round: true,
        width: "76",
        height: "76",
        fit: "cover",
    }));
    const __VLS_10 = __VLS_9({
        src: (__VLS_ctx.doctor.avatar),
        round: true,
        width: "76",
        height: "76",
        fit: "cover",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "avatar-placeholder" },
    });
    (__VLS_ctx.doctor.name?.charAt(0) || '医');
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "profile-meta" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "profile-name" },
});
(__VLS_ctx.doctor.name || '医生');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "profile-tags" },
});
const __VLS_12 = {}.VanTag;
/** @type {[typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    type: "primary",
    size: "medium",
}));
const __VLS_14 = __VLS_13({
    type: "primary",
    size: "medium",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
(__VLS_ctx.doctor.title || '医师');
var __VLS_15;
const __VLS_16 = {}.VanTag;
/** @type {[typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    plain: true,
    size: "medium",
}));
const __VLS_18 = __VLS_17({
    plain: true,
    size: "medium",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
(__VLS_ctx.doctor.department);
var __VLS_19;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "profile-intro-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "intro-text" },
});
(__VLS_ctx.doctor.introduction || '暂无介绍信息');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "register-section" },
});
const __VLS_20 = {}.VanButton;
/** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    ...{ 'onClick': {} },
    type: "primary",
    block: true,
    round: true,
    size: "large",
    loading: (__VLS_ctx.registering),
}));
const __VLS_22 = __VLS_21({
    ...{ 'onClick': {} },
    type: "primary",
    block: true,
    round: true,
    size: "large",
    loading: (__VLS_ctx.registering),
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
let __VLS_24;
let __VLS_25;
let __VLS_26;
const __VLS_27 = {
    onClick: (...[$event]) => {
        __VLS_ctx.showDialog = true;
    }
};
__VLS_23.slots.default;
var __VLS_23;
const __VLS_28 = {}.VanDialog;
/** @type {[typeof __VLS_components.VanDialog, typeof __VLS_components.vanDialog, typeof __VLS_components.VanDialog, typeof __VLS_components.vanDialog, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    show: (__VLS_ctx.showDialog),
    title: "挂号预约",
    showCancelButton: true,
    beforeClose: (__VLS_ctx.beforeClose),
    confirmLoading: (__VLS_ctx.registering),
}));
const __VLS_30 = __VLS_29({
    show: (__VLS_ctx.showDialog),
    title: "挂号预约",
    showCancelButton: true,
    beforeClose: (__VLS_ctx.beforeClose),
    confirmLoading: (__VLS_ctx.registering),
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "dialog-content" },
});
const __VLS_32 = {}.VanField;
/** @type {[typeof __VLS_components.VanField, typeof __VLS_components.vanField, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    modelValue: (__VLS_ctx.chiefComplaint),
    label: "主诉",
    placeholder: "请描述您的主要症状",
    type: "textarea",
    rows: "3",
    maxlength: "200",
    showWordLimit: true,
}));
const __VLS_34 = __VLS_33({
    modelValue: (__VLS_ctx.chiefComplaint),
    label: "主诉",
    placeholder: "请描述您的主要症状",
    type: "textarea",
    rows: "3",
    maxlength: "200",
    showWordLimit: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
var __VLS_31;
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-card']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-card']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-top']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-name']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-intro-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['intro-text']} */ ;
/** @type {__VLS_StyleScopedClasses['register-section']} */ ;
/** @type {__VLS_StyleScopedClasses['dialog-content']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            doctor: doctor,
            showDialog: showDialog,
            chiefComplaint: chiefComplaint,
            registering: registering,
            beforeClose: beforeClose,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
