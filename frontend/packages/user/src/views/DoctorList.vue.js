/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getDoctorsByDepartment, getDepartments } from '@aicall/shared';
const router = useRouter();
const route = useRoute();
const doctors = ref([]);
const deptName = ref('');
const loading = ref(true);
function goDetail(doc) {
    router.push(`/doctors/${doc.id}`);
}
onMounted(async () => {
    try {
        const deptId = Number(route.params.id);
        const depts = await getDepartments();
        const dept = depts?.find((d) => d.id === deptId);
        deptName.value = dept?.name || '科室';
        doctors.value = await getDoctorsByDepartment(deptId);
    }
    catch { }
    loading.value = false;
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-intro']} */ ;
/** @type {__VLS_StyleScopedClasses['page-intro']} */ ;
/** @type {__VLS_StyleScopedClasses['doctor-card']} */ ;
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
    title: (__VLS_ctx.deptName + ' - 医生列表'),
    leftArrow: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClickLeft': {} },
    title: (__VLS_ctx.deptName + ' - 医生列表'),
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-intro mobile-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
(__VLS_ctx.deptName || '科室');
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
const __VLS_8 = {}.VanIcon;
/** @type {[typeof __VLS_components.VanIcon, typeof __VLS_components.vanIcon, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    name: "manager-o",
    size: "30",
    color: "#14b8a6",
}));
const __VLS_10 = __VLS_9({
    name: "manager-o",
    size: "30",
    color: "#14b8a6",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
if (__VLS_ctx.loading) {
    const __VLS_12 = {}.VanLoading;
    /** @type {[typeof __VLS_components.VanLoading, typeof __VLS_components.vanLoading, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        ...{ class: "center-loading" },
    }));
    const __VLS_14 = __VLS_13({
        ...{ class: "center-loading" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
}
else if (__VLS_ctx.doctors.length === 0) {
    const __VLS_16 = {}.VanEmpty;
    /** @type {[typeof __VLS_components.VanEmpty, typeof __VLS_components.vanEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        description: "暂无医生",
    }));
    const __VLS_18 = __VLS_17({
        description: "暂无医生",
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "doctor-list" },
    });
    for (const [doc] of __VLS_getVForSourceType((__VLS_ctx.doctors))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!!(__VLS_ctx.doctors.length === 0))
                        return;
                    __VLS_ctx.goDetail(doc);
                } },
            key: (doc.id),
            ...{ class: "doctor-card mobile-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "doctor-avatar" },
        });
        if (doc.avatar) {
            const __VLS_20 = {}.VanImage;
            /** @type {[typeof __VLS_components.VanImage, typeof __VLS_components.vanImage, ]} */ ;
            // @ts-ignore
            const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
                src: (doc.avatar),
                round: true,
                width: "58",
                height: "58",
                fit: "cover",
            }));
            const __VLS_22 = __VLS_21({
                src: (doc.avatar),
                round: true,
                width: "58",
                height: "58",
                fit: "cover",
            }, ...__VLS_functionalComponentArgsRest(__VLS_21));
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "avatar-placeholder" },
            });
            (doc.name?.charAt(0));
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "doctor-info" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "doctor-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "doctor-name" },
        });
        (doc.name);
        if (doc.title) {
            const __VLS_24 = {}.VanTag;
            /** @type {[typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, typeof __VLS_components.VanTag, typeof __VLS_components.vanTag, ]} */ ;
            // @ts-ignore
            const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
                type: "primary",
                size: "medium",
            }));
            const __VLS_26 = __VLS_25({
                type: "primary",
                size: "medium",
            }, ...__VLS_functionalComponentArgsRest(__VLS_25));
            __VLS_27.slots.default;
            (doc.title);
            var __VLS_27;
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "doctor-dept" },
        });
        (doc.department);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "doctor-intro" },
        });
        (doc.introduction ? (doc.introduction.length > 48 ? doc.introduction.substring(0, 48) + '...' : doc.introduction) : '暂无介绍');
        const __VLS_28 = {}.VanIcon;
        /** @type {[typeof __VLS_components.VanIcon, typeof __VLS_components.vanIcon, ]} */ ;
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
            name: "arrow",
            color: "#94a3b8",
        }));
        const __VLS_30 = __VLS_29({
            name: "arrow",
            color: "#94a3b8",
        }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    }
}
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
/** @type {__VLS_StyleScopedClasses['page-intro']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-card']} */ ;
/** @type {__VLS_StyleScopedClasses['center-loading']} */ ;
/** @type {__VLS_StyleScopedClasses['doctor-list']} */ ;
/** @type {__VLS_StyleScopedClasses['doctor-card']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-card']} */ ;
/** @type {__VLS_StyleScopedClasses['doctor-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['doctor-info']} */ ;
/** @type {__VLS_StyleScopedClasses['doctor-header']} */ ;
/** @type {__VLS_StyleScopedClasses['doctor-name']} */ ;
/** @type {__VLS_StyleScopedClasses['doctor-dept']} */ ;
/** @type {__VLS_StyleScopedClasses['doctor-intro']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            doctors: doctors,
            deptName: deptName,
            loading: loading,
            goDetail: goDetail,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
