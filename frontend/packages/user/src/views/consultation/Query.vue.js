/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { queryConsultations } from '@aicall/shared';
const router = useRouter();
const list = ref([]);
const STATUS_MAP = { 0: '草稿', 1: '资料审核中', 2: '已提交', 3: '已排期', 4: '待会诊', 5: '会诊中', 6: '已完成', 7: '已取消', 8: '已退回' };
function statusText(s) { return STATUS_MAP[s] || '未知'; }
function goDetail(item) {
    if (item.status >= 3) {
        router.push(`/consultation/${item.id}/status`);
    }
    else {
        router.push(`/consultation/${item.id}/summary`);
    }
}
function viewReport(item) {
    router.push(`/consultation/${item.id}/report`);
}
onMounted(async () => {
    try {
        list.value = await queryConsultations();
    }
    catch { }
});
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
    title: "查询会诊",
    leftArrow: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClickLeft': {} },
    title: "查询会诊",
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
if (__VLS_ctx.list.length > 0) {
    const __VLS_8 = {}.VanCellGroup;
    /** @type {[typeof __VLS_components.VanCellGroup, typeof __VLS_components.vanCellGroup, typeof __VLS_components.VanCellGroup, typeof __VLS_components.vanCellGroup, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        inset: true,
    }));
    const __VLS_10 = __VLS_9({
        inset: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.list))) {
        const __VLS_12 = {}.VanCell;
        /** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
            ...{ 'onClick': {} },
            key: (item.id),
            title: (item.consultationNo),
            label: (`状态: ${__VLS_ctx.statusText(item.status)}`),
            isLink: true,
        }));
        const __VLS_14 = __VLS_13({
            ...{ 'onClick': {} },
            key: (item.id),
            title: (item.consultationNo),
            label: (`状态: ${__VLS_ctx.statusText(item.status)}`),
            isLink: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_13));
        let __VLS_16;
        let __VLS_17;
        let __VLS_18;
        const __VLS_19 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.list.length > 0))
                    return;
                __VLS_ctx.goDetail(item);
            }
        };
        __VLS_15.slots.default;
        {
            const { extra: __VLS_thisSlot } = __VLS_15.slots;
            if (item.status >= 5) {
                const __VLS_20 = {}.VanButton;
                /** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
                // @ts-ignore
                const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
                    ...{ 'onClick': {} },
                    size: "small",
                    type: "primary",
                }));
                const __VLS_22 = __VLS_21({
                    ...{ 'onClick': {} },
                    size: "small",
                    type: "primary",
                }, ...__VLS_functionalComponentArgsRest(__VLS_21));
                let __VLS_24;
                let __VLS_25;
                let __VLS_26;
                const __VLS_27 = {
                    onClick: (...[$event]) => {
                        if (!(__VLS_ctx.list.length > 0))
                            return;
                        if (!(item.status >= 5))
                            return;
                        __VLS_ctx.viewReport(item);
                    }
                };
                __VLS_23.slots.default;
                var __VLS_23;
            }
        }
        var __VLS_15;
    }
    var __VLS_11;
}
else {
    const __VLS_28 = {}.VanEmpty;
    /** @type {[typeof __VLS_components.VanEmpty, typeof __VLS_components.vanEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        description: "暂无会诊记录",
    }));
    const __VLS_30 = __VLS_29({
        description: "暂无会诊记录",
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
}
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            list: list,
            statusText: statusText,
            goDetail: goDetail,
            viewReport: viewReport,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
