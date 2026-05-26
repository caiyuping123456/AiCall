/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { uploadFile, getUploads, createDraft, getConsultationDetail, formatOcrLabel } from '@aicall/shared';
import { useConsultationFlowStore } from '@/stores/consultationFlow';
const router = useRouter();
const flow = useConsultationFlowStore();
const patientName = ref(localStorage.getItem('patientName') || '');
const chiefComplaint = ref(flow.state.chiefComplaint || '');
const uploads = ref([]);
const recentIds = ref(new Set());
let draftId = null;
// Registration flow already has a consultation; full flow needs to create one
const isRegistration = flow.state.consultationId != null;
function goBack() {
    if (isRegistration) {
        router.push(`/consultation/${flow.state.consultationId}/summary`);
    }
    else {
        router.push('/consultation/summary');
    }
}
onMounted(async () => {
    if (isRegistration) {
        draftId = flow.state.consultationId;
        // If store doesn't have chiefComplaint, fetch from API
        if (!chiefComplaint.value && draftId) {
            try {
                const detail = await getConsultationDetail(draftId);
                if (detail?.chiefComplaint) {
                    chiefComplaint.value = detail.chiefComplaint;
                    flow.setChiefComplaint(detail.chiefComplaint);
                }
                if (detail?.department) {
                    flow.setDepartment(detail.department);
                }
            }
            catch { /* use whatever we have */ }
        }
        await loadUploads();
    }
    else {
        try {
            draftId = await createDraft(flow.state.chiefComplaint || '待补充', flow.state.department || undefined);
        }
        catch {
            // Continue without draft
        }
        if (draftId) {
            await loadUploads();
        }
    }
});
async function loadUploads() {
    if (!draftId)
        return;
    try {
        uploads.value = await getUploads(draftId);
    }
    catch { }
}
function goNext() {
    if (isRegistration) {
        // Registration flow: type & fee already set, go directly to pay
        flow.setSelectedType(1); // single consultation
        flow.nextStep(5);
        router.push('/consultation/pay');
    }
    else {
        // Full flow: choose consultation type first
        flow.nextStep(5);
        router.push('/consultation/select-type');
    }
}
async function onUpload(file) {
    if (!draftId) {
        showToast('上传服务暂不可用');
        return;
    }
    const files = Array.isArray(file) ? file : [file];
    for (const f of files) {
        try {
            await uploadFile(draftId, f.file);
            showToast(`${f.file.name} 上传成功`);
        }
        catch (e) {
            showToast(e.message || '上传失败');
        }
    }
    await loadUploads();
    uploads.value.forEach(item => {
        recentIds.value.add(item.id);
        flow.addFileId(item.id);
        setTimeout(() => recentIds.value.delete(item.id), 3000);
    });
    // Poll for OCR results
    pollOcrResults();
}
function pollOcrResults() {
    let attempts = 0;
    const maxAttempts = 15;
    const interval = setInterval(async () => {
        attempts++;
        await loadUploads();
        const allDone = uploads.value.every((item) => item.ocrResult);
        if (allDone || attempts >= maxAttempts) {
            clearInterval(interval);
        }
    }, 2000);
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
    title: "上传资料",
    leftArrow: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClickLeft': {} },
    title: "上传资料",
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
    active: (3),
    activeColor: "#1989fa",
}));
const __VLS_10 = __VLS_9({
    active: (3),
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
    title: "患者信息",
    ...{ style: {} },
}));
const __VLS_38 = __VLS_37({
    inset: true,
    title: "患者信息",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
const __VLS_40 = {}.VanCell;
/** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    title: "姓名",
    value: (__VLS_ctx.patientName || '未填写'),
}));
const __VLS_42 = __VLS_41({
    title: "姓名",
    value: (__VLS_ctx.patientName || '未填写'),
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
const __VLS_44 = {}.VanCell;
/** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    title: "主诉",
    value: (__VLS_ctx.chiefComplaint || '未填写'),
}));
const __VLS_46 = __VLS_45({
    title: "主诉",
    value: (__VLS_ctx.chiefComplaint || '未填写'),
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
if (__VLS_ctx.flow.state.department) {
    const __VLS_48 = {}.VanCell;
    /** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
        title: "科室",
        value: (__VLS_ctx.flow.state.department),
    }));
    const __VLS_50 = __VLS_49({
        title: "科室",
        value: (__VLS_ctx.flow.state.department),
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
}
var __VLS_39;
const __VLS_52 = {}.VanCellGroup;
/** @type {[typeof __VLS_components.VanCellGroup, typeof __VLS_components.vanCellGroup, typeof __VLS_components.VanCellGroup, typeof __VLS_components.vanCellGroup, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    inset: true,
    title: "上传检查资料",
}));
const __VLS_54 = __VLS_53({
    inset: true,
    title: "上传检查资料",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
const __VLS_56 = {}.VanUploader;
/** @type {[typeof __VLS_components.VanUploader, typeof __VLS_components.vanUploader, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    ...{ 'onOversize': {} },
    afterRead: (__VLS_ctx.onUpload),
    multiple: true,
    maxSize: (10 * 1024 * 1024),
}));
const __VLS_58 = __VLS_57({
    ...{ 'onOversize': {} },
    afterRead: (__VLS_ctx.onUpload),
    multiple: true,
    maxSize: (10 * 1024 * 1024),
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
let __VLS_60;
let __VLS_61;
let __VLS_62;
const __VLS_63 = {
    onOversize: (() => __VLS_ctx.showToast('文件不能超过10MB'))
};
var __VLS_59;
var __VLS_55;
const __VLS_64 = {}.VanCellGroup;
/** @type {[typeof __VLS_components.VanCellGroup, typeof __VLS_components.vanCellGroup, typeof __VLS_components.VanCellGroup, typeof __VLS_components.vanCellGroup, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    inset: true,
    title: (__VLS_ctx.uploads.length > 0 ? '已上传 (' + __VLS_ctx.uploads.length + ')' : '待上传'),
    ...{ style: {} },
}));
const __VLS_66 = __VLS_65({
    inset: true,
    title: (__VLS_ctx.uploads.length > 0 ? '已上传 (' + __VLS_ctx.uploads.length + ')' : '待上传'),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.uploads))) {
    const __VLS_68 = {}.VanCell;
    /** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
        key: (item.id),
        ...{ class: ({ 'upload-success': __VLS_ctx.recentIds.has(item.id) }) },
    }));
    const __VLS_70 = __VLS_69({
        key: (item.id),
        ...{ class: ({ 'upload-success': __VLS_ctx.recentIds.has(item.id) }) },
    }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    __VLS_71.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_71.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (item.fileName);
        if (__VLS_ctx.recentIds.has(item.id)) {
            const __VLS_72 = {}.VanIcon;
            /** @type {[typeof __VLS_components.VanIcon, typeof __VLS_components.vanIcon, ]} */ ;
            // @ts-ignore
            const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
                name: "success",
                color: "#07c160",
                ...{ style: {} },
            }));
            const __VLS_74 = __VLS_73({
                name: "success",
                color: "#07c160",
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_73));
        }
    }
    {
        const { label: __VLS_thisSlot } = __VLS_71.slots;
        (__VLS_ctx.formatOcrLabel(item.ocrResult));
    }
    var __VLS_71;
}
var __VLS_67;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "btn-area" },
});
const __VLS_76 = {}.VanButton;
/** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    ...{ 'onClick': {} },
    type: "primary",
    block: true,
}));
const __VLS_78 = __VLS_77({
    ...{ 'onClick': {} },
    type: "primary",
    block: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
let __VLS_80;
let __VLS_81;
let __VLS_82;
const __VLS_83 = {
    onClick: (__VLS_ctx.goNext)
};
__VLS_79.slots.default;
var __VLS_79;
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-area']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            showToast: showToast,
            formatOcrLabel: formatOcrLabel,
            flow: flow,
            patientName: patientName,
            chiefComplaint: chiefComplaint,
            uploads: uploads,
            recentIds: recentIds,
            goBack: goBack,
            goNext: goNext,
            onUpload: onUpload,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
