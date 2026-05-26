/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import { getFollowUpDetail, submitFollowUpAnswer } from '@aicall/shared';
const route = useRoute();
const router = useRouter();
const id = Number(route.params.id);
const detail = ref(null);
const questions = ref([]);
const answers = ref([]);
const submitting = ref(false);
onMounted(async () => {
    try {
        detail.value = await getFollowUpDetail(id);
        if (detail.value.questionnaire) {
            const raw = detail.value.questionnaire.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
            questions.value = JSON.parse(raw);
            answers.value = new Array(questions.value.length).fill('');
        }
    }
    catch (e) {
        showToast(e.message || '加载失败');
    }
});
async function handleSubmit() {
    submitting.value = true;
    try {
        await submitFollowUpAnswer(id, JSON.stringify(answers.value));
        showToast('提交成功');
        router.push('/followup');
    }
    catch (e) {
        showToast(e.message || '提交失败');
    }
    finally {
        submitting.value = false;
    }
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
    title: "随访问卷",
}));
const __VLS_2 = __VLS_1({
    title: "随访问卷",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
if (__VLS_ctx.detail) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-title" },
    });
    (__VLS_ctx.detail.planDay);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-sub" },
    });
    (__VLS_ctx.detail.consultationNo);
    if (__VLS_ctx.detail.status >= 2) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "section-title" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "answer-box" },
        });
        (__VLS_ctx.detail.answer || '暂无');
        if (__VLS_ctx.detail.aiAnalysis) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "section-title" },
            });
        }
        if (__VLS_ctx.detail.aiAnalysis) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "answer-box" },
                ...{ style: {} },
            });
            (__VLS_ctx.detail.aiAnalysis);
        }
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "section-title" },
        });
        for (const [q, idx] of __VLS_getVForSourceType((__VLS_ctx.questions))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (idx),
                ...{ class: "question-card" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "q-title" },
            });
            (idx + 1);
            (q.question);
            if (q.type === 'radio') {
                const __VLS_4 = {}.VanRadioGroup;
                /** @type {[typeof __VLS_components.VanRadioGroup, typeof __VLS_components.vanRadioGroup, typeof __VLS_components.VanRadioGroup, typeof __VLS_components.vanRadioGroup, ]} */ ;
                // @ts-ignore
                const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
                    modelValue: (__VLS_ctx.answers[idx]),
                    direction: "horizontal",
                }));
                const __VLS_6 = __VLS_5({
                    modelValue: (__VLS_ctx.answers[idx]),
                    direction: "horizontal",
                }, ...__VLS_functionalComponentArgsRest(__VLS_5));
                __VLS_7.slots.default;
                for (const [opt] of __VLS_getVForSourceType((q.options))) {
                    const __VLS_8 = {}.VanRadio;
                    /** @type {[typeof __VLS_components.VanRadio, typeof __VLS_components.vanRadio, typeof __VLS_components.VanRadio, typeof __VLS_components.vanRadio, ]} */ ;
                    // @ts-ignore
                    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
                        key: (opt),
                        name: (opt),
                    }));
                    const __VLS_10 = __VLS_9({
                        key: (opt),
                        name: (opt),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
                    __VLS_11.slots.default;
                    (opt);
                    var __VLS_11;
                }
                var __VLS_7;
            }
            else {
                const __VLS_12 = {}.VanField;
                /** @type {[typeof __VLS_components.VanField, typeof __VLS_components.vanField, ]} */ ;
                // @ts-ignore
                const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
                    modelValue: (__VLS_ctx.answers[idx]),
                    type: "textarea",
                    rows: (3),
                    placeholder: "请输入",
                }));
                const __VLS_14 = __VLS_13({
                    modelValue: (__VLS_ctx.answers[idx]),
                    type: "textarea",
                    rows: (3),
                    placeholder: "请输入",
                }, ...__VLS_functionalComponentArgsRest(__VLS_13));
            }
        }
        const __VLS_16 = {}.VanButton;
        /** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
        // @ts-ignore
        const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
            ...{ 'onClick': {} },
            type: "primary",
            block: true,
            loading: (__VLS_ctx.submitting),
            ...{ style: {} },
        }));
        const __VLS_18 = __VLS_17({
            ...{ 'onClick': {} },
            type: "primary",
            block: true,
            loading: (__VLS_ctx.submitting),
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_17));
        let __VLS_20;
        let __VLS_21;
        let __VLS_22;
        const __VLS_23 = {
            onClick: (__VLS_ctx.handleSubmit)
        };
        __VLS_19.slots.default;
        var __VLS_19;
    }
}
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
/** @type {__VLS_StyleScopedClasses['info-card']} */ ;
/** @type {__VLS_StyleScopedClasses['info-title']} */ ;
/** @type {__VLS_StyleScopedClasses['info-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['answer-box']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['answer-box']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['question-card']} */ ;
/** @type {__VLS_StyleScopedClasses['q-title']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            detail: detail,
            questions: questions,
            answers: answers,
            submitting: submitting,
            handleSubmit: handleSubmit,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
