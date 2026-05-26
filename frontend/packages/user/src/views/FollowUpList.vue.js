/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, onMounted } from 'vue';
import { showToast } from 'vant';
import { getPendingFollowUps } from '@aicall/shared';
const list = ref([]);
const loading = ref(false);
onMounted(async () => {
    loading.value = true;
    try {
        list.value = await getPendingFollowUps();
    }
    catch (e) {
        showToast(e.message || '加载失败');
    }
    finally {
        loading.value = false;
    }
});
function statusText(status) {
    return ['待发送', '已发送', '已回复', '异常'][status] || '未知';
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
    title: "我的随访",
}));
const __VLS_2 = __VLS_1({
    title: "我的随访",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content" },
});
if (!__VLS_ctx.loading && __VLS_ctx.list.length === 0) {
    const __VLS_4 = {}.VanEmpty;
    /** @type {[typeof __VLS_components.VanEmpty, typeof __VLS_components.vanEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        description: "暂无随访记录",
    }));
    const __VLS_6 = __VLS_5({
        description: "暂无随访记录",
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
}
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.list))) {
    const __VLS_8 = {}.VanCellGroup;
    /** @type {[typeof __VLS_components.VanCellGroup, typeof __VLS_components.vanCellGroup, typeof __VLS_components.VanCellGroup, typeof __VLS_components.vanCellGroup, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        inset: true,
        key: (item.id),
        ...{ style: {} },
    }));
    const __VLS_10 = __VLS_9({
        inset: true,
        key: (item.id),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    const __VLS_12 = {}.VanCell;
    /** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        ...{ 'onClick': {} },
        title: ('第' + item.planDay + '天随访'),
        label: (item.consultationNo),
        isLink: true,
        value: (__VLS_ctx.statusText(item.status)),
    }));
    const __VLS_14 = __VLS_13({
        ...{ 'onClick': {} },
        title: ('第' + item.planDay + '天随访'),
        label: (item.consultationNo),
        isLink: true,
        value: (__VLS_ctx.statusText(item.status)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    let __VLS_16;
    let __VLS_17;
    let __VLS_18;
    const __VLS_19 = {
        onClick: (...[$event]) => {
            __VLS_ctx.$router.push('/followup/' + item.id);
        }
    };
    var __VLS_15;
    var __VLS_11;
}
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            list: list,
            loading: loading,
            statusText: statusText,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
