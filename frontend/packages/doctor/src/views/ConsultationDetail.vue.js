/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getDoctorConsultationDetail, confirmConsultation, rejectConsultation, generateReport, getDoctorFollowUps, formatOcrLabel } from '@aicall/shared';
const route = useRoute();
const router = useRouter();
const id = Number(route.params.id);
const loading = ref(false);
const actionLoading = ref(false);
const detail = ref(null);
const showRejectDialog = ref(false);
const rejectReason = ref('');
const followUps = ref([]);
const followUpLoading = ref(false);
const reportFieldLabels = {
    chiefComplaint: '主诉',
    presentIllness: '现病史',
    pastHistory: '既往史',
    examinationFindings: '检查所见',
    diagnosis: '诊断意见',
    analysis: '分析说明',
    recommendation: '建议',
    followUp: '随访建议',
};
onMounted(() => loadData());
async function loadData() {
    loading.value = true;
    try {
        detail.value = await getDoctorConsultationDetail(id);
        loadFollowUps();
    }
    catch (e) {
        ElMessage.error(e.message || '加载失败');
    }
    finally {
        loading.value = false;
    }
}
async function handleConfirm() {
    actionLoading.value = true;
    try {
        await confirmConsultation(id);
        ElMessage.success('已确认接诊');
        loadData();
    }
    catch (e) {
        ElMessage.error(e.message || '操作失败');
    }
    finally {
        actionLoading.value = false;
    }
}
async function handleReject() {
    if (!rejectReason.value) {
        ElMessage.warning('请输入拒绝原因');
        return;
    }
    actionLoading.value = true;
    try {
        await rejectConsultation(id, rejectReason.value);
        ElMessage.success('已拒绝');
        showRejectDialog.value = false;
        router.push('/consultations');
    }
    catch (e) {
        ElMessage.error(e.message || '操作失败');
    }
    finally {
        actionLoading.value = false;
    }
}
async function handleGenerateReport() {
    actionLoading.value = true;
    try {
        await generateReport(id);
        ElMessage.success('报告已生成');
        loadData();
    }
    catch (e) {
        ElMessage.error(e.message || '生成失败');
    }
    finally {
        actionLoading.value = false;
    }
}
async function loadFollowUps() {
    followUpLoading.value = true;
    try {
        followUps.value = await getDoctorFollowUps(id);
    }
    catch { /* optional */ }
    finally {
        followUpLoading.value = false;
    }
}
function showFollowUpDetail(row) {
    ElMessageBox.alert('问卷：' + (row.questionnaire || '无') + '\n\n回答：' + (row.answer || '暂无') +
        '\n\nAI分析：' + (row.aiAnalysis || '暂无'), '第' + row.planDay + '天随访详情', { confirmButtonText: '关闭' });
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
    content: (__VLS_ctx.detail?.patientName || '会诊详情'),
    ...{ style: {} },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onBack': {} },
    title: "返回",
    content: (__VLS_ctx.detail?.patientName || '会诊详情'),
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
if (__VLS_ctx.detail) {
    if (__VLS_ctx.detail.status === 2) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ style: {} },
        });
        const __VLS_8 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
            ...{ 'onClick': {} },
            type: "primary",
            loading: (__VLS_ctx.actionLoading),
        }));
        const __VLS_10 = __VLS_9({
            ...{ 'onClick': {} },
            type: "primary",
            loading: (__VLS_ctx.actionLoading),
        }, ...__VLS_functionalComponentArgsRest(__VLS_9));
        let __VLS_12;
        let __VLS_13;
        let __VLS_14;
        const __VLS_15 = {
            onClick: (__VLS_ctx.handleConfirm)
        };
        __VLS_11.slots.default;
        var __VLS_11;
        const __VLS_16 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
            ...{ 'onClick': {} },
            type: "danger",
        }));
        const __VLS_18 = __VLS_17({
            ...{ 'onClick': {} },
            type: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_17));
        let __VLS_20;
        let __VLS_21;
        let __VLS_22;
        const __VLS_23 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.detail))
                    return;
                if (!(__VLS_ctx.detail.status === 2))
                    return;
                __VLS_ctx.showRejectDialog = true;
            }
        };
        __VLS_19.slots.default;
        var __VLS_19;
    }
    if (__VLS_ctx.detail.status === 3 && !__VLS_ctx.detail.report) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ style: {} },
        });
        const __VLS_24 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
            ...{ 'onClick': {} },
            type: "success",
            loading: (__VLS_ctx.actionLoading),
        }));
        const __VLS_26 = __VLS_25({
            ...{ 'onClick': {} },
            type: "success",
            loading: (__VLS_ctx.actionLoading),
        }, ...__VLS_functionalComponentArgsRest(__VLS_25));
        let __VLS_28;
        let __VLS_29;
        let __VLS_30;
        const __VLS_31 = {
            onClick: (__VLS_ctx.handleGenerateReport)
        };
        __VLS_27.slots.default;
        var __VLS_27;
    }
    if (__VLS_ctx.detail.status === 3 || __VLS_ctx.detail.status === 4) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ style: {} },
        });
        const __VLS_32 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
            ...{ 'onClick': {} },
            type: "success",
        }));
        const __VLS_34 = __VLS_33({
            ...{ 'onClick': {} },
            type: "success",
        }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        let __VLS_36;
        let __VLS_37;
        let __VLS_38;
        const __VLS_39 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.detail))
                    return;
                if (!(__VLS_ctx.detail.status === 3 || __VLS_ctx.detail.status === 4))
                    return;
                __VLS_ctx.router.push(`/consultations/${__VLS_ctx.id}/room`);
            }
        };
        __VLS_35.slots.default;
        var __VLS_35;
    }
    if (__VLS_ctx.detail.report?.status === 0 && (__VLS_ctx.detail.status === 3 || __VLS_ctx.detail.status === 4)) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ style: {} },
        });
        const __VLS_40 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
            ...{ 'onClick': {} },
            type: "primary",
        }));
        const __VLS_42 = __VLS_41({
            ...{ 'onClick': {} },
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        let __VLS_44;
        let __VLS_45;
        let __VLS_46;
        const __VLS_47 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.detail))
                    return;
                if (!(__VLS_ctx.detail.report?.status === 0 && (__VLS_ctx.detail.status === 3 || __VLS_ctx.detail.status === 4)))
                    return;
                __VLS_ctx.router.push(`/consultations/${__VLS_ctx.id}/report`);
            }
        };
        __VLS_43.slots.default;
        var __VLS_43;
    }
    if (__VLS_ctx.detail.status === 4) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ style: {} },
        });
        const __VLS_48 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
            type: "warning",
            size: "large",
        }));
        const __VLS_50 = __VLS_49({
            type: "warning",
            size: "large",
        }, ...__VLS_functionalComponentArgsRest(__VLS_49));
        __VLS_51.slots.default;
        var __VLS_51;
    }
    if (__VLS_ctx.detail.status === 5) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ style: {} },
        });
        const __VLS_52 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
            type: "success",
            size: "large",
        }));
        const __VLS_54 = __VLS_53({
            type: "success",
            size: "large",
        }, ...__VLS_functionalComponentArgsRest(__VLS_53));
        __VLS_55.slots.default;
        var __VLS_55;
    }
    if (__VLS_ctx.detail.status === 6) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ style: {} },
        });
        const __VLS_56 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
            type: "info",
            size: "large",
        }));
        const __VLS_58 = __VLS_57({
            type: "info",
            size: "large",
        }, ...__VLS_functionalComponentArgsRest(__VLS_57));
        __VLS_59.slots.default;
        var __VLS_59;
        if (__VLS_ctx.detail.report) {
            const __VLS_60 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
                ...{ 'onClick': {} },
                type: "primary",
                ...{ style: {} },
            }));
            const __VLS_62 = __VLS_61({
                ...{ 'onClick': {} },
                type: "primary",
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_61));
            let __VLS_64;
            let __VLS_65;
            let __VLS_66;
            const __VLS_67 = {
                onClick: (...[$event]) => {
                    if (!(__VLS_ctx.detail))
                        return;
                    if (!(__VLS_ctx.detail.status === 6))
                        return;
                    if (!(__VLS_ctx.detail.report))
                        return;
                    __VLS_ctx.router.push(`/consultations/${__VLS_ctx.id}/report`);
                }
            };
            __VLS_63.slots.default;
            var __VLS_63;
        }
    }
    const __VLS_68 = {}.ElTabs;
    /** @type {[typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, ]} */ ;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({}));
    const __VLS_70 = __VLS_69({}, ...__VLS_functionalComponentArgsRest(__VLS_69));
    __VLS_71.slots.default;
    const __VLS_72 = {}.ElTabPane;
    /** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
        label: "患者信息",
    }));
    const __VLS_74 = __VLS_73({
        label: "患者信息",
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    __VLS_75.slots.default;
    const __VLS_76 = {}.ElDescriptions;
    /** @type {[typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, ]} */ ;
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
        column: (2),
        border: true,
    }));
    const __VLS_78 = __VLS_77({
        column: (2),
        border: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_77));
    __VLS_79.slots.default;
    const __VLS_80 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
        label: "姓名",
    }));
    const __VLS_82 = __VLS_81({
        label: "姓名",
    }, ...__VLS_functionalComponentArgsRest(__VLS_81));
    __VLS_83.slots.default;
    (__VLS_ctx.detail.patientName);
    var __VLS_83;
    const __VLS_84 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
        label: "年龄",
    }));
    const __VLS_86 = __VLS_85({
        label: "年龄",
    }, ...__VLS_functionalComponentArgsRest(__VLS_85));
    __VLS_87.slots.default;
    (__VLS_ctx.detail.patientAge);
    var __VLS_87;
    const __VLS_88 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
        label: "性别",
    }));
    const __VLS_90 = __VLS_89({
        label: "性别",
    }, ...__VLS_functionalComponentArgsRest(__VLS_89));
    __VLS_91.slots.default;
    (__VLS_ctx.detail.patientGender);
    var __VLS_91;
    const __VLS_92 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
        label: "科室",
    }));
    const __VLS_94 = __VLS_93({
        label: "科室",
    }, ...__VLS_functionalComponentArgsRest(__VLS_93));
    __VLS_95.slots.default;
    (__VLS_ctx.detail.department);
    var __VLS_95;
    const __VLS_96 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
        label: "主诉",
        span: (2),
    }));
    const __VLS_98 = __VLS_97({
        label: "主诉",
        span: (2),
    }, ...__VLS_functionalComponentArgsRest(__VLS_97));
    __VLS_99.slots.default;
    (__VLS_ctx.detail.chiefComplaint);
    var __VLS_99;
    var __VLS_79;
    var __VLS_75;
    const __VLS_100 = {}.ElTabPane;
    /** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
        label: "病情摘要",
    }));
    const __VLS_102 = __VLS_101({
        label: "病情摘要",
    }, ...__VLS_functionalComponentArgsRest(__VLS_101));
    __VLS_103.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: {} },
    });
    (__VLS_ctx.detail.medicalSummary || '暂无');
    var __VLS_103;
    const __VLS_104 = {}.ElTabPane;
    /** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
        label: "上传资料",
    }));
    const __VLS_106 = __VLS_105({
        label: "上传资料",
    }, ...__VLS_functionalComponentArgsRest(__VLS_105));
    __VLS_107.slots.default;
    const __VLS_108 = {}.ElTable;
    /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
    // @ts-ignore
    const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
        data: (__VLS_ctx.detail.uploads),
        stripe: true,
    }));
    const __VLS_110 = __VLS_109({
        data: (__VLS_ctx.detail.uploads),
        stripe: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_109));
    __VLS_111.slots.default;
    const __VLS_112 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
        prop: "fileName",
        label: "文件名",
    }));
    const __VLS_114 = __VLS_113({
        prop: "fileName",
        label: "文件名",
    }, ...__VLS_functionalComponentArgsRest(__VLS_113));
    const __VLS_116 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
        prop: "fileType",
        label: "类型",
        width: "100",
    }));
    const __VLS_118 = __VLS_117({
        prop: "fileType",
        label: "类型",
        width: "100",
    }, ...__VLS_functionalComponentArgsRest(__VLS_117));
    __VLS_119.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_119.slots;
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        (['', '检查报告', '影像资料', '病历资料', '其他', '化验单'][row.fileType] || '其他');
    }
    var __VLS_119;
    const __VLS_120 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
        label: "OCR结果",
        minWidth: "200",
    }));
    const __VLS_122 = __VLS_121({
        label: "OCR结果",
        minWidth: "200",
    }, ...__VLS_functionalComponentArgsRest(__VLS_121));
    __VLS_123.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_123.slots;
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        (__VLS_ctx.formatOcrLabel(row.ocrResult));
    }
    var __VLS_123;
    const __VLS_124 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
        label: "操作",
        width: "100",
    }));
    const __VLS_126 = __VLS_125({
        label: "操作",
        width: "100",
    }, ...__VLS_functionalComponentArgsRest(__VLS_125));
    __VLS_127.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_127.slots;
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
            href: (row.fileUrl),
            target: "_blank",
            ...{ style: {} },
        });
    }
    var __VLS_127;
    var __VLS_111;
    var __VLS_107;
    const __VLS_128 = {}.ElTabPane;
    /** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
        label: "问诊记录",
    }));
    const __VLS_130 = __VLS_129({
        label: "问诊记录",
    }, ...__VLS_functionalComponentArgsRest(__VLS_129));
    __VLS_131.slots.default;
    for (const [msg, idx] of __VLS_getVForSourceType((__VLS_ctx.detail.chatHistory))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (idx),
            ...{ style: ({ textAlign: msg.role === 'user' ? 'right' : 'left', margin: '8px 0' }) },
        });
        const __VLS_132 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
            type: (msg.role === 'ai' ? 'success' : msg.role === 'user' ? '' : 'info'),
            size: "small",
        }));
        const __VLS_134 = __VLS_133({
            type: (msg.role === 'ai' ? 'success' : msg.role === 'user' ? '' : 'info'),
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_133));
        __VLS_135.slots.default;
        (msg.role === 'user' ? '患者' : msg.role === 'ai' ? 'AI' : '系统');
        var __VLS_135;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ style: {} },
        });
        (msg.content);
    }
    var __VLS_131;
    if (__VLS_ctx.detail.report) {
        const __VLS_136 = {}.ElTabPane;
        /** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
        // @ts-ignore
        const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
            label: "报告",
        }));
        const __VLS_138 = __VLS_137({
            label: "报告",
        }, ...__VLS_functionalComponentArgsRest(__VLS_137));
        __VLS_139.slots.default;
        const __VLS_140 = {}.ElDescriptions;
        /** @type {[typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, ]} */ ;
        // @ts-ignore
        const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
            column: (1),
            border: true,
        }));
        const __VLS_142 = __VLS_141({
            column: (1),
            border: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_141));
        __VLS_143.slots.default;
        const __VLS_144 = {}.ElDescriptionsItem;
        /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
        // @ts-ignore
        const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
            label: "状态",
        }));
        const __VLS_146 = __VLS_145({
            label: "状态",
        }, ...__VLS_functionalComponentArgsRest(__VLS_145));
        __VLS_147.slots.default;
        const __VLS_148 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
            type: (__VLS_ctx.detail.report.status === 0 ? 'warning' : __VLS_ctx.detail.report.status === 1 ? 'success' : 'info'),
        }));
        const __VLS_150 = __VLS_149({
            type: (__VLS_ctx.detail.report.status === 0 ? 'warning' : __VLS_ctx.detail.report.status === 1 ? 'success' : 'info'),
        }, ...__VLS_functionalComponentArgsRest(__VLS_149));
        __VLS_151.slots.default;
        (['草稿', '待质控', '已签发'][__VLS_ctx.detail.report.status]);
        var __VLS_151;
        var __VLS_147;
        if (__VLS_ctx.detail.report.signedByName) {
            const __VLS_152 = {}.ElDescriptionsItem;
            /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
            // @ts-ignore
            const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
                label: "签发人",
            }));
            const __VLS_154 = __VLS_153({
                label: "签发人",
            }, ...__VLS_functionalComponentArgsRest(__VLS_153));
            __VLS_155.slots.default;
            (__VLS_ctx.detail.report.signedByName);
            var __VLS_155;
        }
        var __VLS_143;
        const __VLS_156 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
            ...{ 'onClick': {} },
            type: "primary",
            ...{ style: {} },
        }));
        const __VLS_158 = __VLS_157({
            ...{ 'onClick': {} },
            type: "primary",
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_157));
        let __VLS_160;
        let __VLS_161;
        let __VLS_162;
        const __VLS_163 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.detail))
                    return;
                if (!(__VLS_ctx.detail.report))
                    return;
                __VLS_ctx.router.push(`/consultations/${__VLS_ctx.id}/report`);
            }
        };
        __VLS_159.slots.default;
        var __VLS_159;
        var __VLS_139;
    }
    if (__VLS_ctx.detail.report?.fields) {
        const __VLS_164 = {}.ElTabPane;
        /** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
        // @ts-ignore
        const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
            label: "报告详情",
        }));
        const __VLS_166 = __VLS_165({
            label: "报告详情",
        }, ...__VLS_functionalComponentArgsRest(__VLS_165));
        __VLS_167.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ style: {} },
        });
        for (const [label, key] of __VLS_getVForSourceType((__VLS_ctx.reportFieldLabels))) {
            const __VLS_168 = {}.ElCard;
            /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
            // @ts-ignore
            const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
                key: (key),
                ...{ style: {} },
            }));
            const __VLS_170 = __VLS_169({
                key: (key),
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_169));
            __VLS_171.slots.default;
            {
                const { header: __VLS_thisSlot } = __VLS_171.slots;
                __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
                (label);
            }
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ style: {} },
            });
            (__VLS_ctx.detail.report.fields[key] || '无');
            var __VLS_171;
        }
        var __VLS_167;
    }
    const __VLS_172 = {}.ElTabPane;
    /** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
        label: "随访记录",
    }));
    const __VLS_174 = __VLS_173({
        label: "随访记录",
    }, ...__VLS_functionalComponentArgsRest(__VLS_173));
    __VLS_175.slots.default;
    const __VLS_176 = {}.ElTable;
    /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
    // @ts-ignore
    const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
        data: (__VLS_ctx.followUps),
        stripe: true,
    }));
    const __VLS_178 = __VLS_177({
        data: (__VLS_ctx.followUps),
        stripe: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_177));
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.followUpLoading) }, null, null);
    __VLS_179.slots.default;
    const __VLS_180 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
        label: "随访天数",
    }));
    const __VLS_182 = __VLS_181({
        label: "随访天数",
    }, ...__VLS_functionalComponentArgsRest(__VLS_181));
    __VLS_183.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_183.slots;
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        (row.planDay);
    }
    var __VLS_183;
    const __VLS_184 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
        label: "状态",
        width: "100",
    }));
    const __VLS_186 = __VLS_185({
        label: "状态",
        width: "100",
    }, ...__VLS_functionalComponentArgsRest(__VLS_185));
    __VLS_187.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_187.slots;
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_188 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
            type: (['info', '', 'success', 'danger'][row.status] || 'info'),
            size: "small",
        }));
        const __VLS_190 = __VLS_189({
            type: (['info', '', 'success', 'danger'][row.status] || 'info'),
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_189));
        __VLS_191.slots.default;
        (['待发送', '已发送', '已回复', '异常'][row.status] || '未知');
        var __VLS_191;
    }
    var __VLS_187;
    const __VLS_192 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
        prop: "sendTime",
        label: "发送时间",
        width: "160",
    }));
    const __VLS_194 = __VLS_193({
        prop: "sendTime",
        label: "发送时间",
        width: "160",
    }, ...__VLS_functionalComponentArgsRest(__VLS_193));
    const __VLS_196 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
        prop: "answerTime",
        label: "回复时间",
        width: "160",
    }));
    const __VLS_198 = __VLS_197({
        prop: "answerTime",
        label: "回复时间",
        width: "160",
    }, ...__VLS_functionalComponentArgsRest(__VLS_197));
    const __VLS_200 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({
        label: "操作",
        width: "100",
    }));
    const __VLS_202 = __VLS_201({
        label: "操作",
        width: "100",
    }, ...__VLS_functionalComponentArgsRest(__VLS_201));
    __VLS_203.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_203.slots;
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_204 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({
            ...{ 'onClick': {} },
            link: true,
            type: "primary",
        }));
        const __VLS_206 = __VLS_205({
            ...{ 'onClick': {} },
            link: true,
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_205));
        let __VLS_208;
        let __VLS_209;
        let __VLS_210;
        const __VLS_211 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.detail))
                    return;
                __VLS_ctx.showFollowUpDetail(row);
            }
        };
        __VLS_207.slots.default;
        var __VLS_207;
    }
    var __VLS_203;
    var __VLS_179;
    var __VLS_175;
    var __VLS_71;
}
const __VLS_212 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_213 = __VLS_asFunctionalComponent(__VLS_212, new __VLS_212({
    modelValue: (__VLS_ctx.showRejectDialog),
    title: "拒绝原因",
    width: "400px",
}));
const __VLS_214 = __VLS_213({
    modelValue: (__VLS_ctx.showRejectDialog),
    title: "拒绝原因",
    width: "400px",
}, ...__VLS_functionalComponentArgsRest(__VLS_213));
__VLS_215.slots.default;
const __VLS_216 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_217 = __VLS_asFunctionalComponent(__VLS_216, new __VLS_216({
    modelValue: (__VLS_ctx.rejectReason),
    type: "textarea",
    rows: (3),
    placeholder: "请输入拒绝原因",
}));
const __VLS_218 = __VLS_217({
    modelValue: (__VLS_ctx.rejectReason),
    type: "textarea",
    rows: (3),
    placeholder: "请输入拒绝原因",
}, ...__VLS_functionalComponentArgsRest(__VLS_217));
{
    const { footer: __VLS_thisSlot } = __VLS_215.slots;
    const __VLS_220 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({
        ...{ 'onClick': {} },
    }));
    const __VLS_222 = __VLS_221({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_221));
    let __VLS_224;
    let __VLS_225;
    let __VLS_226;
    const __VLS_227 = {
        onClick: (...[$event]) => {
            __VLS_ctx.showRejectDialog = false;
        }
    };
    __VLS_223.slots.default;
    var __VLS_223;
    const __VLS_228 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_229 = __VLS_asFunctionalComponent(__VLS_228, new __VLS_228({
        ...{ 'onClick': {} },
        type: "danger",
        loading: (__VLS_ctx.actionLoading),
    }));
    const __VLS_230 = __VLS_229({
        ...{ 'onClick': {} },
        type: "danger",
        loading: (__VLS_ctx.actionLoading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_229));
    let __VLS_232;
    let __VLS_233;
    let __VLS_234;
    const __VLS_235 = {
        onClick: (__VLS_ctx.handleReject)
    };
    __VLS_231.slots.default;
    var __VLS_231;
}
var __VLS_215;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            formatOcrLabel: formatOcrLabel,
            router: router,
            id: id,
            loading: loading,
            actionLoading: actionLoading,
            detail: detail,
            showRejectDialog: showRejectDialog,
            rejectReason: rejectReason,
            followUps: followUps,
            followUpLoading: followUpLoading,
            reportFieldLabels: reportFieldLabels,
            handleConfirm: handleConfirm,
            handleReject: handleReject,
            handleGenerateReport: handleGenerateReport,
            showFollowUpDetail: showFollowUpDetail,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
