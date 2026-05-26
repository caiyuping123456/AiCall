/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getAdminDoctors, createAdminDoctor, updateAdminDoctor, updateAdminDoctorStatus, getAdminDepartments } from '@aicall/shared';
const router = useRouter();
const loading = ref(false);
const actionLoading = ref(false);
const list = ref([]);
const keyword = ref('');
const departmentFilter = ref('');
const departmentList = ref([]);
const page = ref(1);
const size = ref(10);
const total = ref(0);
const showCreateDialog = ref(false);
const showEditDialog = ref(false);
const editingId = ref(0);
const createForm = ref({ name: '', title: '', department: '', phone: '', password: '' });
const editForm = ref({ name: '', title: '', department: '', phone: '', introduction: '' });
onMounted(() => { loadData(); loadDepartments(); });
async function loadDepartments() {
    try {
        departmentList.value = await getAdminDepartments();
    }
    catch { /* ignore */ }
}
async function loadData() {
    loading.value = true;
    try {
        const res = await getAdminDoctors({ keyword: keyword.value, department: departmentFilter.value, page: page.value, size: size.value });
        list.value = res.list;
        total.value = res.total;
    }
    finally {
        loading.value = false;
    }
}
async function handleCreate() {
    if (!createForm.value.name || !createForm.value.password) {
        ElMessage.warning('姓名和密码不能为空');
        return;
    }
    actionLoading.value = true;
    try {
        await createAdminDoctor(createForm.value);
        ElMessage.success('创建成功');
        showCreateDialog.value = false;
        loadData();
    }
    catch (e) {
        ElMessage.error(e.message || '创建失败');
    }
    finally {
        actionLoading.value = false;
    }
}
function openEditDialog(row) {
    editingId.value = row.id;
    editForm.value = { name: row.name, title: row.title, department: row.department, phone: row.phone, introduction: '' };
    showEditDialog.value = true;
}
async function handleEdit() {
    actionLoading.value = true;
    try {
        await updateAdminDoctor(editingId.value, editForm.value);
        ElMessage.success('更新成功');
        showEditDialog.value = false;
        loadData();
    }
    catch (e) {
        ElMessage.error(e.message || '更新失败');
    }
    finally {
        actionLoading.value = false;
    }
}
async function handleStatusToggle(id, enabled) {
    try {
        await updateAdminDoctorStatus(id, enabled ? 1 : 0);
        loadData();
    }
    catch (e) {
        ElMessage.error(e.message || '操作失败');
    }
}
function resetCreateForm() {
    createForm.value = { name: '', title: '', department: '', phone: '', password: '' };
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
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
    placeholder: "搜索姓名/科室/手机号",
    ...{ style: {} },
    clearable: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClear': {} },
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.keyword),
    placeholder: "搜索姓名/科室/手机号",
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
const __VLS_9 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.departmentFilter),
    placeholder: "全部科室",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_11 = __VLS_10({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.departmentFilter),
    placeholder: "全部科室",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
let __VLS_13;
let __VLS_14;
let __VLS_15;
const __VLS_16 = {
    onChange: (__VLS_ctx.loadData)
};
__VLS_12.slots.default;
for (const [d] of __VLS_getVForSourceType((__VLS_ctx.departmentList))) {
    const __VLS_17 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
        key: (d.id),
        label: (d.name),
        value: (d.name),
    }));
    const __VLS_19 = __VLS_18({
        key: (d.id),
        label: (d.name),
        value: (d.name),
    }, ...__VLS_functionalComponentArgsRest(__VLS_18));
}
var __VLS_12;
const __VLS_21 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_23 = __VLS_22({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
let __VLS_25;
let __VLS_26;
let __VLS_27;
const __VLS_28 = {
    onClick: (...[$event]) => {
        __VLS_ctx.showCreateDialog = true;
    }
};
__VLS_24.slots.default;
var __VLS_24;
const __VLS_29 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
    data: (__VLS_ctx.list),
    stripe: true,
}));
const __VLS_31 = __VLS_30({
    data: (__VLS_ctx.list),
    stripe: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_30));
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
__VLS_32.slots.default;
const __VLS_33 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
    prop: "name",
    label: "姓名",
}));
const __VLS_35 = __VLS_34({
    prop: "name",
    label: "姓名",
}, ...__VLS_functionalComponentArgsRest(__VLS_34));
const __VLS_37 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
    prop: "title",
    label: "职称",
}));
const __VLS_39 = __VLS_38({
    prop: "title",
    label: "职称",
}, ...__VLS_functionalComponentArgsRest(__VLS_38));
const __VLS_41 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
    prop: "department",
    label: "科室",
}));
const __VLS_43 = __VLS_42({
    prop: "department",
    label: "科室",
}, ...__VLS_functionalComponentArgsRest(__VLS_42));
const __VLS_45 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
    prop: "phone",
    label: "手机号",
}));
const __VLS_47 = __VLS_46({
    prop: "phone",
    label: "手机号",
}, ...__VLS_functionalComponentArgsRest(__VLS_46));
const __VLS_49 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({
    label: "状态",
    width: "100",
}));
const __VLS_51 = __VLS_50({
    label: "状态",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_50));
__VLS_52.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_52.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_53 = {}.ElSwitch;
    /** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
    // @ts-ignore
    const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
        ...{ 'onChange': {} },
        modelValue: (row.status === 1),
    }));
    const __VLS_55 = __VLS_54({
        ...{ 'onChange': {} },
        modelValue: (row.status === 1),
    }, ...__VLS_functionalComponentArgsRest(__VLS_54));
    let __VLS_57;
    let __VLS_58;
    let __VLS_59;
    const __VLS_60 = {
        onChange: ((val) => __VLS_ctx.handleStatusToggle(row.id, val))
    };
    var __VLS_56;
}
var __VLS_52;
const __VLS_61 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
    prop: "createTime",
    label: "创建时间",
    width: "180",
}));
const __VLS_63 = __VLS_62({
    prop: "createTime",
    label: "创建时间",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_62));
const __VLS_65 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
    label: "操作",
    width: "120",
}));
const __VLS_67 = __VLS_66({
    label: "操作",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_66));
__VLS_68.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_68.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_69 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
    }));
    const __VLS_71 = __VLS_70({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_70));
    let __VLS_73;
    let __VLS_74;
    let __VLS_75;
    const __VLS_76 = {
        onClick: (...[$event]) => {
            __VLS_ctx.openEditDialog(row);
        }
    };
    __VLS_72.slots.default;
    var __VLS_72;
    const __VLS_77 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
    }));
    const __VLS_79 = __VLS_78({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_78));
    let __VLS_81;
    let __VLS_82;
    let __VLS_83;
    const __VLS_84 = {
        onClick: (...[$event]) => {
            __VLS_ctx.router.push(`/doctors/${row.id}`);
        }
    };
    __VLS_80.slots.default;
    var __VLS_80;
}
var __VLS_68;
var __VLS_32;
const __VLS_85 = {}.ElPagination;
/** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
// @ts-ignore
const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({
    ...{ 'onCurrentChange': {} },
    ...{ style: {} },
    currentPage: (__VLS_ctx.page),
    pageSize: (__VLS_ctx.size),
    total: (__VLS_ctx.total),
    layout: "total, prev, pager, next",
}));
const __VLS_87 = __VLS_86({
    ...{ 'onCurrentChange': {} },
    ...{ style: {} },
    currentPage: (__VLS_ctx.page),
    pageSize: (__VLS_ctx.size),
    total: (__VLS_ctx.total),
    layout: "total, prev, pager, next",
}, ...__VLS_functionalComponentArgsRest(__VLS_86));
let __VLS_89;
let __VLS_90;
let __VLS_91;
const __VLS_92 = {
    onCurrentChange: (__VLS_ctx.loadData)
};
var __VLS_88;
const __VLS_93 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({
    ...{ 'onClose': {} },
    modelValue: (__VLS_ctx.showCreateDialog),
    title: "新增医生",
    width: "500px",
}));
const __VLS_95 = __VLS_94({
    ...{ 'onClose': {} },
    modelValue: (__VLS_ctx.showCreateDialog),
    title: "新增医生",
    width: "500px",
}, ...__VLS_functionalComponentArgsRest(__VLS_94));
let __VLS_97;
let __VLS_98;
let __VLS_99;
const __VLS_100 = {
    onClose: (__VLS_ctx.resetCreateForm)
};
__VLS_96.slots.default;
const __VLS_101 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({
    model: (__VLS_ctx.createForm),
    labelWidth: "80px",
}));
const __VLS_103 = __VLS_102({
    model: (__VLS_ctx.createForm),
    labelWidth: "80px",
}, ...__VLS_functionalComponentArgsRest(__VLS_102));
__VLS_104.slots.default;
const __VLS_105 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_106 = __VLS_asFunctionalComponent(__VLS_105, new __VLS_105({
    label: "姓名",
    required: true,
}));
const __VLS_107 = __VLS_106({
    label: "姓名",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_106));
__VLS_108.slots.default;
const __VLS_109 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({
    modelValue: (__VLS_ctx.createForm.name),
}));
const __VLS_111 = __VLS_110({
    modelValue: (__VLS_ctx.createForm.name),
}, ...__VLS_functionalComponentArgsRest(__VLS_110));
var __VLS_108;
const __VLS_113 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_114 = __VLS_asFunctionalComponent(__VLS_113, new __VLS_113({
    label: "职称",
}));
const __VLS_115 = __VLS_114({
    label: "职称",
}, ...__VLS_functionalComponentArgsRest(__VLS_114));
__VLS_116.slots.default;
const __VLS_117 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_118 = __VLS_asFunctionalComponent(__VLS_117, new __VLS_117({
    modelValue: (__VLS_ctx.createForm.title),
}));
const __VLS_119 = __VLS_118({
    modelValue: (__VLS_ctx.createForm.title),
}, ...__VLS_functionalComponentArgsRest(__VLS_118));
var __VLS_116;
const __VLS_121 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_122 = __VLS_asFunctionalComponent(__VLS_121, new __VLS_121({
    label: "科室",
}));
const __VLS_123 = __VLS_122({
    label: "科室",
}, ...__VLS_functionalComponentArgsRest(__VLS_122));
__VLS_124.slots.default;
const __VLS_125 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_126 = __VLS_asFunctionalComponent(__VLS_125, new __VLS_125({
    modelValue: (__VLS_ctx.createForm.department),
    placeholder: "请选择科室",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_127 = __VLS_126({
    modelValue: (__VLS_ctx.createForm.department),
    placeholder: "请选择科室",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_126));
__VLS_128.slots.default;
for (const [d] of __VLS_getVForSourceType((__VLS_ctx.departmentList))) {
    const __VLS_129 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_130 = __VLS_asFunctionalComponent(__VLS_129, new __VLS_129({
        key: (d.id),
        label: (d.name),
        value: (d.name),
    }));
    const __VLS_131 = __VLS_130({
        key: (d.id),
        label: (d.name),
        value: (d.name),
    }, ...__VLS_functionalComponentArgsRest(__VLS_130));
}
var __VLS_128;
var __VLS_124;
const __VLS_133 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_134 = __VLS_asFunctionalComponent(__VLS_133, new __VLS_133({
    label: "手机号",
}));
const __VLS_135 = __VLS_134({
    label: "手机号",
}, ...__VLS_functionalComponentArgsRest(__VLS_134));
__VLS_136.slots.default;
const __VLS_137 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_138 = __VLS_asFunctionalComponent(__VLS_137, new __VLS_137({
    modelValue: (__VLS_ctx.createForm.phone),
}));
const __VLS_139 = __VLS_138({
    modelValue: (__VLS_ctx.createForm.phone),
}, ...__VLS_functionalComponentArgsRest(__VLS_138));
var __VLS_136;
const __VLS_141 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_142 = __VLS_asFunctionalComponent(__VLS_141, new __VLS_141({
    label: "密码",
    required: true,
}));
const __VLS_143 = __VLS_142({
    label: "密码",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_142));
__VLS_144.slots.default;
const __VLS_145 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_146 = __VLS_asFunctionalComponent(__VLS_145, new __VLS_145({
    modelValue: (__VLS_ctx.createForm.password),
    type: "password",
    showPassword: true,
}));
const __VLS_147 = __VLS_146({
    modelValue: (__VLS_ctx.createForm.password),
    type: "password",
    showPassword: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_146));
var __VLS_144;
var __VLS_104;
{
    const { footer: __VLS_thisSlot } = __VLS_96.slots;
    const __VLS_149 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_150 = __VLS_asFunctionalComponent(__VLS_149, new __VLS_149({
        ...{ 'onClick': {} },
    }));
    const __VLS_151 = __VLS_150({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_150));
    let __VLS_153;
    let __VLS_154;
    let __VLS_155;
    const __VLS_156 = {
        onClick: (...[$event]) => {
            __VLS_ctx.showCreateDialog = false;
        }
    };
    __VLS_152.slots.default;
    var __VLS_152;
    const __VLS_157 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_158 = __VLS_asFunctionalComponent(__VLS_157, new __VLS_157({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.actionLoading),
    }));
    const __VLS_159 = __VLS_158({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.actionLoading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_158));
    let __VLS_161;
    let __VLS_162;
    let __VLS_163;
    const __VLS_164 = {
        onClick: (__VLS_ctx.handleCreate)
    };
    __VLS_160.slots.default;
    var __VLS_160;
}
var __VLS_96;
const __VLS_165 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_166 = __VLS_asFunctionalComponent(__VLS_165, new __VLS_165({
    modelValue: (__VLS_ctx.showEditDialog),
    title: "编辑医生",
    width: "500px",
}));
const __VLS_167 = __VLS_166({
    modelValue: (__VLS_ctx.showEditDialog),
    title: "编辑医生",
    width: "500px",
}, ...__VLS_functionalComponentArgsRest(__VLS_166));
__VLS_168.slots.default;
const __VLS_169 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_170 = __VLS_asFunctionalComponent(__VLS_169, new __VLS_169({
    model: (__VLS_ctx.editForm),
    labelWidth: "80px",
}));
const __VLS_171 = __VLS_170({
    model: (__VLS_ctx.editForm),
    labelWidth: "80px",
}, ...__VLS_functionalComponentArgsRest(__VLS_170));
__VLS_172.slots.default;
const __VLS_173 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_174 = __VLS_asFunctionalComponent(__VLS_173, new __VLS_173({
    label: "姓名",
    required: true,
}));
const __VLS_175 = __VLS_174({
    label: "姓名",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_174));
__VLS_176.slots.default;
const __VLS_177 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_178 = __VLS_asFunctionalComponent(__VLS_177, new __VLS_177({
    modelValue: (__VLS_ctx.editForm.name),
}));
const __VLS_179 = __VLS_178({
    modelValue: (__VLS_ctx.editForm.name),
}, ...__VLS_functionalComponentArgsRest(__VLS_178));
var __VLS_176;
const __VLS_181 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_182 = __VLS_asFunctionalComponent(__VLS_181, new __VLS_181({
    label: "职称",
}));
const __VLS_183 = __VLS_182({
    label: "职称",
}, ...__VLS_functionalComponentArgsRest(__VLS_182));
__VLS_184.slots.default;
const __VLS_185 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_186 = __VLS_asFunctionalComponent(__VLS_185, new __VLS_185({
    modelValue: (__VLS_ctx.editForm.title),
}));
const __VLS_187 = __VLS_186({
    modelValue: (__VLS_ctx.editForm.title),
}, ...__VLS_functionalComponentArgsRest(__VLS_186));
var __VLS_184;
const __VLS_189 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_190 = __VLS_asFunctionalComponent(__VLS_189, new __VLS_189({
    label: "科室",
}));
const __VLS_191 = __VLS_190({
    label: "科室",
}, ...__VLS_functionalComponentArgsRest(__VLS_190));
__VLS_192.slots.default;
const __VLS_193 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_194 = __VLS_asFunctionalComponent(__VLS_193, new __VLS_193({
    modelValue: (__VLS_ctx.editForm.department),
    placeholder: "请选择科室",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_195 = __VLS_194({
    modelValue: (__VLS_ctx.editForm.department),
    placeholder: "请选择科室",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_194));
__VLS_196.slots.default;
for (const [d] of __VLS_getVForSourceType((__VLS_ctx.departmentList))) {
    const __VLS_197 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_198 = __VLS_asFunctionalComponent(__VLS_197, new __VLS_197({
        key: (d.id),
        label: (d.name),
        value: (d.name),
    }));
    const __VLS_199 = __VLS_198({
        key: (d.id),
        label: (d.name),
        value: (d.name),
    }, ...__VLS_functionalComponentArgsRest(__VLS_198));
}
var __VLS_196;
var __VLS_192;
const __VLS_201 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_202 = __VLS_asFunctionalComponent(__VLS_201, new __VLS_201({
    label: "手机号",
}));
const __VLS_203 = __VLS_202({
    label: "手机号",
}, ...__VLS_functionalComponentArgsRest(__VLS_202));
__VLS_204.slots.default;
const __VLS_205 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_206 = __VLS_asFunctionalComponent(__VLS_205, new __VLS_205({
    modelValue: (__VLS_ctx.editForm.phone),
}));
const __VLS_207 = __VLS_206({
    modelValue: (__VLS_ctx.editForm.phone),
}, ...__VLS_functionalComponentArgsRest(__VLS_206));
var __VLS_204;
const __VLS_209 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_210 = __VLS_asFunctionalComponent(__VLS_209, new __VLS_209({
    label: "简介",
}));
const __VLS_211 = __VLS_210({
    label: "简介",
}, ...__VLS_functionalComponentArgsRest(__VLS_210));
__VLS_212.slots.default;
const __VLS_213 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_214 = __VLS_asFunctionalComponent(__VLS_213, new __VLS_213({
    modelValue: (__VLS_ctx.editForm.introduction),
    type: "textarea",
    rows: (3),
}));
const __VLS_215 = __VLS_214({
    modelValue: (__VLS_ctx.editForm.introduction),
    type: "textarea",
    rows: (3),
}, ...__VLS_functionalComponentArgsRest(__VLS_214));
var __VLS_212;
var __VLS_172;
{
    const { footer: __VLS_thisSlot } = __VLS_168.slots;
    const __VLS_217 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_218 = __VLS_asFunctionalComponent(__VLS_217, new __VLS_217({
        ...{ 'onClick': {} },
    }));
    const __VLS_219 = __VLS_218({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_218));
    let __VLS_221;
    let __VLS_222;
    let __VLS_223;
    const __VLS_224 = {
        onClick: (...[$event]) => {
            __VLS_ctx.showEditDialog = false;
        }
    };
    __VLS_220.slots.default;
    var __VLS_220;
    const __VLS_225 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_226 = __VLS_asFunctionalComponent(__VLS_225, new __VLS_225({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.actionLoading),
    }));
    const __VLS_227 = __VLS_226({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.actionLoading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_226));
    let __VLS_229;
    let __VLS_230;
    let __VLS_231;
    const __VLS_232 = {
        onClick: (__VLS_ctx.handleEdit)
    };
    __VLS_228.slots.default;
    var __VLS_228;
}
var __VLS_168;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            router: router,
            loading: loading,
            actionLoading: actionLoading,
            list: list,
            keyword: keyword,
            departmentFilter: departmentFilter,
            departmentList: departmentList,
            page: page,
            size: size,
            total: total,
            showCreateDialog: showCreateDialog,
            showEditDialog: showEditDialog,
            createForm: createForm,
            editForm: editForm,
            loadData: loadData,
            handleCreate: handleCreate,
            openEditDialog: openEditDialog,
            handleEdit: handleEdit,
            handleStatusToggle: handleStatusToggle,
            resetCreateForm: resetCreateForm,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
