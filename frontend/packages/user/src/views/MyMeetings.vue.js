/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { getMeetings } from '@aicall/shared';
const router = useRouter();
const loading = ref(false);
const list = ref([]);
const statusMap = {
    '3': '已排期', '4': '待会诊', '5': '报告已签发', '6': '已完成',
};
const statusTag = {
    '3': 'primary', '4': 'warning', '5': 'primary', '6': 'success',
};
onMounted(loadData);
async function loadData() {
    loading.value = true;
    try {
        list.value = await getMeetings();
    }
    catch (e) {
        showToast(e.message || '加载失败');
    }
    finally {
        loading.value = false;
    }
}
function goDetail(item) {
    if (item.status === 3 || item.status === 4) {
        router.push(`/consultation/${item.id}/room`);
    }
    else if (item.status >= 3) {
        router.push(`/consultation/${item.id}/status`);
    }
    else {
        router.push(`/consultation/${item.id}/summary`);
    }
}
function formatDate(date) {
    return date ? date.substring(0, 10) : '';
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
    title: "我的会诊",
    leftArrow: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClickLeft': {} },
    title: "我的会诊",
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
if (!__VLS_ctx.loading && __VLS_ctx.list.length === 0) {
    const __VLS_8 = {}.VanEmpty;
    /** @type {[typeof __VLS_components.VanEmpty, typeof __VLS_components.vanEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        description: "暂无已确认的会诊",
    }));
    const __VLS_10 = __VLS_9({
        description: "暂无已确认的会诊",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
}
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.list))) {
    const __VLS_12 = {}.VanCellGroup;
    /** @type {[typeof __VLS_components.VanCellGroup, typeof __VLS_components.vanCellGroup, typeof __VLS_components.VanCellGroup, typeof __VLS_components.vanCellGroup, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        inset: true,
        key: (item.id),
        ...{ style: {} },
    }));
    const __VLS_14 = __VLS_13({
        inset: true,
        key: (item.id),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_15.slots.default;
    const __VLS_16 = {}.VanCell;
    /** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        ...{ 'onClick': {} },
        title: (item.consultationNo),
        label: (item.department || '未知科室'),
        isLink: true,
    }));
    const __VLS_18 = __VLS_17({
        ...{ 'onClick': {} },
        title: (item.consultationNo),
        label: (item.department || '未知科室'),
        isLink: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    let __VLS_20;
    let __VLS_21;
    let __VLS_22;
    const __VLS_23 = {
        onClick: (...[$event]) => {
            __VLS_ctx.goDetail(item);
        }
    };
    __VLS_19.slots.default;
    {
        const { value: __VLS_thisSlot } = __VLS_19.slots;
        const __VLS_24 = {}.VanTag;
        /** @type {[typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, ]} */ ;
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
            type: (__VLS_ctx.statusTag[String(item.status)] || 'default'),
            size: "medium",
        }));
        const __VLS_26 = __VLS_25({
            type: (__VLS_ctx.statusTag[String(item.status)] || 'default'),
            size: "medium",
        }, ...__VLS_functionalComponentArgsRest(__VLS_25));
        __VLS_27.slots.default;
        (__VLS_ctx.statusMap[item.status] || '未知');
        var __VLS_27;
    }
    var __VLS_19;
    const __VLS_28 = {}.VanCell;
    /** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        title: ('费用'),
        value: ('¥' + (item.fee ?? 0)),
    }));
    const __VLS_30 = __VLS_29({
        title: ('费用'),
        value: ('¥' + (item.fee ?? 0)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    const __VLS_32 = {}.VanCell;
    /** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        title: ('创建时间'),
        value: (__VLS_ctx.formatDate(item.createTime)),
    }));
    const __VLS_34 = __VLS_33({
        title: ('创建时间'),
        value: (__VLS_ctx.formatDate(item.createTime)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    var __VLS_15;
}
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            loading: loading,
            list: list,
            statusMap: statusMap,
            statusTag: statusTag,
            goDetail: goDetail,
            formatDate: formatDate,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
