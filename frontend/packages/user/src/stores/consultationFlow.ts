import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

const STORAGE_KEY = 'consultation_flow';
const EXPIRY_HOURS = 2;

export interface FlowState {
  step: number;
  chiefComplaint: string;
  medicalSummary: string;
  chatHistory: { role: string; content: string }[];
  uploadedFileIds: number[];
  selectedType: number | null;
  selectedDoctorIds: number[];
  department: string;
  timestamp: number;
}

export const useConsultationFlowStore = defineStore('consultationFlow', () => {
  const state = ref<FlowState>(loadState());

  function loadState(): FlowState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw) as FlowState;
      if (Date.now() - parsed.timestamp > EXPIRY_HOURS * 3600_000) {
        localStorage.removeItem(STORAGE_KEY);
        return defaultState();
      }
      return parsed;
    } catch {
      return defaultState();
    }
  }

  function defaultState(): FlowState {
    return {
      step: 1,
      chiefComplaint: '',
      medicalSummary: '',
      chatHistory: [],
      uploadedFileIds: [],
      selectedType: null,
      selectedDoctorIds: [],
      department: '',
      timestamp: Date.now(),
    };
  }

  function persist() {
    state.value.timestamp = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value));
  }

  function nextStep(step: number) { state.value.step = step; persist(); }
  function setChiefComplaint(v: string) { state.value.chiefComplaint = v; persist(); }
  function setMedicalSummary(v: string) { state.value.medicalSummary = v; persist(); }
  function setChatHistory(v: { role: string; content: string }[]) { state.value.chatHistory = v; persist(); }
  function addChatMessage(msg: { role: string; content: string }) { state.value.chatHistory.push(msg); persist(); }
  function addFileId(id: number) { state.value.uploadedFileIds.push(id); persist(); }
  function setSelectedType(t: number) { state.value.selectedType = t; persist(); }
  function setSelectedDoctorIds(ids: number[]) { state.value.selectedDoctorIds = ids; persist(); }
  function setDepartment(d: string) { state.value.department = d; persist(); }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    state.value = defaultState();
  }

  const isExpired = computed(() => Date.now() - state.value.timestamp > EXPIRY_HOURS * 3600_000);
  const isComplete = computed(() => state.value.step >= 7);

  return {
    state, nextStep, setChiefComplaint, setMedicalSummary, setChatHistory,
    addChatMessage, addFileId, setSelectedType, setSelectedDoctorIds, setDepartment,
    reset, isExpired, isComplete, persist
  };
});
