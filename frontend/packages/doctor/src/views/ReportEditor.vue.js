/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getReport, updateReport, submitReport, signReport } from '@aicall/shared';
const route = useRoute();
const router = useRouter();
const id = Number(route.params.id);
const loading = ref(false);
const actionLoading = ref(false);
const report = ref(null);
const rawContent = ref('');
const parsedContent = computed(() => {
    if (!report.value)
        return null;
    try {
        const c = JSON.parse(rawContent.value);
        if (c.chiefComplaint !== undefined)
            return c;
        return null;
    }
    catch {
        return null;
    }
});
const editable = computed(() => report.value?.status === 0);
const statusTitle = computed(() => {
    if (!report.value)
        return '';
    return ['报告编辑中（草稿）', '报告已提交质控', '报告已签发'][report.value.status];
});
const statusAlertType = computed(() => {
    if (!report.value)
        return 'info';
    return ['warning', 'success', 'info'][report.value.status];
});
const parsedIssues = computed(() => {
    if (!report.value?.qcResult?.issues)
        return [];
    try {
        return JSON.parse(report.value.qcResult.issues);
    }
    catch {
        return [];
    }
});
onMounted(() => loadData());
async function loadData() {
    loading.value = true;
    try {
        report.value = await getReport(id);
        if (report.value) {
            rawContent.value = report.value.content;
        }
    }
    catch (e) {
        ElMessage.error(e.message || '加载失败');
    }
    finally {
        loading.value = false;
    }
}
function getContentToSend() {
    if (parsedContent.value) {
        return JSON.stringify(parsedContent.value);
    }
    return rawContent.value;
}
async function handleSave() {
    actionLoading.value = true;
    try {
        await updateReport(id, getContentToSend());
        ElMessage.success('已保存');
        loadData();
    }
    catch (e) {
        ElMessage.error(e.message || '保存失败');
    }
    finally {
        actionLoading.value = false;
    }
}
async function handleSubmit() {
    try {
        await ElMessageBox.confirm('提交后将进行AI质控，确定提交？', '确认', { type: 'warning' });
    }
    catch {
        return;
    }
    actionLoading.value = true;
    try {
        const result = await submitReport(id);
        if (result.status === 1) {
            ElMessage.success('质控通过！');
        }
        else {
            ElMessage.warning('质控未通过，请根据问题修改报告');
        }
        loadData();
    }
    catch (e) {
        ElMessage.error(e.message || '提交失败');
    }
    finally {
        actionLoading.value = false;
    }
}
async function handleSign() {
    try {
        await ElMessageBox.confirm('签发后报告将正式生效，确定签发？', '确认签发', { type: 'warning' });
    }
    catch {
        return;
    }
    actionLoading.value = true;
    try {
        await signReport(id);
        ElMessage.success('已签发');
        router.push('/consultations');
    }
    catch (e) {
        ElMessage.error(e.message || '签发失败');
    }
    finally {
        actionLoading.value = false;
    }
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
const __VLS_0 = {}.ElPageHeader;
/** @type {[typeof __VLS_components.ElPageHeader, typeof __VLS_components.elPageHeader, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onBack': {} },
    title: "返回",
    content: "报告编辑",
    ...{ style: {} },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onBack': {} },
    title: "返回",
    content: "报告编辑",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onBack: (...[$event]) => {
        __VLS_ctx.router.back();
    }
};
var __VLS_3;
if (__VLS_ctx.report) {
    const __VLS_8 = {}.ElAlert;
    /** @type {[typeof __VLS_components.ElAlert, typeof __VLS_components.elAlert, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        title: (__VLS_ctx.statusTitle),
        type: (__VLS_ctx.statusAlertType),
        showIcon: true,
        closable: (false),
        ...{ style: {} },
    }));
    const __VLS_10 = __VLS_9({
        title: (__VLS_ctx.statusTitle),
        type: (__VLS_ctx.statusAlertType),
        showIcon: true,
        closable: (false),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    if (__VLS_ctx.report.qcResult) {
        const __VLS_12 = {}.ElCard;
        /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
            ...{ style: {} },
        }));
        const __VLS_14 = __VLS_13({
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_13));
        __VLS_15.slots.default;
        {
            const { header: __VLS_thisSlot } = __VLS_15.slots;
        }
        const __VLS_16 = {}.ElRow;
        /** @type {[typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ]} */ ;
        // @ts-ignore
        const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
            gutter: (20),
        }));
        const __VLS_18 = __VLS_17({
            gutter: (20),
        }, ...__VLS_functionalComponentArgsRest(__VLS_17));
        __VLS_19.slots.default;
        const __VLS_20 = {}.ElCol;
        /** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
            span: (6),
        }));
        const __VLS_22 = __VLS_21({
            span: (6),
        }, ...__VLS_functionalComponentArgsRest(__VLS_21));
        __VLS_23.slots.default;
        const __VLS_24 = {}.ElStatistic;
        /** @type {[typeof __VLS_components.ElStatistic, typeof __VLS_components.elStatistic, ]} */ ;
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
            title: "完整性",
            value: (__VLS_ctx.report.qcResult.completenessScore),
            suffix: "分",
        }));
        const __VLS_26 = __VLS_25({
            title: "完整性",
            value: (__VLS_ctx.report.qcResult.completenessScore),
            suffix: "分",
        }, ...__VLS_functionalComponentArgsRest(__VLS_25));
        var __VLS_23;
        const __VLS_28 = {}.ElCol;
        /** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
            span: (6),
        }));
        const __VLS_30 = __VLS_29({
            span: (6),
        }, ...__VLS_functionalComponentArgsRest(__VLS_29));
        __VLS_31.slots.default;
        const __VLS_32 = {}.ElStatistic;
        /** @type {[typeof __VLS_components.ElStatistic, typeof __VLS_components.elStatistic, ]} */ ;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
            title: "规范性",
            value: (__VLS_ctx.report.qcResult.standardScore),
            suffix: "分",
        }));
        const __VLS_34 = __VLS_33({
            title: "规范性",
            value: (__VLS_ctx.report.qcResult.standardScore),
            suffix: "分",
        }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        var __VLS_31;
        const __VLS_36 = {}.ElCol;
        /** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
            span: (6),
        }));
        const __VLS_38 = __VLS_37({
            span: (6),
        }, ...__VLS_functionalComponentArgsRest(__VLS_37));
        __VLS_39.slots.default;
        const __VLS_40 = {}.ElStatistic;
        /** @type {[typeof __VLS_components.ElStatistic, typeof __VLS_components.elStatistic, ]} */ ;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
            title: "一致性",
            value: (__VLS_ctx.report.qcResult.consistencyScore),
            suffix: "分",
        }));
        const __VLS_42 = __VLS_41({
            title: "一致性",
            value: (__VLS_ctx.report.qcResult.consistencyScore),
            suffix: "分",
        }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        var __VLS_39;
        const __VLS_44 = {}.ElCol;
        /** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
            span: (6),
        }));
        const __VLS_46 = __VLS_45({
            span: (6),
        }, ...__VLS_functionalComponentArgsRest(__VLS_45));
        __VLS_47.slots.default;
        const __VLS_48 = {}.ElStatistic;
        /** @type {[typeof __VLS_components.ElStatistic, typeof __VLS_components.elStatistic, ]} */ ;
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
            title: "总分",
            value: (__VLS_ctx.report.qcResult.totalScore),
            suffix: "分",
        }));
        const __VLS_50 = __VLS_49({
            title: "总分",
            value: (__VLS_ctx.report.qcResult.totalScore),
            suffix: "分",
        }, ...__VLS_functionalComponentArgsRest(__VLS_49));
        var __VLS_47;
        var __VLS_19;
        if (__VLS_ctx.parsedIssues.length) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
            for (const [issue, idx] of __VLS_getVForSourceType((__VLS_ctx.parsedIssues))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
                    key: (idx),
                });
                (issue);
            }
        }
        var __VLS_15;
    }
    const __VLS_52 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        ...{ style: {} },
    }));
    const __VLS_54 = __VLS_53({
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    __VLS_55.slots.default;
    {
        const { header: __VLS_thisSlot } = __VLS_55.slots;
    }
    if (__VLS_ctx.parsedContent) {
        const __VLS_56 = {}.ElForm;
        /** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
        // @ts-ignore
        const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
            labelPosition: "top",
        }));
        const __VLS_58 = __VLS_57({
            labelPosition: "top",
        }, ...__VLS_functionalComponentArgsRest(__VLS_57));
        __VLS_59.slots.default;
        const __VLS_60 = {}.ElFormItem;
        /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
            label: "主诉",
        }));
        const __VLS_62 = __VLS_61({
            label: "主诉",
        }, ...__VLS_functionalComponentArgsRest(__VLS_61));
        __VLS_63.slots.default;
        const __VLS_64 = {}.ElInput;
        /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
        // @ts-ignore
        const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
            modelValue: (__VLS_ctx.parsedContent.chiefComplaint),
            type: "textarea",
            rows: (2),
            disabled: (!__VLS_ctx.editable),
        }));
        const __VLS_66 = __VLS_65({
            modelValue: (__VLS_ctx.parsedContent.chiefComplaint),
            type: "textarea",
            rows: (2),
            disabled: (!__VLS_ctx.editable),
        }, ...__VLS_functionalComponentArgsRest(__VLS_65));
        var __VLS_63;
        const __VLS_68 = {}.ElFormItem;
        /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
            label: "现病史",
        }));
        const __VLS_70 = __VLS_69({
            label: "现病史",
        }, ...__VLS_functionalComponentArgsRest(__VLS_69));
        __VLS_71.slots.default;
        const __VLS_72 = {}.ElInput;
        /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
        // @ts-ignore
        const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
            modelValue: (__VLS_ctx.parsedContent.presentIllness),
            type: "textarea",
            rows: (3),
            disabled: (!__VLS_ctx.editable),
        }));
        const __VLS_74 = __VLS_73({
            modelValue: (__VLS_ctx.parsedContent.presentIllness),
            type: "textarea",
            rows: (3),
            disabled: (!__VLS_ctx.editable),
        }, ...__VLS_functionalComponentArgsRest(__VLS_73));
        var __VLS_71;
        const __VLS_76 = {}.ElFormItem;
        /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
            label: "既往史",
        }));
        const __VLS_78 = __VLS_77({
            label: "既往史",
        }, ...__VLS_functionalComponentArgsRest(__VLS_77));
        __VLS_79.slots.default;
        const __VLS_80 = {}.ElInput;
        /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
        // @ts-ignore
        const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
            modelValue: (__VLS_ctx.parsedContent.pastHistory),
            type: "textarea",
            rows: (2),
            disabled: (!__VLS_ctx.editable),
        }));
        const __VLS_82 = __VLS_81({
            modelValue: (__VLS_ctx.parsedContent.pastHistory),
            type: "textarea",
            rows: (2),
            disabled: (!__VLS_ctx.editable),
        }, ...__VLS_functionalComponentArgsRest(__VLS_81));
        var __VLS_79;
        const __VLS_84 = {}.ElFormItem;
        /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
            label: "检查所见",
        }));
        const __VLS_86 = __VLS_85({
            label: "检查所见",
        }, ...__VLS_functionalComponentArgsRest(__VLS_85));
        __VLS_87.slots.default;
        const __VLS_88 = {}.ElInput;
        /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
        // @ts-ignore
        const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
            modelValue: (__VLS_ctx.parsedContent.examinationFindings),
            type: "textarea",
            rows: (3),
            disabled: (!__VLS_ctx.editable),
        }));
        const __VLS_90 = __VLS_89({
            modelValue: (__VLS_ctx.parsedContent.examinationFindings),
            type: "textarea",
            rows: (3),
            disabled: (!__VLS_ctx.editable),
        }, ...__VLS_functionalComponentArgsRest(__VLS_89));
        var __VLS_87;
        const __VLS_92 = {}.ElFormItem;
        /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
            label: "诊断意见",
        }));
        const __VLS_94 = __VLS_93({
            label: "诊断意见",
        }, ...__VLS_functionalComponentArgsRest(__VLS_93));
        __VLS_95.slots.default;
        const __VLS_96 = {}.ElInput;
        /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
        // @ts-ignore
        const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
            modelValue: (__VLS_ctx.parsedContent.diagnosis),
            type: "textarea",
            rows: (2),
            disabled: (!__VLS_ctx.editable),
        }));
        const __VLS_98 = __VLS_97({
            modelValue: (__VLS_ctx.parsedContent.diagnosis),
            type: "textarea",
            rows: (2),
            disabled: (!__VLS_ctx.editable),
        }, ...__VLS_functionalComponentArgsRest(__VLS_97));
        var __VLS_95;
        const __VLS_100 = {}.ElFormItem;
        /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
            label: "分析说明",
        }));
        const __VLS_102 = __VLS_101({
            label: "分析说明",
        }, ...__VLS_functionalComponentArgsRest(__VLS_101));
        __VLS_103.slots.default;
        const __VLS_104 = {}.ElInput;
        /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
        // @ts-ignore
        const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
            modelValue: (__VLS_ctx.parsedContent.analysis),
            type: "textarea",
            rows: (3),
            disabled: (!__VLS_ctx.editable),
        }));
        const __VLS_106 = __VLS_105({
            modelValue: (__VLS_ctx.parsedContent.analysis),
            type: "textarea",
            rows: (3),
            disabled: (!__VLS_ctx.editable),
        }, ...__VLS_functionalComponentArgsRest(__VLS_105));
        var __VLS_103;
        const __VLS_108 = {}.ElFormItem;
        /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
            label: "建议",
        }));
        const __VLS_110 = __VLS_109({
            label: "建议",
        }, ...__VLS_functionalComponentArgsRest(__VLS_109));
        __VLS_111.slots.default;
        const __VLS_112 = {}.ElInput;
        /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
        // @ts-ignore
        const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
            modelValue: (__VLS_ctx.parsedContent.recommendation),
            type: "textarea",
            rows: (2),
            disabled: (!__VLS_ctx.editable),
        }));
        const __VLS_114 = __VLS_113({
            modelValue: (__VLS_ctx.parsedContent.recommendation),
            type: "textarea",
            rows: (2),
            disabled: (!__VLS_ctx.editable),
        }, ...__VLS_functionalComponentArgsRest(__VLS_113));
        var __VLS_111;
        const __VLS_116 = {}.ElFormItem;
        /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
            label: "随访建议",
        }));
        const __VLS_118 = __VLS_117({
            label: "随访建议",
        }, ...__VLS_functionalComponentArgsRest(__VLS_117));
        __VLS_119.slots.default;
        const __VLS_120 = {}.ElInput;
        /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
        // @ts-ignore
        const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
            modelValue: (__VLS_ctx.parsedContent.followUp),
            type: "textarea",
            rows: (2),
            disabled: (!__VLS_ctx.editable),
        }));
        const __VLS_122 = __VLS_121({
            modelValue: (__VLS_ctx.parsedContent.followUp),
            type: "textarea",
            rows: (2),
            disabled: (!__VLS_ctx.editable),
        }, ...__VLS_functionalComponentArgsRest(__VLS_121));
        var __VLS_119;
        var __VLS_59;
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        const __VLS_124 = {}.ElInput;
        /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
        // @ts-ignore
        const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
            modelValue: (__VLS_ctx.rawContent),
            type: "textarea",
            rows: (15),
            disabled: (!__VLS_ctx.editable),
        }));
        const __VLS_126 = __VLS_125({
            modelValue: (__VLS_ctx.rawContent),
            type: "textarea",
            rows: (15),
            disabled: (!__VLS_ctx.editable),
        }, ...__VLS_functionalComponentArgsRest(__VLS_125));
    }
    var __VLS_55;
    if (__VLS_ctx.editable) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ style: {} },
        });
        const __VLS_128 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
            ...{ 'onClick': {} },
            type: "primary",
            loading: (__VLS_ctx.actionLoading),
        }));
        const __VLS_130 = __VLS_129({
            ...{ 'onClick': {} },
            type: "primary",
            loading: (__VLS_ctx.actionLoading),
        }, ...__VLS_functionalComponentArgsRest(__VLS_129));
        let __VLS_132;
        let __VLS_133;
        let __VLS_134;
        const __VLS_135 = {
            onClick: (__VLS_ctx.handleSave)
        };
        __VLS_131.slots.default;
        var __VLS_131;
        const __VLS_136 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
            ...{ 'onClick': {} },
            type: "success",
            loading: (__VLS_ctx.actionLoading),
        }));
        const __VLS_138 = __VLS_137({
            ...{ 'onClick': {} },
            type: "success",
            loading: (__VLS_ctx.actionLoading),
        }, ...__VLS_functionalComponentArgsRest(__VLS_137));
        let __VLS_140;
        let __VLS_141;
        let __VLS_142;
        const __VLS_143 = {
            onClick: (__VLS_ctx.handleSubmit)
        };
        __VLS_139.slots.default;
        var __VLS_139;
    }
    if (__VLS_ctx.report.status === 1 && __VLS_ctx.report.qcResult?.status === 1) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ style: {} },
        });
        const __VLS_144 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
            ...{ 'onClick': {} },
            type: "warning",
            size: "large",
            loading: (__VLS_ctx.actionLoading),
        }));
        const __VLS_146 = __VLS_145({
            ...{ 'onClick': {} },
            type: "warning",
            size: "large",
            loading: (__VLS_ctx.actionLoading),
        }, ...__VLS_functionalComponentArgsRest(__VLS_145));
        let __VLS_148;
        let __VLS_149;
        let __VLS_150;
        const __VLS_151 = {
            onClick: (__VLS_ctx.handleSign)
        };
        __VLS_147.slots.default;
        var __VLS_147;
    }
}
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            router: router,
            loading: loading,
            actionLoading: actionLoading,
            report: report,
            rawContent: rawContent,
            parsedContent: parsedContent,
            editable: editable,
            statusTitle: statusTitle,
            statusAlertType: statusAlertType,
            parsedIssues: parsedIssues,
            handleSave: handleSave,
            handleSubmit: handleSubmit,
            handleSign: handleSign,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
