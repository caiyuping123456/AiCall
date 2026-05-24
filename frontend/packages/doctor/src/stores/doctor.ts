import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getWorkbench, type ConsultationListItem } from '@aicall/shared';

export const useDoctorStore = defineStore('doctor', () => {
  const pendingReviewCount = ref(0);
  const reportEditingCount = ref(0);
  const pendingQcCount = ref(0);
  const recentConsultations = ref<ConsultationListItem[]>([]);

  async function loadWorkbench() {
    const data = await getWorkbench();
    pendingReviewCount.value = data.pendingReviewCount;
    reportEditingCount.value = data.reportEditingCount;
    pendingQcCount.value = data.pendingQcCount;
    recentConsultations.value = data.recentConsultations;
  }

  return { pendingReviewCount, reportEditingCount, pendingQcCount, recentConsultations, loadWorkbench };
});
