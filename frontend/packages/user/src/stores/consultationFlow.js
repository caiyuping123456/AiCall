import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
const STORAGE_KEY = 'consultation_flow';
const EXPIRY_HOURS = 2;
export const useConsultationFlowStore = defineStore('consultationFlow', () => {
    const state = ref(loadState());
    function loadState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw)
                return defaultState();
            const parsed = JSON.parse(raw);
            if (Date.now() - parsed.timestamp > EXPIRY_HOURS * 3600000) {
                localStorage.removeItem(STORAGE_KEY);
                return defaultState();
            }
            return parsed;
        }
        catch {
            return defaultState();
        }
    }
    function defaultState() {
        return {
            step: 1,
            chiefComplaint: '',
            medicalSummary: '',
            chatHistory: [],
            uploadedFileIds: [],
            selectedType: null,
            selectedDoctorIds: [],
            department: '',
            consultationId: null,
            timestamp: Date.now(),
        };
    }
    function persist() {
        state.value.timestamp = Date.now();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value));
    }
    function nextStep(step) { state.value.step = step; persist(); }
    function setChiefComplaint(v) { state.value.chiefComplaint = v; persist(); }
    function setMedicalSummary(v) { state.value.medicalSummary = v; persist(); }
    function setChatHistory(v) { state.value.chatHistory = v; persist(); }
    function addChatMessage(msg) { state.value.chatHistory.push(msg); persist(); }
    function addFileId(id) { state.value.uploadedFileIds.push(id); persist(); }
    function setSelectedType(t) { state.value.selectedType = t; persist(); }
    function setSelectedDoctorIds(ids) { state.value.selectedDoctorIds = ids; persist(); }
    function setDepartment(d) { state.value.department = d; persist(); }
    function setConsultationId(id) { state.value.consultationId = id; persist(); }
    function reset() {
        localStorage.removeItem(STORAGE_KEY);
        state.value = defaultState();
    }
    const isExpired = computed(() => Date.now() - state.value.timestamp > EXPIRY_HOURS * 3600000);
    const isComplete = computed(() => state.value.step >= 7);
    return {
        state, nextStep, setChiefComplaint, setMedicalSummary, setChatHistory,
        addChatMessage, addFileId, setSelectedType, setSelectedDoctorIds, setDepartment,
        setConsultationId, reset, isExpired, isComplete, persist
    };
});
