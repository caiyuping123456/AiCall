/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { completeProfile } from '@aicall/shared';
const router = useRouter();
const name = ref('');
const age = ref('');
const gender = ref(null);
const loading = ref(false);
async function handleSubmit() {
    if (!name.value) {
        showToast('请输入姓名');
        return;
    }
    if (!age.value || isNaN(Number(age.value)) || Number(age.value) <= 0) {
        showToast('请输入有效年龄');
        return;
    }
    if (gender.value === null) {
        showToast('请选择性别');
        return;
    }
    loading.value = true;
    try {
        await completeProfile({ name: name.value, age: Number(age.value), gender: gender.value });
        localStorage.setItem('patientName', name.value);
        localStorage.setItem('profileComplete', '1');
        showToast('资料完善成功');
        router.push('/');
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
    ...{ class: "profile-page" },
});
const __VLS_0 = {}.VanNavBar;
/** @type {[typeof __VLS_components.VanNavBar, typeof __VLS_components.vanNavBar, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    title: "完善资料",
}));
const __VLS_2 = __VLS_1({
    title: "完善资料",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-area" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hint" },
});
const __VLS_4 = {}.VanCellGroup;
/** @type {[typeof __VLS_components.VanCellGroup, typeof __VLS_components.vanCellGroup, typeof __VLS_components.VanCellGroup, typeof __VLS_components.vanCellGroup, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    inset: true,
}));
const __VLS_6 = __VLS_5({
    inset: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
const __VLS_8 = {}.VanField;
/** @type {[typeof __VLS_components.VanField, typeof __VLS_components.vanField, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    modelValue: (__VLS_ctx.name),
    label: "姓名",
    placeholder: "请输入姓名",
    rules: ([{ required: true, message: '请输入姓名' }]),
}));
const __VLS_10 = __VLS_9({
    modelValue: (__VLS_ctx.name),
    label: "姓名",
    placeholder: "请输入姓名",
    rules: ([{ required: true, message: '请输入姓名' }]),
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
const __VLS_12 = {}.VanField;
/** @type {[typeof __VLS_components.VanField, typeof __VLS_components.vanField, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    modelValue: (__VLS_ctx.age),
    label: "年龄",
    placeholder: "请输入年龄",
    type: "digit",
    rules: ([{ required: true, message: '请输入年龄' }]),
}));
const __VLS_14 = __VLS_13({
    modelValue: (__VLS_ctx.age),
    label: "年龄",
    placeholder: "请输入年龄",
    type: "digit",
    rules: ([{ required: true, message: '请输入年龄' }]),
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
const __VLS_16 = {}.VanField;
/** @type {[typeof __VLS_components.VanField, typeof __VLS_components.vanField, typeof __VLS_components.VanField, typeof __VLS_components.vanField, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    name: "gender",
    label: "性别",
}));
const __VLS_18 = __VLS_17({
    name: "gender",
    label: "性别",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
{
    const { input: __VLS_thisSlot } = __VLS_19.slots;
    const __VLS_20 = {}.VanRadioGroup;
    /** @type {[typeof __VLS_components.VanRadioGroup, typeof __VLS_components.vanRadioGroup, typeof __VLS_components.VanRadioGroup, typeof __VLS_components.vanRadioGroup, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        modelValue: (__VLS_ctx.gender),
        direction: "horizontal",
    }));
    const __VLS_22 = __VLS_21({
        modelValue: (__VLS_ctx.gender),
        direction: "horizontal",
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_23.slots.default;
    const __VLS_24 = {}.VanRadio;
    /** @type {[typeof __VLS_components.VanRadio, typeof __VLS_components.vanRadio, typeof __VLS_components.VanRadio, typeof __VLS_components.vanRadio, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        name: (1),
    }));
    const __VLS_26 = __VLS_25({
        name: (1),
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    __VLS_27.slots.default;
    var __VLS_27;
    const __VLS_28 = {}.VanRadio;
    /** @type {[typeof __VLS_components.VanRadio, typeof __VLS_components.vanRadio, typeof __VLS_components.VanRadio, typeof __VLS_components.vanRadio, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        name: (0),
    }));
    const __VLS_30 = __VLS_29({
        name: (0),
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    __VLS_31.slots.default;
    var __VLS_31;
    var __VLS_23;
}
var __VLS_19;
var __VLS_7;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "btn-area" },
});
const __VLS_32 = {}.VanButton;
/** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    ...{ 'onClick': {} },
    type: "primary",
    block: true,
    loading: (__VLS_ctx.loading),
}));
const __VLS_34 = __VLS_33({
    ...{ 'onClick': {} },
    type: "primary",
    block: true,
    loading: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
let __VLS_36;
let __VLS_37;
let __VLS_38;
const __VLS_39 = {
    onClick: (__VLS_ctx.handleSubmit)
};
__VLS_35.slots.default;
var __VLS_35;
/** @type {__VLS_StyleScopedClasses['profile-page']} */ ;
/** @type {__VLS_StyleScopedClasses['form-area']} */ ;
/** @type {__VLS_StyleScopedClasses['hint']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-area']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            name: name,
            age: age,
            gender: gender,
            loading: loading,
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
