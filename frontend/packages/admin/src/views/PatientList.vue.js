/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getAdminPatients, updateAdminPatientStatus, resetAdminPatientPassword } from '@aicall/shared';
const loading = ref(false);
const list = ref([]);
const keyword = ref('');
const page = ref(1);
const size = ref(10);
const total = ref(0);
onMounted(() => loadData());
async function loadData() {
    loading.value = true;
    try {
        const res = await getAdminPatients({ keyword: keyword.value, page: page.value, size: size.value });
        list.value = res.list;
        total.value = res.total;
    }
    finally {
        loading.value = false;
    }
}
async function handleStatusToggle(id, enabled) {
    try {
        await updateAdminPatientStatus(id, enabled ? 1 : 0);
        loadData();
    }
    catch (e) {
        ElMessage.error(e.message || '操作失败');
    }
}
async function handleResetPwd(row) {
    try {
        await ElMessageBox.confirm(`确定要重置用户「${row.name}」的密码为 123456 吗？`, '确认重置密码', { type: 'warning' });
    }
    catch {
        return;
    }
    try {
        await resetAdminPatientPassword(row.id);
        ElMessage.success('密码已重置为 123456');
    }
    catch (e) {
        ElMessage.error(e.message || '操作失败');
    }
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
const __VLS_0 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClear': {} },
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.keyword),
    placeholder: "搜索姓名/手机号",
    ...{ style: {} },
    clearable: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClear': {} },
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.keyword),
    placeholder: "搜索姓名/手机号",
    ...{ style: {} },
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClear: (__VLS_ctx.loadData)
};
const __VLS_8 = {
    onKeyup: (__VLS_ctx.loadData)
};
var __VLS_3;
const __VLS_9 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
    data: (__VLS_ctx.list),
    stripe: true,
}));
const __VLS_11 = __VLS_10({
    data: (__VLS_ctx.list),
    stripe: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
__VLS_12.slots.default;
const __VLS_13 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
    prop: "name",
    label: "姓名",
}));
const __VLS_15 = __VLS_14({
    prop: "name",
    label: "姓名",
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
const __VLS_17 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
    prop: "phone",
    label: "手机号",
}));
const __VLS_19 = __VLS_18({
    prop: "phone",
    label: "手机号",
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
const __VLS_21 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
    label: "性别",
    width: "80",
}));
const __VLS_23 = __VLS_22({
    label: "性别",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
__VLS_24.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_24.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    (row.gender === 1 ? '男' : row.gender === 0 ? '女' : '未知');
}
var __VLS_24;
const __VLS_25 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
    prop: "age",
    label: "年龄",
    width: "80",
}));
const __VLS_27 = __VLS_26({
    prop: "age",
    label: "年龄",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
const __VLS_29 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
    label: "资料完善",
    width: "100",
}));
const __VLS_31 = __VLS_30({
    label: "资料完善",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_30));
__VLS_32.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_32.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_33 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
        type: (row.profileComplete === 1 ? 'success' : 'warning'),
        size: "small",
    }));
    const __VLS_35 = __VLS_34({
        type: (row.profileComplete === 1 ? 'success' : 'warning'),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_34));
    __VLS_36.slots.default;
    (row.profileComplete === 1 ? '已完善' : '未完善');
    var __VLS_36;
}
var __VLS_32;
const __VLS_37 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
    label: "状态",
    width: "100",
}));
const __VLS_39 = __VLS_38({
    label: "状态",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_38));
__VLS_40.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_40.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_41 = {}.ElSwitch;
    /** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
    // @ts-ignore
    const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
        ...{ 'onChange': {} },
        modelValue: (row.status === 1),
    }));
    const __VLS_43 = __VLS_42({
        ...{ 'onChange': {} },
        modelValue: (row.status === 1),
    }, ...__VLS_functionalComponentArgsRest(__VLS_42));
    let __VLS_45;
    let __VLS_46;
    let __VLS_47;
    const __VLS_48 = {
        onChange: ((val) => __VLS_ctx.handleStatusToggle(row.id, val))
    };
    var __VLS_44;
}
var __VLS_40;
const __VLS_49 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({
    prop: "createTime",
    label: "注册时间",
    width: "180",
}));
const __VLS_51 = __VLS_50({
    prop: "createTime",
    label: "注册时间",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_50));
const __VLS_53 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
    label: "操作",
    width: "120",
}));
const __VLS_55 = __VLS_54({
    label: "操作",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_54));
__VLS_56.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_56.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_57 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
    }));
    const __VLS_59 = __VLS_58({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_58));
    let __VLS_61;
    let __VLS_62;
    let __VLS_63;
    const __VLS_64 = {
        onClick: (...[$event]) => {
            __VLS_ctx.handleResetPwd(row);
        }
    };
    __VLS_60.slots.default;
    var __VLS_60;
}
var __VLS_56;
var __VLS_12;
const __VLS_65 = {}.ElPagination;
/** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
// @ts-ignore
const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
    ...{ 'onCurrentChange': {} },
    ...{ style: {} },
    currentPage: (__VLS_ctx.page),
    pageSize: (__VLS_ctx.size),
    total: (__VLS_ctx.total),
    layout: "total, prev, pager, next",
}));
const __VLS_67 = __VLS_66({
    ...{ 'onCurrentChange': {} },
    ...{ style: {} },
    currentPage: (__VLS_ctx.page),
    pageSize: (__VLS_ctx.size),
    total: (__VLS_ctx.total),
    layout: "total, prev, pager, next",
}, ...__VLS_functionalComponentArgsRest(__VLS_66));
let __VLS_69;
let __VLS_70;
let __VLS_71;
const __VLS_72 = {
    onCurrentChange: (__VLS_ctx.loadData)
};
var __VLS_68;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            loading: loading,
            list: list,
            keyword: keyword,
            page: page,
            size: size,
            total: total,
            loadData: loadData,
            handleStatusToggle: handleStatusToggle,
            handleResetPwd: handleResetPwd,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
