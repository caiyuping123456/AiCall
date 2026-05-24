# Sub-project 3: Doctor-side Core Flow

## Goal

Implement the doctor-side workflow: login → workbench dashboard → review consultation → AI report generation → quality control → sign & issue.

## Architecture

Doctor-side is a desktop SPA using Element Plus on port 3001. Backend adds a `/doctor/**` API layer reusing existing consultation/report/QC database tables. AI services generate draft reports from templates and run 3-dimension quality scoring. Status lifecycle drives the flow: consultation confirmed → report drafted → QC passed → signed & issued.

## Tech Stack

- Backend: Spring Boot 3, MyBatis, LangChain4j (SiliconFlow), Redis, MySQL
- Frontend: Vue 3 + TypeScript + Element Plus + Vite
- AI: DeepSeek-V3.2 (report generation + QC scoring)

---

## 1. Backend — Doctor Authentication

**Endpoint:** `POST /doctor/auth/login`

- Request: `{ username, password }`
- Doctor table already has BCrypt-hashed passwords
- Response: `{ token, doctorId, name, department, title }`
- JWT with role=DOCTOR
- SecurityConfig: `/doctor/auth/**` permitAll, other `/doctor/**` authenticated

## 2. Backend — Workbench Dashboard

**Endpoint:** `GET /doctor/workbench`

Returns aggregated stats:
- Pending review count (consultation status=2, assigned to this doctor)
- Report editing count (report status=0, owned by this doctor)
- Pending QC count (report status=1, owned by this doctor)
- Recent consultations (last 5, status 2 or 3)

Data source: `consultation_doctor` table joined with `consultation` and `report`.

## 3. Backend — Consultation Management

### 3.1 Consultation List

**Endpoint:** `GET /doctor/consultations?status=&page=&size=`

- Filters by consultation status and doctor assignment via `consultation_doctor` table
- Returns paginated list: consultationId, patientName, chiefComplaint, department, status, createTime
- Status values: 2=pending review, 3=in progress, 4=report generated, 8=rejected

### 3.2 Consultation Detail

**Endpoint:** `GET /doctor/consultations/{id}`

Returns full detail for doctor review:
- Patient info (name, age, gender)
- Medical summary (from consultation.medical_summary)
- Uploaded files list (from consultation_upload)
- Chat history (from Redis)
- Current report status (if exists)

### 3.3 Confirm Consultation

**Endpoint:** `POST /doctor/consultations/{id}/confirm`

- Updates `consultation_doctor.status` to 1 (confirmed), sets confirm_time
- Updates `consultation.status` from 2→3
- Returns success

### 3.4 Reject Consultation

**Endpoint:** `POST /doctor/consultations/{id}/reject`

- Body: `{ reason }`
- Updates `consultation_doctor.status` to 2 (refused)
- Updates `consultation.status` from 2→8
- Note: reason is logged but not persisted (no column in current schema)
- Returns success

## 4. Backend — AI Report Generation

### 4.1 Generate Report

**Endpoint:** `POST /doctor/consultations/{id}/generate-report`

Flow:
1. Load consultation detail (patient info, medical summary, uploads, chat history)
2. Load report template by department (from `report_template` table)
3. Call AI (DeepSeek-V3.2) with template + patient data as prompt
4. Parse AI response into structured JSON with fixed structure:
   ```json
   {
     "chiefComplaint": "...",
     "presentIllness": "...",
     "pastHistory": "...",
     "examinationFindings": "...",
     "diagnosis": "...",
     "analysis": "...",
     "recommendation": "...",
     "followUp": "..."
   }
   ```
5. Save to `report` table: type=1 (professional), content=JSON, status=0 (draft)
6. Update consultation status to 4 (report generated)
7. Return generated report content

### 4.2 ReportGenerateService

New service in `module/ai/service/`:
- `generateReport(Long consultationId)` → String (JSON)
- Prompt template: "根据以下患者信息和会诊记录，按照模板格式生成专业会诊报告..."
- Uses existing ChatLanguageModel bean

## 5. Backend — Report CRUD

### 5.1 Get Report

**Endpoint:** `GET /doctor/consultations/{id}/report`

- Returns report content + status + QC result (if any)

### 5.2 Update Report

**Endpoint:** `PUT /doctor/consultations/{id}/report`

- Body: `{ content }` (JSON string)
- Doctor edits the AI-generated draft
- Saves updated content, keeps status=0 (draft)

### 5.3 Submit Report for QC

**Endpoint:** `POST /doctor/consultations/{id}/submit-report`

- Changes report status from 0→1 (pending review)
- Triggers AI quality control

## 6. Backend — AI Quality Control

### 6.1 QcService

New service in `module/ai/service/`:
- `checkQuality(Long reportId)` → QcResult
- 3 dimensions scored 0-100:
  - **Completeness**: Are all required sections present?
  - **Standard compliance**: Does it follow medical report standards?
  - **Consistency**: Is the content internally consistent?
- Total score = weighted average (completeness 30%, standard 40%, consistency 30%)
- Score ≥ 60 → pass, < 60 → fail with specific issues listed
- Result saved to `qc_result` table

### 6.2 QC Flow Integration

After submit-report:
1. Call QcService.checkQuality
2. If pass: report status stays 1, qc_result.status=1 (passed)
3. If fail: report status → 0 (back to draft), qc_result.status=2 (returned), issues returned to doctor
4. Return QC result to frontend

### 6.3 Get QC Result

**Endpoint:** `GET /doctor/consultations/{id}/qc-result`

- Returns QC scores + issues list

## 7. Backend — Sign & Issue

### 7.1 Sign Report

**Endpoint:** `POST /doctor/consultations/{id}/sign`

- Prerequisite: QC passed (qc_result.status=1)
- Updates report: status=2 (issued), signed_by=doctorId, signed_time=now
- Updates consultation status to 5 (completed)
- Returns success

## 8. Backend — Doctor Profile

**Endpoint:** `GET /doctor/profile`

- Returns current doctor info: id, name, title, department, phone, avatar, introduction

## 9. Entity / Mapper Updates

### DoctorMapper
- `findByUsername(String username)` — already exists
- `findById(Long id)` — add if missing

### ConsultationDoctorMapper (new)
- `findByDoctorId(Long doctorId)` — list doctor's consultations
- `findByConsultationAndDoctor(Long consultationId, Long doctorId)` — check assignment
- `updateStatus(Long consultationId, Long doctorId, int status)` — confirm/reject

### ReportMapper
- `findByConsultationId(Long consultationId)` — get report
- `insert(Report report)` — save generated report
- `updateContent(Long id, String content)` — doctor edits
- `updateStatus(Long id, int status)` — status transitions

### QcResultMapper
- `findByReportId(Long reportId)` — get QC result
- `insert(QcResult result)` — save QC result

### ReportTemplateMapper
- `findByDepartment(String department)` — get template for department

## 10. Frontend — Doctor-side Pages

### Layout
- Sidebar navigation: Dashboard, Consultations, (future items)
- Top bar: doctor name + department + logout

### Pages

1. **Login** — already exists, username + password
2. **Dashboard** — workbench stats cards + recent consultations table
3. **ConsultationList** — filterable table (status tabs), pagination
4. **ConsultationDetail** — tabs: patient info, medical summary, uploads, chat history, report
5. **ReportEditor** — structured form editing JSON report sections, submit for QC, view QC result, sign

### Router
```
/login → Login
/ → Dashboard (requiresAuth)
/consultations → ConsultationList (requiresAuth)
/consultations/:id → ConsultationDetail (requiresAuth)
/consultations/:id/report → ReportEditor (requiresAuth)
```

## 11. Status Lifecycle Summary

**Consultation:** 0→1→2→3→4→5→6→7→8
- 2: assigned to doctor (pending review)
- 3: doctor confirmed (in progress)
- 4: report generated
- 5: signed & completed
- 8: rejected

**Report:** 0→1→2
- 0: draft (AI generated or doctor editing)
- 1: submitted for QC
- 2: issued (signed)

**QC Result:** 0→1 or 0→2
- 0: pending
- 1: passed
- 2: returned (fail, back to draft)

**Consultation Doctor:** 0→1 or 0→2
- 0: pending
- 1: confirmed
- 2: refused

## 12. API Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /doctor/auth/login | Doctor login |
| GET | /doctor/workbench | Dashboard stats |
| GET | /doctor/consultations | Consultation list (paginated) |
| GET | /doctor/consultations/{id} | Consultation detail |
| POST | /doctor/consultations/{id}/confirm | Confirm consultation |
| POST | /doctor/consultations/{id}/reject | Reject consultation |
| POST | /doctor/consultations/{id}/generate-report | AI generate report |
| GET | /doctor/consultations/{id}/report | Get report |
| PUT | /doctor/consultations/{id}/report | Update report |
| POST | /doctor/consultations/{id}/submit-report | Submit for QC |
| GET | /doctor/consultations/{id}/qc-result | Get QC result |
| POST | /doctor/consultations/{id}/sign | Sign & issue |
| GET | /doctor/profile | Doctor profile |
