/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { showToast } from 'vant';
import { getConsultationDetail } from '@aicall/shared';
const route = useRoute();
const consultationId = Number(route.params.id);
const detail = ref(null);
const fieldLabels = {
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
const reportFields = computed(() => {
    if (!detail.value?.report?.content)
        return null;
    return tryParseJson(detail.value.report.content);
});
const statusMap = {
    '0': '草稿', '1': '资料审核中', '2': '已提交',
    '3': '已排期', '4': '待会诊', '5': '报告已签发', '6': '已完成',
    '7': '已取消', '8': '已退回',
};
const statusTag = {
    '0': 'default', '1': 'warning', '2': 'primary',
    '3': 'primary', '4': 'warning', '5': 'primary', '6': 'success',
    '7': 'default', '8': 'danger',
};
function genderText(v) {
    if (v === 1 || v === '1')
        return '男';
    if (v === 0 || v === '0')
        return '女';
    return '未填写';
}
function formatDate(date) {
    return date ? date.substring(0, 16).replace('T', ' ') : '';
}
// Only allow room entry during active consultation, NOT after report signed
const canEnterRoom = computed(() => detail.value && [3, 4].includes(detail.value.status));
onMounted(async () => {
    try {
        detail.value = await getConsultationDetail(consultationId);
    }
    catch (e) {
        showToast(e.message || '加载失败');
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['report-item']} */ ;
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
    title: "会诊详情",
    leftArrow: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClickLeft': {} },
    title: "会诊详情",
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
if (__VLS_ctx.detail) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "content" },
    });
    const __VLS_8 = {}.VanCellGroup;
    /** @type {[typeof __VLS_components.VanCellGroup, typeof __VLS_components.vanCellGroup, typeof __VLS_components.VanCellGroup, typeof __VLS_components.vanCellGroup, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        inset: true,
        title: "会诊信息",
    }));
    const __VLS_10 = __VLS_9({
        inset: true,
        title: "会诊信息",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    const __VLS_12 = {}.VanCell;
    /** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        title: "会诊编号",
        value: (__VLS_ctx.detail.consultationNo),
    }));
    const __VLS_14 = __VLS_13({
        title: "会诊编号",
        value: (__VLS_ctx.detail.consultationNo),
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    const __VLS_16 = {}.VanCell;
    /** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        title: "科室",
        value: (__VLS_ctx.detail.department || '未知'),
    }));
    const __VLS_18 = __VLS_17({
        title: "科室",
        value: (__VLS_ctx.detail.department || '未知'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    const __VLS_20 = {}.VanCell;
    /** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        title: "状态",
    }));
    const __VLS_22 = __VLS_21({
        title: "状态",
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_23.slots.default;
    {
        const { value: __VLS_thisSlot } = __VLS_23.slots;
        const __VLS_24 = {}.VanTag;
        /** @type {[typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, ]} */ ;
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
            type: (__VLS_ctx.statusTag[String(__VLS_ctx.detail.status)] || 'default'),
            size: "medium",
        }));
        const __VLS_26 = __VLS_25({
            type: (__VLS_ctx.statusTag[String(__VLS_ctx.detail.status)] || 'default'),
            size: "medium",
        }, ...__VLS_functionalComponentArgsRest(__VLS_25));
        __VLS_27.slots.default;
        (__VLS_ctx.statusMap[__VLS_ctx.detail.status] || '未知');
        var __VLS_27;
    }
    var __VLS_23;
    const __VLS_28 = {}.VanCell;
    /** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        title: "费用",
        value: ('¥' + (__VLS_ctx.detail.fee ?? 0)),
    }));
    const __VLS_30 = __VLS_29({
        title: "费用",
        value: ('¥' + (__VLS_ctx.detail.fee ?? 0)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    const __VLS_32 = {}.VanCell;
    /** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        title: "创建时间",
        value: (__VLS_ctx.formatDate(__VLS_ctx.detail.createTime)),
    }));
    const __VLS_34 = __VLS_33({
        title: "创建时间",
        value: (__VLS_ctx.formatDate(__VLS_ctx.detail.createTime)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    var __VLS_11;
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
        value: (__VLS_ctx.detail.patientName || '未填写'),
    }));
    const __VLS_42 = __VLS_41({
        title: "姓名",
        value: (__VLS_ctx.detail.patientName || '未填写'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    const __VLS_44 = {}.VanCell;
    /** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        title: "性别",
        value: (__VLS_ctx.genderText(__VLS_ctx.detail.patientGender)),
    }));
    const __VLS_46 = __VLS_45({
        title: "性别",
        value: (__VLS_ctx.genderText(__VLS_ctx.detail.patientGender)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    const __VLS_48 = {}.VanCell;
    /** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
        title: "年龄",
        value: (__VLS_ctx.detail.patientAge ? __VLS_ctx.detail.patientAge + '岁' : '未填写'),
    }));
    const __VLS_50 = __VLS_49({
        title: "年龄",
        value: (__VLS_ctx.detail.patientAge ? __VLS_ctx.detail.patientAge + '岁' : '未填写'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    var __VLS_39;
    if (__VLS_ctx.detail.doctorName) {
        const __VLS_52 = {}.VanCellGroup;
        /** @type {[typeof __VLS_components.VanCellGroup, typeof __VLS_components.vanCellGroup, typeof __VLS_components.VanCellGroup, typeof __VLS_components.vanCellGroup, ]} */ ;
        // @ts-ignore
        const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
            inset: true,
            title: "接诊医生",
            ...{ style: {} },
        }));
        const __VLS_54 = __VLS_53({
            inset: true,
            title: "接诊医生",
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_53));
        __VLS_55.slots.default;
        const __VLS_56 = {}.VanCell;
        /** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
        // @ts-ignore
        const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
            title: "医生姓名",
            value: (__VLS_ctx.detail.doctorName),
        }));
        const __VLS_58 = __VLS_57({
            title: "医生姓名",
            value: (__VLS_ctx.detail.doctorName),
        }, ...__VLS_functionalComponentArgsRest(__VLS_57));
        if (__VLS_ctx.detail.doctorTitle) {
            const __VLS_60 = {}.VanCell;
            /** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
            // @ts-ignore
            const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
                title: "职称",
                value: (__VLS_ctx.detail.doctorTitle),
            }));
            const __VLS_62 = __VLS_61({
                title: "职称",
                value: (__VLS_ctx.detail.doctorTitle),
            }, ...__VLS_functionalComponentArgsRest(__VLS_61));
        }
        if (__VLS_ctx.detail.doctorDepartment) {
            const __VLS_64 = {}.VanCell;
            /** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
            // @ts-ignore
            const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
                title: "科室",
                value: (__VLS_ctx.detail.doctorDepartment),
            }));
            const __VLS_66 = __VLS_65({
                title: "科室",
                value: (__VLS_ctx.detail.doctorDepartment),
            }, ...__VLS_functionalComponentArgsRest(__VLS_65));
        }
        var __VLS_55;
    }
    if (__VLS_ctx.detail.medicalSummary) {
        const __VLS_68 = {}.VanCellGroup;
        /** @type {[typeof __VLS_components.VanCellGroup, typeof __VLS_components.vanCellGroup, typeof __VLS_components.VanCellGroup, typeof __VLS_components.vanCellGroup, ]} */ ;
        // @ts-ignore
        const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
            inset: true,
            title: "病情摘要",
            ...{ style: {} },
        }));
        const __VLS_70 = __VLS_69({
            inset: true,
            title: "病情摘要",
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_69));
        __VLS_71.slots.default;
        const __VLS_72 = {}.VanCell;
        /** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
        // @ts-ignore
        const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({}));
        const __VLS_74 = __VLS_73({}, ...__VLS_functionalComponentArgsRest(__VLS_73));
        __VLS_75.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ style: {} },
        });
        (__VLS_ctx.detail.medicalSummary);
        var __VLS_75;
        var __VLS_71;
    }
    if (__VLS_ctx.detail.report) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "mobile-card" },
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "section-label" },
        });
        const __VLS_76 = {}.VanTag;
        /** @type {[typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, ]} */ ;
        // @ts-ignore
        const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
            type: (__VLS_ctx.detail.report.status === 0 ? 'warning' : __VLS_ctx.detail.report.status === 1 ? 'primary' : 'success'),
            size: "medium",
        }));
        const __VLS_78 = __VLS_77({
            type: (__VLS_ctx.detail.report.status === 0 ? 'warning' : __VLS_ctx.detail.report.status === 1 ? 'primary' : 'success'),
            size: "medium",
        }, ...__VLS_functionalComponentArgsRest(__VLS_77));
        __VLS_79.slots.default;
        (['草稿', '待质控', '已签发'][__VLS_ctx.detail.report.status] || '未知');
        var __VLS_79;
        if (__VLS_ctx.detail.report.signedByName) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ style: {} },
            });
            (__VLS_ctx.detail.report.signedByName);
            (__VLS_ctx.detail.report.signedTime);
        }
        if (__VLS_ctx.reportFields) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "report-fields" },
            });
            for (const [value, key] of __VLS_getVForSourceType((__VLS_ctx.reportFields))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    key: (key),
                    ...{ class: "report-item" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "report-item-label" },
                });
                (__VLS_ctx.fieldLabels[key] || key);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "report-item-value" },
                });
                (value);
            }
        }
        else if (__VLS_ctx.detail.report.content) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "report-content" },
            });
            (__VLS_ctx.detail.report.content);
        }
    }
    if (__VLS_ctx.canEnterRoom) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "enter-room" },
        });
        const __VLS_80 = {}.VanButton;
        /** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
        // @ts-ignore
        const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
            ...{ 'onClick': {} },
            type: "primary",
            size: "large",
            block: true,
        }));
        const __VLS_82 = __VLS_81({
            ...{ 'onClick': {} },
            type: "primary",
            size: "large",
            block: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_81));
        let __VLS_84;
        let __VLS_85;
        let __VLS_86;
        const __VLS_87 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.detail))
                    return;
                if (!(__VLS_ctx.canEnterRoom))
                    return;
                __VLS_ctx.$router.push(`/consultation/${__VLS_ctx.consultationId}/room`);
            }
        };
        __VLS_83.slots.default;
        var __VLS_83;
    }
}
else {
    const __VLS_88 = {}.VanEmpty;
    /** @type {[typeof __VLS_components.VanEmpty, typeof __VLS_components.vanEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
        description: "加载中...",
    }));
    const __VLS_90 = __VLS_89({
        description: "加载中...",
    }, ...__VLS_functionalComponentArgsRest(__VLS_89));
}
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-label']} */ ;
/** @type {__VLS_StyleScopedClasses['report-fields']} */ ;
/** @type {__VLS_StyleScopedClasses['report-item']} */ ;
/** @type {__VLS_StyleScopedClasses['report-item-label']} */ ;
/** @type {__VLS_StyleScopedClasses['report-item-value']} */ ;
/** @type {__VLS_StyleScopedClasses['report-content']} */ ;
/** @type {__VLS_StyleScopedClasses['enter-room']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            consultationId: consultationId,
            detail: detail,
            fieldLabels: fieldLabels,
            reportFields: reportFields,
            statusMap: statusMap,
            statusTag: statusTag,
            genderText: genderText,
            formatDate: formatDate,
            canEnterRoom: canEnterRoom,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
