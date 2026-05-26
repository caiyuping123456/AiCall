/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getAdminConsultationDetail, cancelAdminConsultation, getAdminDoctors, assignConsultationDoctors, getLiveRoomByConsultation, getLiveRecordings, getConsultationTimeline } from '@aicall/shared';
const route = useRoute();
const router = useRouter();
const id = Number(route.params.id);
const loading = ref(false);
const actionLoading = ref(false);
const detail = ref(null);
const showCancelDialog = ref(false);
const cancelReason = ref('');
const showAssignDialog = ref(false);
const assignRows = ref([{ doctorId: null, role: 0 }]);
const allDoctors = ref([]);
const recordings = ref([]);
const timeline = ref([]);
const showPlayer = ref(false);
const playingUrl = ref('');
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
function tryParseJson(content) {
    if (!content)
        return null;
    try {
        let json = content.trim();
        if (json.startsWith('```')) {
            json = json.replace(/```json\s*/i, '').replace(/```\s*$/i, '');
        }
        const obj = JSON.parse(json);
        if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
            return obj;
        }
        return null;
    }
    catch {
        return null;
    }
}
const parsedReportFields = computed(() => {
    if (!detail.value?.report?.content)
        return null;
    return tryParseJson(detail.value.report.content);
});
const consultationStatusMap = {
    0: '已提交', 1: '资料审核中', 2: '专家确认中', 3: '已排期',
    4: '待会诊', 5: '报告已签发', 6: '已完成', 7: '已取消', 8: '已退回',
};
onMounted(() => loadData());
async function loadData() {
    loading.value = true;
    try {
        detail.value = await getAdminConsultationDetail(id);
        try {
            const room = await getLiveRoomByConsultation(id);
            if (room) {
                recordings.value = await getLiveRecordings(room.id);
            }
        }
        catch { /* recordings optional */ }
        try {
            timeline.value = await getConsultationTimeline(id);
        }
        catch { /* timeline optional */ }
    }
    catch (e) {
        ElMessage.error(e.message || '加载失败');
    }
    finally {
        loading.value = false;
    }
}
function openAssignDialog() {
    assignRows.value = [{ doctorId: null, role: 0 }];
    showAssignDialog.value = true;
}
async function loadAllDoctors() {
    if (allDoctors.value.length)
        return;
    try {
        const res = await getAdminDoctors({ page: 1, size: 200 });
        allDoctors.value = res.list;
    }
    catch { /* ignore */ }
}
async function handleAssign() {
    const valid = assignRows.value.filter(r => r.doctorId);
    if (!valid.length) {
        ElMessage.warning('请至少选择一个医生');
        return;
    }
    actionLoading.value = true;
    try {
        await assignConsultationDoctors(id, valid.map(r => ({ doctorId: r.doctorId, role: r.role })));
        ElMessage.success('指派成功');
        showAssignDialog.value = false;
        await loadData();
    }
    catch (e) {
        ElMessage.error(e.message || '指派失败');
    }
    finally {
        actionLoading.value = false;
    }
}
async function handleCancel() {
    if (!cancelReason.value) {
        ElMessage.warning('请输入取消原因');
        return;
    }
    actionLoading.value = true;
    try {
        await cancelAdminConsultation(id, cancelReason.value);
        ElMessage.success('会诊已取消');
        router.push('/consultations');
    }
    catch (e) {
        ElMessage.error(e.message || '操作失败');
    }
    finally {
        actionLoading.value = false;
    }
}
function statusTagType(status) {
    const map = {
        0: 'info', 1: 'warning', 2: 'warning', 3: '', 4: 'warning', 5: 'success', 6: 'success', 7: 'danger', 8: 'danger'
    };
    return map[status] || 'info';
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
    content: "会诊详情",
    ...{ style: {} },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onBack': {} },
    title: "返回",
    content: "会诊详情",
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
    if (__VLS_ctx.detail.status < 4) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ style: {} },
        });
        const __VLS_8 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
            ...{ 'onClick': {} },
            type: "danger",
        }));
        const __VLS_10 = __VLS_9({
            ...{ 'onClick': {} },
            type: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_9));
        let __VLS_12;
        let __VLS_13;
        let __VLS_14;
        const __VLS_15 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.detail))
                    return;
                if (!(__VLS_ctx.detail.status < 4))
                    return;
                __VLS_ctx.showCancelDialog = true;
            }
        };
        __VLS_11.slots.default;
        var __VLS_11;
    }
    const __VLS_16 = {}.ElDescriptions;
    /** @type {[typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        column: (2),
        border: true,
        ...{ style: {} },
    }));
    const __VLS_18 = __VLS_17({
        column: (2),
        border: true,
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    __VLS_19.slots.default;
    const __VLS_20 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        label: "会诊编号",
    }));
    const __VLS_22 = __VLS_21({
        label: "会诊编号",
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_23.slots.default;
    (__VLS_ctx.detail.consultationNo);
    var __VLS_23;
    const __VLS_24 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        label: "患者姓名",
    }));
    const __VLS_26 = __VLS_25({
        label: "患者姓名",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    __VLS_27.slots.default;
    (__VLS_ctx.detail.patientName);
    var __VLS_27;
    const __VLS_28 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        label: "年龄",
    }));
    const __VLS_30 = __VLS_29({
        label: "年龄",
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    __VLS_31.slots.default;
    (__VLS_ctx.detail.patientAge);
    var __VLS_31;
    const __VLS_32 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        label: "性别",
    }));
    const __VLS_34 = __VLS_33({
        label: "性别",
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    __VLS_35.slots.default;
    (__VLS_ctx.detail.patientGender);
    var __VLS_35;
    const __VLS_36 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        label: "科室",
    }));
    const __VLS_38 = __VLS_37({
        label: "科室",
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    __VLS_39.slots.default;
    (__VLS_ctx.detail.department);
    var __VLS_39;
    const __VLS_40 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        label: "状态",
    }));
    const __VLS_42 = __VLS_41({
        label: "状态",
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    __VLS_43.slots.default;
    const __VLS_44 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        type: (__VLS_ctx.statusTagType(__VLS_ctx.detail.status)),
    }));
    const __VLS_46 = __VLS_45({
        type: (__VLS_ctx.statusTagType(__VLS_ctx.detail.status)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    __VLS_47.slots.default;
    (__VLS_ctx.consultationStatusMap[__VLS_ctx.detail.status] || '未知');
    var __VLS_47;
    var __VLS_43;
    const __VLS_48 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
        label: "费用",
    }));
    const __VLS_50 = __VLS_49({
        label: "费用",
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    __VLS_51.slots.default;
    (__VLS_ctx.detail.fee ?? '0');
    var __VLS_51;
    const __VLS_52 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        label: "支付状态",
    }));
    const __VLS_54 = __VLS_53({
        label: "支付状态",
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    __VLS_55.slots.default;
    const __VLS_56 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
        type: (__VLS_ctx.detail.paymentStatus === 1 ? 'success' : 'info'),
        size: "small",
    }));
    const __VLS_58 = __VLS_57({
        type: (__VLS_ctx.detail.paymentStatus === 1 ? 'success' : 'info'),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    __VLS_59.slots.default;
    (['', '已支付', '已退款'][__VLS_ctx.detail.paymentStatus] || '未支付');
    var __VLS_59;
    var __VLS_55;
    const __VLS_60 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
        label: "主诉",
        span: (2),
    }));
    const __VLS_62 = __VLS_61({
        label: "主诉",
        span: (2),
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    __VLS_63.slots.default;
    (__VLS_ctx.detail.chiefComplaint || '无');
    var __VLS_63;
    const __VLS_64 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
        label: "AI摘要",
        span: (2),
    }));
    const __VLS_66 = __VLS_65({
        label: "AI摘要",
        span: (2),
    }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    __VLS_67.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: {} },
    });
    (__VLS_ctx.detail.medicalSummary || '暂无');
    var __VLS_67;
    if (__VLS_ctx.detail.cancelReason) {
        const __VLS_68 = {}.ElDescriptionsItem;
        /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
        // @ts-ignore
        const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
            label: "取消原因",
            span: (2),
        }));
        const __VLS_70 = __VLS_69({
            label: "取消原因",
            span: (2),
        }, ...__VLS_functionalComponentArgsRest(__VLS_69));
        __VLS_71.slots.default;
        (__VLS_ctx.detail.cancelReason);
        var __VLS_71;
    }
    var __VLS_19;
    const __VLS_72 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
        header: "流程追踪",
        ...{ style: {} },
    }));
    const __VLS_74 = __VLS_73({
        header: "流程追踪",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    __VLS_75.slots.default;
    if (__VLS_ctx.timeline.length) {
        const __VLS_76 = {}.ElTimeline;
        /** @type {[typeof __VLS_components.ElTimeline, typeof __VLS_components.elTimeline, typeof __VLS_components.ElTimeline, typeof __VLS_components.elTimeline, ]} */ ;
        // @ts-ignore
        const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({}));
        const __VLS_78 = __VLS_77({}, ...__VLS_functionalComponentArgsRest(__VLS_77));
        __VLS_79.slots.default;
        for (const [item] of __VLS_getVForSourceType((__VLS_ctx.timeline))) {
            const __VLS_80 = {}.ElTimelineItem;
            /** @type {[typeof __VLS_components.ElTimelineItem, typeof __VLS_components.elTimelineItem, typeof __VLS_components.ElTimelineItem, typeof __VLS_components.elTimelineItem, ]} */ ;
            // @ts-ignore
            const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
                key: (item.status),
                timestamp: (item.time),
                color: (item.status === __VLS_ctx.detail.status ? '#409eff' : ''),
            }));
            const __VLS_82 = __VLS_81({
                key: (item.status),
                timestamp: (item.time),
                color: (item.status === __VLS_ctx.detail.status ? '#409eff' : ''),
            }, ...__VLS_functionalComponentArgsRest(__VLS_81));
            __VLS_83.slots.default;
            (item.label);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ style: {} },
            });
            (item.operator);
            var __VLS_83;
        }
        var __VLS_79;
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ style: {} },
        });
    }
    var __VLS_75;
    const __VLS_84 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
        header: "指派医生",
        ...{ style: {} },
    }));
    const __VLS_86 = __VLS_85({
        header: "指派医生",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_85));
    __VLS_87.slots.default;
    {
        const { header: __VLS_thisSlot } = __VLS_87.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        if (__VLS_ctx.detail.status < 3) {
            const __VLS_88 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
                ...{ 'onClick': {} },
                type: "primary",
                size: "small",
            }));
            const __VLS_90 = __VLS_89({
                ...{ 'onClick': {} },
                type: "primary",
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_89));
            let __VLS_92;
            let __VLS_93;
            let __VLS_94;
            const __VLS_95 = {
                onClick: (__VLS_ctx.openAssignDialog)
            };
            __VLS_91.slots.default;
            var __VLS_91;
        }
    }
    const __VLS_96 = {}.ElTable;
    /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
        data: (__VLS_ctx.detail.assignedDoctors ?? []),
        stripe: true,
    }));
    const __VLS_98 = __VLS_97({
        data: (__VLS_ctx.detail.assignedDoctors ?? []),
        stripe: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_97));
    __VLS_99.slots.default;
    const __VLS_100 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
        prop: "name",
        label: "姓名",
    }));
    const __VLS_102 = __VLS_101({
        prop: "name",
        label: "姓名",
    }, ...__VLS_functionalComponentArgsRest(__VLS_101));
    const __VLS_104 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
        prop: "title",
        label: "职称",
    }));
    const __VLS_106 = __VLS_105({
        prop: "title",
        label: "职称",
    }, ...__VLS_functionalComponentArgsRest(__VLS_105));
    const __VLS_108 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
        prop: "department",
        label: "科室",
    }));
    const __VLS_110 = __VLS_109({
        prop: "department",
        label: "科室",
    }, ...__VLS_functionalComponentArgsRest(__VLS_109));
    const __VLS_112 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
        label: "角色",
        width: "100",
    }));
    const __VLS_114 = __VLS_113({
        label: "角色",
        width: "100",
    }, ...__VLS_functionalComponentArgsRest(__VLS_113));
    __VLS_115.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_115.slots;
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        (row.role === 1 ? '主持人' : '专家');
    }
    var __VLS_115;
    const __VLS_116 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
        label: "确认状态",
        width: "100",
    }));
    const __VLS_118 = __VLS_117({
        label: "确认状态",
        width: "100",
    }, ...__VLS_functionalComponentArgsRest(__VLS_117));
    __VLS_119.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_119.slots;
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_120 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
            type: (['warning', 'success', 'danger'][row.confirmStatus]),
            size: "small",
        }));
        const __VLS_122 = __VLS_121({
            type: (['warning', 'success', 'danger'][row.confirmStatus]),
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_121));
        __VLS_123.slots.default;
        (['待确认', '已确认', '已拒绝'][row.confirmStatus] ?? '未知');
        var __VLS_123;
    }
    var __VLS_119;
    var __VLS_99;
    if (!__VLS_ctx.detail.assignedDoctors?.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ style: {} },
        });
    }
    var __VLS_87;
    if (__VLS_ctx.detail.uploads?.length) {
        const __VLS_124 = {}.ElCard;
        /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
        // @ts-ignore
        const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
            header: "上传资料",
        }));
        const __VLS_126 = __VLS_125({
            header: "上传资料",
        }, ...__VLS_functionalComponentArgsRest(__VLS_125));
        __VLS_127.slots.default;
        const __VLS_128 = {}.ElTable;
        /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
        // @ts-ignore
        const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
            data: (__VLS_ctx.detail.uploads),
            stripe: true,
        }));
        const __VLS_130 = __VLS_129({
            data: (__VLS_ctx.detail.uploads),
            stripe: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_129));
        __VLS_131.slots.default;
        const __VLS_132 = {}.ElTableColumn;
        /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
            prop: "fileName",
            label: "文件名",
        }));
        const __VLS_134 = __VLS_133({
            prop: "fileName",
            label: "文件名",
        }, ...__VLS_functionalComponentArgsRest(__VLS_133));
        const __VLS_136 = {}.ElTableColumn;
        /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
            label: "操作",
            width: "100",
        }));
        const __VLS_138 = __VLS_137({
            label: "操作",
            width: "100",
        }, ...__VLS_functionalComponentArgsRest(__VLS_137));
        __VLS_139.slots.default;
        {
            const { default: __VLS_thisSlot } = __VLS_139.slots;
            const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
                href: (row.fileUrl),
                target: "_blank",
                ...{ style: {} },
            });
        }
        var __VLS_139;
        var __VLS_131;
        var __VLS_127;
    }
    if (__VLS_ctx.detail.minutes) {
        const __VLS_140 = {}.ElCard;
        /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
        // @ts-ignore
        const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
            header: "会诊纪要",
            ...{ style: {} },
        }));
        const __VLS_142 = __VLS_141({
            header: "会诊纪要",
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_141));
        __VLS_143.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ style: {} },
        });
        (__VLS_ctx.detail.minutes);
        var __VLS_143;
    }
    if (__VLS_ctx.detail.report) {
        const __VLS_144 = {}.ElCard;
        /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
        // @ts-ignore
        const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
            header: "会诊报告",
            ...{ style: {} },
        }));
        const __VLS_146 = __VLS_145({
            header: "会诊报告",
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_145));
        __VLS_147.slots.default;
        const __VLS_148 = {}.ElDescriptions;
        /** @type {[typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, ]} */ ;
        // @ts-ignore
        const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
            column: (2),
            border: true,
            ...{ style: {} },
        }));
        const __VLS_150 = __VLS_149({
            column: (2),
            border: true,
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_149));
        __VLS_151.slots.default;
        const __VLS_152 = {}.ElDescriptionsItem;
        /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
        // @ts-ignore
        const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
            label: "报告状态",
        }));
        const __VLS_154 = __VLS_153({
            label: "报告状态",
        }, ...__VLS_functionalComponentArgsRest(__VLS_153));
        __VLS_155.slots.default;
        const __VLS_156 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
            type: (__VLS_ctx.detail.report.status === 0 ? 'warning' : __VLS_ctx.detail.report.status === 1 ? 'primary' : 'success'),
        }));
        const __VLS_158 = __VLS_157({
            type: (__VLS_ctx.detail.report.status === 0 ? 'warning' : __VLS_ctx.detail.report.status === 1 ? 'primary' : 'success'),
        }, ...__VLS_functionalComponentArgsRest(__VLS_157));
        __VLS_159.slots.default;
        (['草稿', '待质控', '已签发'][__VLS_ctx.detail.report.status] || '未知');
        var __VLS_159;
        var __VLS_155;
        if (__VLS_ctx.detail.report.signedByName) {
            const __VLS_160 = {}.ElDescriptionsItem;
            /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
            // @ts-ignore
            const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
                label: "签发人",
            }));
            const __VLS_162 = __VLS_161({
                label: "签发人",
            }, ...__VLS_functionalComponentArgsRest(__VLS_161));
            __VLS_163.slots.default;
            (__VLS_ctx.detail.report.signedByName);
            var __VLS_163;
        }
        if (__VLS_ctx.detail.report.signedTime) {
            const __VLS_164 = {}.ElDescriptionsItem;
            /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
            // @ts-ignore
            const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
                label: "签发时间",
                span: (2),
            }));
            const __VLS_166 = __VLS_165({
                label: "签发时间",
                span: (2),
            }, ...__VLS_functionalComponentArgsRest(__VLS_165));
            __VLS_167.slots.default;
            (__VLS_ctx.detail.report.signedTime);
            var __VLS_167;
        }
        var __VLS_151;
        if (__VLS_ctx.parsedReportFields) {
            const __VLS_168 = {}.ElDescriptions;
            /** @type {[typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, ]} */ ;
            // @ts-ignore
            const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
                column: (1),
                border: true,
            }));
            const __VLS_170 = __VLS_169({
                column: (1),
                border: true,
            }, ...__VLS_functionalComponentArgsRest(__VLS_169));
            __VLS_171.slots.default;
            for (const [value, key] of __VLS_getVForSourceType((__VLS_ctx.parsedReportFields))) {
                const __VLS_172 = {}.ElDescriptionsItem;
                /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
                // @ts-ignore
                const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
                    key: (key),
                    label: (__VLS_ctx.reportFieldLabels[key] || key),
                }));
                const __VLS_174 = __VLS_173({
                    key: (key),
                    label: (__VLS_ctx.reportFieldLabels[key] || key),
                }, ...__VLS_functionalComponentArgsRest(__VLS_173));
                __VLS_175.slots.default;
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ style: {} },
                });
                (value);
                var __VLS_175;
            }
            var __VLS_171;
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ style: {} },
            });
            (__VLS_ctx.detail.report.content);
        }
        var __VLS_147;
    }
    if (__VLS_ctx.recordings.length) {
        const __VLS_176 = {}.ElCard;
        /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
        // @ts-ignore
        const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
            header: "会诊录像",
            ...{ style: {} },
        }));
        const __VLS_178 = __VLS_177({
            header: "会诊录像",
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_177));
        __VLS_179.slots.default;
        const __VLS_180 = {}.ElTable;
        /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
        // @ts-ignore
        const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
            data: (__VLS_ctx.recordings),
            stripe: true,
        }));
        const __VLS_182 = __VLS_181({
            data: (__VLS_ctx.recordings),
            stripe: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_181));
        __VLS_183.slots.default;
        const __VLS_184 = {}.ElTableColumn;
        /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
            label: "录像文件",
            minWidth: "200",
        }));
        const __VLS_186 = __VLS_185({
            label: "录像文件",
            minWidth: "200",
        }, ...__VLS_functionalComponentArgsRest(__VLS_185));
        __VLS_187.slots.default;
        {
            const { default: __VLS_thisSlot } = __VLS_187.slots;
            const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
                href: (row.fileUrl),
                target: "_blank",
                ...{ style: {} },
            });
            (row.fileUrl);
        }
        var __VLS_187;
        const __VLS_188 = {}.ElTableColumn;
        /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
            label: "时长",
            width: "100",
        }));
        const __VLS_190 = __VLS_189({
            label: "时长",
            width: "100",
        }, ...__VLS_functionalComponentArgsRest(__VLS_189));
        __VLS_191.slots.default;
        {
            const { default: __VLS_thisSlot } = __VLS_191.slots;
            const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
            (row.duration ? Math.floor(row.duration / 60) + '分' + (row.duration % 60) + '秒' : '-');
        }
        var __VLS_191;
        const __VLS_192 = {}.ElTableColumn;
        /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
            label: "文件大小",
            width: "120",
        }));
        const __VLS_194 = __VLS_193({
            label: "文件大小",
            width: "120",
        }, ...__VLS_functionalComponentArgsRest(__VLS_193));
        __VLS_195.slots.default;
        {
            const { default: __VLS_thisSlot } = __VLS_195.slots;
            const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
            (row.fileSize ? (row.fileSize / 1024 / 1024).toFixed(1) + ' MB' : '-');
        }
        var __VLS_195;
        const __VLS_196 = {}.ElTableColumn;
        /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
            label: "操作",
            width: "100",
        }));
        const __VLS_198 = __VLS_197({
            label: "操作",
            width: "100",
        }, ...__VLS_functionalComponentArgsRest(__VLS_197));
        __VLS_199.slots.default;
        {
            const { default: __VLS_thisSlot } = __VLS_199.slots;
            const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_200 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({
                ...{ 'onClick': {} },
                link: true,
                type: "primary",
            }));
            const __VLS_202 = __VLS_201({
                ...{ 'onClick': {} },
                link: true,
                type: "primary",
            }, ...__VLS_functionalComponentArgsRest(__VLS_201));
            let __VLS_204;
            let __VLS_205;
            let __VLS_206;
            const __VLS_207 = {
                onClick: (...[$event]) => {
                    if (!(__VLS_ctx.detail))
                        return;
                    if (!(__VLS_ctx.recordings.length))
                        return;
                    __VLS_ctx.playingUrl = row.fileUrl;
                    __VLS_ctx.showPlayer = true;
                }
            };
            __VLS_203.slots.default;
            var __VLS_203;
        }
        var __VLS_199;
        var __VLS_183;
        var __VLS_179;
    }
    const __VLS_208 = {}.ElDialog;
    /** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
    // @ts-ignore
    const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({
        ...{ 'onClose': {} },
        modelValue: (__VLS_ctx.showPlayer),
        title: "录像播放",
        width: "700px",
    }));
    const __VLS_210 = __VLS_209({
        ...{ 'onClose': {} },
        modelValue: (__VLS_ctx.showPlayer),
        title: "录像播放",
        width: "700px",
    }, ...__VLS_functionalComponentArgsRest(__VLS_209));
    let __VLS_212;
    let __VLS_213;
    let __VLS_214;
    const __VLS_215 = {
        onClose: (...[$event]) => {
            if (!(__VLS_ctx.detail))
                return;
            __VLS_ctx.playingUrl = '';
        }
    };
    __VLS_211.slots.default;
    if (__VLS_ctx.playingUrl) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.video)({
            src: (__VLS_ctx.playingUrl),
            controls: true,
            ...{ style: {} },
        });
    }
    var __VLS_211;
}
const __VLS_216 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_217 = __VLS_asFunctionalComponent(__VLS_216, new __VLS_216({
    ...{ 'onClose': {} },
    modelValue: (__VLS_ctx.showAssignDialog),
    title: "指派医生",
    width: "600px",
}));
const __VLS_218 = __VLS_217({
    ...{ 'onClose': {} },
    modelValue: (__VLS_ctx.showAssignDialog),
    title: "指派医生",
    width: "600px",
}, ...__VLS_functionalComponentArgsRest(__VLS_217));
let __VLS_220;
let __VLS_221;
let __VLS_222;
const __VLS_223 = {
    onClose: (...[$event]) => {
        __VLS_ctx.assignRows = [{ doctorId: null, role: 0 }];
    }
};
__VLS_219.slots.default;
for (const [row, index] of __VLS_getVForSourceType((__VLS_ctx.assignRows))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (index),
        ...{ style: {} },
    });
    const __VLS_224 = {}.ElSelect;
    /** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
    // @ts-ignore
    const __VLS_225 = __VLS_asFunctionalComponent(__VLS_224, new __VLS_224({
        ...{ 'onFocus': {} },
        modelValue: (row.doctorId),
        placeholder: "选择医生",
        filterable: true,
        ...{ style: {} },
    }));
    const __VLS_226 = __VLS_225({
        ...{ 'onFocus': {} },
        modelValue: (row.doctorId),
        placeholder: "选择医生",
        filterable: true,
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_225));
    let __VLS_228;
    let __VLS_229;
    let __VLS_230;
    const __VLS_231 = {
        onFocus: (...[$event]) => {
            __VLS_ctx.loadAllDoctors();
        }
    };
    __VLS_227.slots.default;
    for (const [d] of __VLS_getVForSourceType((__VLS_ctx.allDoctors))) {
        const __VLS_232 = {}.ElOption;
        /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
        // @ts-ignore
        const __VLS_233 = __VLS_asFunctionalComponent(__VLS_232, new __VLS_232({
            key: (d.id),
            label: (`${d.name} (${d.department || '无科室'} · ${d.title || '无职称'})`),
            value: (d.id),
        }));
        const __VLS_234 = __VLS_233({
            key: (d.id),
            label: (`${d.name} (${d.department || '无科室'} · ${d.title || '无职称'})`),
            value: (d.id),
        }, ...__VLS_functionalComponentArgsRest(__VLS_233));
    }
    var __VLS_227;
    const __VLS_236 = {}.ElSelect;
    /** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
    // @ts-ignore
    const __VLS_237 = __VLS_asFunctionalComponent(__VLS_236, new __VLS_236({
        modelValue: (row.role),
        ...{ style: {} },
    }));
    const __VLS_238 = __VLS_237({
        modelValue: (row.role),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_237));
    __VLS_239.slots.default;
    const __VLS_240 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_241 = __VLS_asFunctionalComponent(__VLS_240, new __VLS_240({
        value: (0),
        label: "普通专家",
    }));
    const __VLS_242 = __VLS_241({
        value: (0),
        label: "普通专家",
    }, ...__VLS_functionalComponentArgsRest(__VLS_241));
    const __VLS_244 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_245 = __VLS_asFunctionalComponent(__VLS_244, new __VLS_244({
        value: (1),
        label: "主持人",
    }));
    const __VLS_246 = __VLS_245({
        value: (1),
        label: "主持人",
    }, ...__VLS_functionalComponentArgsRest(__VLS_245));
    var __VLS_239;
    const __VLS_248 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_249 = __VLS_asFunctionalComponent(__VLS_248, new __VLS_248({
        ...{ 'onClick': {} },
        disabled: (__VLS_ctx.assignRows.length <= 1),
        link: true,
        type: "danger",
    }));
    const __VLS_250 = __VLS_249({
        ...{ 'onClick': {} },
        disabled: (__VLS_ctx.assignRows.length <= 1),
        link: true,
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_249));
    let __VLS_252;
    let __VLS_253;
    let __VLS_254;
    const __VLS_255 = {
        onClick: (...[$event]) => {
            __VLS_ctx.assignRows.splice(index, 1);
        }
    };
    __VLS_251.slots.default;
    var __VLS_251;
}
const __VLS_256 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_257 = __VLS_asFunctionalComponent(__VLS_256, new __VLS_256({
    ...{ 'onClick': {} },
    link: true,
    type: "primary",
    ...{ style: {} },
}));
const __VLS_258 = __VLS_257({
    ...{ 'onClick': {} },
    link: true,
    type: "primary",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_257));
let __VLS_260;
let __VLS_261;
let __VLS_262;
const __VLS_263 = {
    onClick: (...[$event]) => {
        __VLS_ctx.assignRows.push({ doctorId: null, role: 0 });
    }
};
__VLS_259.slots.default;
var __VLS_259;
{
    const { footer: __VLS_thisSlot } = __VLS_219.slots;
    const __VLS_264 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_265 = __VLS_asFunctionalComponent(__VLS_264, new __VLS_264({
        ...{ 'onClick': {} },
    }));
    const __VLS_266 = __VLS_265({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_265));
    let __VLS_268;
    let __VLS_269;
    let __VLS_270;
    const __VLS_271 = {
        onClick: (...[$event]) => {
            __VLS_ctx.showAssignDialog = false;
        }
    };
    __VLS_267.slots.default;
    var __VLS_267;
    const __VLS_272 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_273 = __VLS_asFunctionalComponent(__VLS_272, new __VLS_272({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.actionLoading),
    }));
    const __VLS_274 = __VLS_273({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.actionLoading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_273));
    let __VLS_276;
    let __VLS_277;
    let __VLS_278;
    const __VLS_279 = {
        onClick: (__VLS_ctx.handleAssign)
    };
    __VLS_275.slots.default;
    var __VLS_275;
}
var __VLS_219;
const __VLS_280 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_281 = __VLS_asFunctionalComponent(__VLS_280, new __VLS_280({
    modelValue: (__VLS_ctx.showCancelDialog),
    title: "取消会诊",
    width: "400px",
}));
const __VLS_282 = __VLS_281({
    modelValue: (__VLS_ctx.showCancelDialog),
    title: "取消会诊",
    width: "400px",
}, ...__VLS_functionalComponentArgsRest(__VLS_281));
__VLS_283.slots.default;
const __VLS_284 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_285 = __VLS_asFunctionalComponent(__VLS_284, new __VLS_284({
    modelValue: (__VLS_ctx.cancelReason),
    type: "textarea",
    rows: (3),
    placeholder: "请输入取消原因",
}));
const __VLS_286 = __VLS_285({
    modelValue: (__VLS_ctx.cancelReason),
    type: "textarea",
    rows: (3),
    placeholder: "请输入取消原因",
}, ...__VLS_functionalComponentArgsRest(__VLS_285));
{
    const { footer: __VLS_thisSlot } = __VLS_283.slots;
    const __VLS_288 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_289 = __VLS_asFunctionalComponent(__VLS_288, new __VLS_288({
        ...{ 'onClick': {} },
    }));
    const __VLS_290 = __VLS_289({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_289));
    let __VLS_292;
    let __VLS_293;
    let __VLS_294;
    const __VLS_295 = {
        onClick: (...[$event]) => {
            __VLS_ctx.showCancelDialog = false;
        }
    };
    __VLS_291.slots.default;
    var __VLS_291;
    const __VLS_296 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_297 = __VLS_asFunctionalComponent(__VLS_296, new __VLS_296({
        ...{ 'onClick': {} },
        type: "danger",
        loading: (__VLS_ctx.actionLoading),
    }));
    const __VLS_298 = __VLS_297({
        ...{ 'onClick': {} },
        type: "danger",
        loading: (__VLS_ctx.actionLoading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_297));
    let __VLS_300;
    let __VLS_301;
    let __VLS_302;
    const __VLS_303 = {
        onClick: (__VLS_ctx.handleCancel)
    };
    __VLS_299.slots.default;
    var __VLS_299;
}
var __VLS_283;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            router: router,
            loading: loading,
            actionLoading: actionLoading,
            detail: detail,
            showCancelDialog: showCancelDialog,
            cancelReason: cancelReason,
            showAssignDialog: showAssignDialog,
            assignRows: assignRows,
            allDoctors: allDoctors,
            recordings: recordings,
            timeline: timeline,
            showPlayer: showPlayer,
            playingUrl: playingUrl,
            reportFieldLabels: reportFieldLabels,
            parsedReportFields: parsedReportFields,
            consultationStatusMap: consultationStatusMap,
            openAssignDialog: openAssignDialog,
            loadAllDoctors: loadAllDoctors,
            handleAssign: handleAssign,
            handleCancel: handleCancel,
            statusTagType: statusTagType,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
