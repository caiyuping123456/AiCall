# Sub-project 4: Admin Core Flow

## Goal

Implement the admin-side workflow: login → doctor management (CRUD + scheduling) → consultation management → data dashboard.

## Architecture

Admin-side is a desktop SPA using Element Plus on port 3002. Backend adds an `/admin/**` API layer with 12+ endpoints. Dashboard aggregates data from consultation, doctor, and payment tables with ECharts visualization.

## Tech Stack

- Backend: Spring Boot 3, MyBatis, JWT (BCrypt auth for admin)
- Frontend: Vue 3 + TypeScript + Element Plus + ECharts + Vite
- Database: existing admin, doctor, doctor_schedule, consultation, payment_order tables

---

## 1. Backend — Admin Authentication

**Endpoint:** `POST /admin/auth/login`

- Request: `{ username, password }`
- Admin table already has BCrypt-hashed passwords (seed: admin/admin123)
- Response: `{ token, adminId, name, role }`
- JWT with role=ADMIN
- SecurityConfig: `/admin/auth/**` permitAll, `/admin/**` authenticated

## 2. Backend — Doctor Management

### 2.1 Doctor List

**Endpoint:** `GET /admin/doctors?keyword=&page=&size=`

- Paginated list with keyword search on name/department/phone
- Returns: id, name, title, department, phone, status, createTime

### 2.2 Create Doctor

**Endpoint:** `POST /admin/doctors`

- Body: `{ name, title, department, phone, username, password }`
- Auto-generate username if not provided (e.g., "doctor_" + random)
- Password stored as BCrypt

### 2.3 Update Doctor

**Endpoint:** `PUT /admin/doctors/{id}`

- Body: `{ name, title, department, phone, introduction }`
- Cannot change username or password via this endpoint

### 2.4 Toggle Doctor Status

**Endpoint:** `PUT /admin/doctors/{id}/status`

- Body: `{ status }` (0=disabled, 1=enabled)

### 2.5 Doctor Detail

**Endpoint:** `GET /admin/doctors/{id}`

- Full doctor info + assigned consultations count + recent schedule

### 2.6 Doctor Schedule Management

**Endpoint:** `GET /admin/doctors/{id}/schedules?date=`

- List schedules for a doctor, filterable by date

**Endpoint:** `POST /admin/doctors/{id}/schedules`

- Body: `{ scheduleDate, startTime, endTime }`
- Creates a schedule slot

**Endpoint:** `PUT /admin/doctors/{id}/schedules/{scheduleId}`

- Update schedule slot

**Endpoint:** `DELETE /admin/doctors/{id}/schedules/{scheduleId}`

- Delete schedule slot

## 3. Backend — Consultation Management

### 3.1 Consultation List

**Endpoint:** `GET /admin/consultations?status=&keyword=&page=&size=`

- Paginated list with status filter and keyword search on patient name/consultation no
- Returns: id, consultationNo, patientName, department, status, fee, paymentStatus, createTime

### 3.2 Consultation Detail

**Endpoint:** `GET /admin/consultations/{id}`

- Full detail: patient info, assigned doctors, medical summary, uploads, report+QC, payment order

### 3.3 Cancel Consultation

**Endpoint:** `PUT /admin/consultations/{id}/cancel`

- Body: `{ reason }`
- Updates consultation status to 7 (cancelled)
- Logs status change

## 4. Backend — Data Dashboard

**Endpoint:** `GET /admin/dashboard`

Returns aggregated stats:

```json
{
  "consultationTotal": 150,
  "consultationByStatus": { "0": 10, "1": 5, "2": 20, "3": 30, "4": 25, "5": 40, "7": 8, "8": 12 },
  "newThisMonth": 45,
  "newThisWeek": 12,
  "byDepartment": { "内科": 60, "外科": 50, "其他": 40 },
  "doctorWorkload": [ { "doctorId": 1, "name": "张医生", "consultationCount": 25 } ],
  "revenue": { "total": 75000, "paid": 60000, "refunded": 5000 },
  "dailyTrend": [ { "date": "2026-05-18", "count": 8 }, ... ]
}
```

Data sources:
- `consultation` table: total, by status, by department, daily trend
- `consultation_doctor` + `doctor` table: workload ranking
- `payment_order` table: revenue stats

## 5. Backend — Entity / Mapper / Service / Controller

### AdminAuthService
- Login with BCrypt verification

### AdminDoctorService
- CRUD for doctors
- Schedule management (CRUD for doctor_schedule)

### AdminConsultationService
- List/detail for consultations (admin perspective, no ownership filter)
- Cancel consultation

### AdminDashboardService
- Aggregate stats from multiple mappers

### AdminAuthController (`/admin/auth`)
- POST /admin/auth/login

### AdminDoctorController (`/admin/doctors`)
- All doctor CRUD + schedule endpoints

### AdminConsultationController (`/admin/consultations`)
- All consultation management endpoints

### AdminController (`/admin`)
- GET /admin/dashboard (replaces existing empty controller)

### New mappers needed
- DoctorScheduleMapper — CRUD for doctor_schedule table
- AdminMapper — findById (already has findByUsername)

### Existing mappers to extend
- ConsultationMapper — add paginated query with status+keyword filter
- PaymentOrderMapper — add aggregation queries (sum by status)

## 6. Frontend — Admin Pages

### Layout
- Sidebar: Dashboard, Doctors, Consultations
- Top bar: admin name + logout

### Pages

1. **Login** — already exists, update to use `/admin/auth/login`
2. **Dashboard** — stat cards + ECharts (pie for department, bar for status, line for daily trend, table for workload)
3. **DoctorList** — searchable table, create/edit dialog, status toggle
4. **DoctorDetail** — doctor info tabs + schedule calendar/table
5. **ConsultationList** — status-filtered table with search
6. **ConsultationDetail** — full info display (patient, doctors, summary, report, payment)

### Router
```
/login → Login
/ → Dashboard (requiresAuth)
/doctors → DoctorList (requiresAuth)
/doctors/:id → DoctorDetail (requiresAuth)
/consultations → ConsultationList (requiresAuth)
/consultations/:id → ConsultationDetail (requiresAuth)
```

## 7. Status Lifecycle Update

**Consultation:** Full lifecycle with admin intervention
- Admin can cancel any consultation (set status=7)
- Admin can view all statuses without ownership filter

## 8. API Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /admin/auth/login | Admin login |
| GET | /admin/dashboard | Dashboard stats |
| GET | /admin/doctors | Doctor list (paginated) |
| POST | /admin/doctors | Create doctor |
| PUT | /admin/doctors/{id} | Update doctor |
| PUT | /admin/doctors/{id}/status | Toggle status |
| GET | /admin/doctors/{id} | Doctor detail |
| GET | /admin/doctors/{id}/schedules | Schedule list |
| POST | /admin/doctors/{id}/schedules | Create schedule |
| PUT | /admin/doctors/{id}/schedules/{scheduleId} | Update schedule |
| DELETE | /admin/doctors/{id}/schedules/{scheduleId} | Delete schedule |
| GET | /admin/consultations | Consultation list (paginated) |
| GET | /admin/consultations/{id} | Consultation detail |
| PUT | /admin/consultations/{id}/cancel | Cancel consultation |