# Admin Core Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete admin-side workflow for AICall: admin login, doctor management with schedules, consultation management, and a visual dashboard.

**Architecture:** Keep the backend aligned with the existing Spring Boot + MyBatis structure by adding a dedicated `/admin/auth/**` login path, three focused admin services (`AdminDoctorService`, `AdminConsultationService`, `AdminDashboardService`), and mapper extensions for pagination and aggregation. Build the frontend as a desktop Element Plus SPA under `frontend/packages/admin`, reusing the shared Axios wrapper and shared TypeScript package while adding an admin layout, route guard, CRUD pages, and ECharts-based dashboard widgets.

**Tech Stack:** Java 17, Spring Boot 3.3, Spring Security, MyBatis XML mappers, BCrypt, JWT, Vue 3, TypeScript, Vite 5, Element Plus, Pinia, ECharts, pnpm.

---

## File Structure

### Backend files

- Create: `aicall-backend/src/main/java/com/aicall/module/admin/dto/AdminLoginResponse.java` — new `/admin/auth/login` response with `token`, `adminId`, `name`, `role`.
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/dto/AdminDoctorPageRequest.java` — doctor list query params (`keyword`, `page`, `size`).
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/dto/AdminDoctorCreateRequest.java` — create doctor payload.
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/dto/AdminDoctorUpdateRequest.java` — update doctor payload.
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/dto/AdminDoctorStatusRequest.java` — doctor enable/disable payload.
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/dto/AdminDoctorListItemVO.java` — doctor table row.
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/dto/AdminDoctorDetailVO.java` — doctor detail with consultation count and recent schedules.
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/dto/AdminDoctorScheduleRequest.java` — create/update schedule payload.
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/dto/AdminDoctorScheduleVO.java` — schedule row.
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/dto/AdminConsultationPageRequest.java` — consultation list query params.
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/dto/AdminConsultationListItemVO.java` — consultation table row.
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/dto/AdminConsultationDetailVO.java` — admin consultation detail view.
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/dto/AdminConsultationCancelRequest.java` — cancel reason payload.
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/dto/AdminDashboardVO.java` — dashboard aggregate response.
- Create: `aicall-backend/src/main/java/com/aicall/module/common/dto/PageResult.java` — generic paginated response (`list`, `total`, `page`, `size`).
- Create: `aicall-backend/src/main/java/com/aicall/module/doctor/entity/DoctorSchedule.java` — doctor schedule entity.
- Create: `aicall-backend/src/main/java/com/aicall/module/doctor/mapper/DoctorScheduleMapper.java` — doctor schedule CRUD.
- Create: `aicall-backend/src/main/resources/mapper/DoctorScheduleMapper.xml` — doctor schedule SQL.
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/service/AdminDoctorService.java` — doctor CRUD + schedules.
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/service/AdminConsultationService.java` — consultation list/detail/cancel.
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/service/AdminDashboardService.java` — dashboard aggregation.
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/controller/AdminAuthController.java` — `/admin/auth/login`.
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/controller/AdminDoctorController.java` — `/admin/doctors/**`.
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/controller/AdminConsultationController.java` — `/admin/consultations/**`.
- Modify: `aicall-backend/src/main/java/com/aicall/module/admin/mapper/AdminMapper.java` — add `findById`.
- Modify: `aicall-backend/src/main/resources/mapper/AdminMapper.xml` — add `findById` SQL.
- Modify: `aicall-backend/src/main/java/com/aicall/module/admin/service/AdminService.java` — keep existing `/admin/login`, add method returning `AdminLoginResponse`.
- Modify: `aicall-backend/src/main/java/com/aicall/module/admin/controller/AdminController.java` — replace empty dashboard role with `GET /admin/dashboard` while keeping existing `POST /admin/login` if desired.
- Modify: `aicall-backend/src/main/java/com/aicall/module/doctor/mapper/DoctorMapper.java` — add admin doctor list/detail/create/update/status methods.
- Modify: `aicall-backend/src/main/resources/mapper/DoctorMapper.xml` — add doctor list/detail CRUD SQL.
- Modify: `aicall-backend/src/main/java/com/aicall/module/consultation/mapper/ConsultationMapper.java` — add paginated admin list/detail/aggregations/cancel helpers.
- Modify: `aicall-backend/src/main/resources/mapper/ConsultationMapper.xml` — add admin queries.
- Modify: `aicall-backend/src/main/java/com/aicall/module/payment/mapper/PaymentOrderMapper.java` — add revenue aggregation methods.
- Modify: `aicall-backend/src/main/resources/mapper/PaymentOrderMapper.xml` — add revenue SQL.
- Modify: `aicall-backend/src/main/java/com/aicall/config/SecurityConfig.java` — permit `/admin/auth/**`.

### Frontend files

- Create: `frontend/packages/shared/src/api/admin.ts` — admin API wrapper and shared interfaces.
- Modify: `frontend/packages/shared/src/index.ts` — export admin API.
- Create: `frontend/packages/admin/src/layout/MainLayout.vue` — sidebar + topbar.
- Create: `frontend/packages/admin/src/stores/admin.ts` — admin auth store.
- Create: `frontend/packages/admin/src/views/Dashboard.vue` — cards + charts + workload table.
- Create: `frontend/packages/admin/src/views/DoctorList.vue` — search, table, dialogs, status switch.
- Create: `frontend/packages/admin/src/views/DoctorDetail.vue` — doctor profile + schedule table.
- Create: `frontend/packages/admin/src/views/ConsultationList.vue` — status filter + search + pagination.
- Create: `frontend/packages/admin/src/views/ConsultationDetail.vue` — full consultation detail + cancel action.
- Modify: `frontend/packages/admin/src/views/Login.vue` — call `/admin/auth/login`, store token, redirect.
- Modify: `frontend/packages/admin/src/router/index.ts` — nested routes + auth guard.
- Modify: `frontend/packages/admin/src/main.ts` — install Pinia.
- Modify: `frontend/packages/admin/package.json` — add `pinia` and `@element-plus/icons-vue` if missing.

### Verification commands

- Backend compile: `mvn -f aicall-backend/pom.xml compile`
- Backend tests (if added): `mvn -f aicall-backend/pom.xml test`
- Admin frontend typecheck/build: `pnpm -C frontend/packages/admin build`
- Admin frontend dev server: `pnpm -C frontend/packages/admin dev`

---

### Task 1: Add admin auth endpoint and shared pagination primitives

**Files:**
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/dto/AdminLoginResponse.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/common/dto/PageResult.java`
- Modify: `aicall-backend/src/main/java/com/aicall/config/SecurityConfig.java`
- Modify: `aicall-backend/src/main/java/com/aicall/module/admin/mapper/AdminMapper.java`
- Modify: `aicall-backend/src/main/resources/mapper/AdminMapper.xml`
- Modify: `aicall-backend/src/main/java/com/aicall/module/admin/service/AdminService.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/controller/AdminAuthController.java`
- Test: `aicall-backend/src/test/java/com/aicall/module/admin/service/AdminServiceTest.java`

- [ ] **Step 1: Write the failing backend test**

```java
package com.aicall.module.admin.service;

import com.aicall.common.exception.BusinessException;
import com.aicall.module.admin.dto.AdminLoginResponse;
import com.aicall.module.admin.dto.LoginRequest;
import com.aicall.module.admin.entity.Admin;
import com.aicall.module.admin.mapper.AdminMapper;
import com.aicall.infrastructure.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private AdminMapper adminMapper;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtTokenProvider jwtTokenProvider;
    @InjectMocks
    private AdminService adminService;

    @Test
    void loginForAuthEndpointReturnsAdminRolePayload() {
        LoginRequest request = new LoginRequest();
        request.setUsername("admin");
        request.setPassword("admin123");

        Admin admin = new Admin();
        admin.setId(1L);
        admin.setUsername("admin");
        admin.setPassword("$2a$10$encoded");
        admin.setName("系统管理员");
        admin.setStatus(1);

        when(adminMapper.findByUsername("admin")).thenReturn(admin);
        when(passwordEncoder.matches("admin123", "$2a$10$encoded")).thenReturn(true);
        when(jwtTokenProvider.generateToken(1L, "admin", "ADMIN")).thenReturn("jwt-token");

        AdminLoginResponse response = adminService.loginForAdminAuth(request);

        assertEquals("jwt-token", response.getToken());
        assertEquals(1L, response.getAdminId());
        assertEquals("系统管理员", response.getName());
        assertEquals("ADMIN", response.getRole());
    }

    @Test
    void loginForAuthEndpointRejectsDisabledAdmin() {
        LoginRequest request = new LoginRequest();
        request.setUsername("admin");
        request.setPassword("admin123");

        Admin admin = new Admin();
        admin.setId(1L);
        admin.setUsername("admin");
        admin.setPassword("$2a$10$encoded");
        admin.setStatus(0);

        when(adminMapper.findByUsername("admin")).thenReturn(admin);
        when(passwordEncoder.matches("admin123", "$2a$10$encoded")).thenReturn(true);

        assertThrows(BusinessException.class, () -> adminService.loginForAdminAuth(request));
    }
}
```

- [ ] **Step 2: Run the backend test to verify it fails**

Run: `mvn -f aicall-backend/pom.xml -Dtest=AdminServiceTest test`
Expected: FAIL because `AdminLoginResponse`, `loginForAdminAuth`, and `findById` do not exist yet.

- [ ] **Step 3: Implement the minimal backend code**

Create `AdminLoginResponse.java`:

```java
package com.aicall.module.admin.dto;

import lombok.Data;

@Data
public class AdminLoginResponse {
    private String token;
    private Long adminId;
    private String name;
    private String role;
}
```

Create `PageResult.java`:

```java
package com.aicall.module.common.dto;

import lombok.Data;

import java.util.List;

@Data
public class PageResult<T> {
    private List<T> list;
    private long total;
    private int page;
    private int size;

    public static <T> PageResult<T> of(List<T> list, long total, int page, int size) {
        PageResult<T> result = new PageResult<>();
        result.setList(list);
        result.setTotal(total);
        result.setPage(page);
        result.setSize(size);
        return result;
    }
}
```

Update `AdminMapper.java`:

```java
@Mapper
public interface AdminMapper {
    Admin findByUsername(String username);
    Admin findById(@Param("id") Long id);
}
```

Update `AdminMapper.xml`:

```xml
<select id="findById" resultType="com.aicall.module.admin.entity.Admin">
    SELECT * FROM admin WHERE id = #{id}
</select>
```

Add to `AdminService.java`:

```java
public AdminLoginResponse loginForAdminAuth(LoginRequest request) {
    Admin admin = adminMapper.findByUsername(request.getUsername());
    if (admin == null || !passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
        throw BusinessException.fail(ResultCode.UNAUTHORIZED);
    }
    if (!Integer.valueOf(1).equals(admin.getStatus())) {
        throw BusinessException.fail("账号已禁用");
    }
    AdminLoginResponse response = new AdminLoginResponse();
    response.setToken(jwtTokenProvider.generateToken(admin.getId(), admin.getUsername(), "ADMIN"));
    response.setAdminId(admin.getId());
    response.setName(admin.getName());
    response.setRole("ADMIN");
    return response;
}
```

Create `AdminAuthController.java`:

```java
package com.aicall.module.admin.controller;

import com.aicall.common.result.Result;
import com.aicall.module.admin.dto.AdminLoginResponse;
import com.aicall.module.admin.dto.LoginRequest;
import com.aicall.module.admin.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/auth")
@RequiredArgsConstructor
public class AdminAuthController {
    private final AdminService adminService;

    @PostMapping("/login")
    public Result<AdminLoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return Result.success(adminService.loginForAdminAuth(request));
    }
}
```

Update `SecurityConfig.java` request matchers:

```java
.requestMatchers("/user/auth/**", "/doctor/auth/**", "/admin/auth/**", "/doctor/login", "/admin/login", "/ws/**").permitAll()
```

- [ ] **Step 4: Run verification**

Run: `mvn -f aicall-backend/pom.xml -Dtest=AdminServiceTest test`
Expected: PASS.

Run: `mvn -f aicall-backend/pom.xml compile`
Expected: BUILD SUCCESS.

- [ ] **Step 5: Commit**

```bash
git add aicall-backend/src/main/java/com/aicall/module/admin/dto/AdminLoginResponse.java \
  aicall-backend/src/main/java/com/aicall/module/common/dto/PageResult.java \
  aicall-backend/src/main/java/com/aicall/config/SecurityConfig.java \
  aicall-backend/src/main/java/com/aicall/module/admin/mapper/AdminMapper.java \
  aicall-backend/src/main/resources/mapper/AdminMapper.xml \
  aicall-backend/src/main/java/com/aicall/module/admin/service/AdminService.java \
  aicall-backend/src/main/java/com/aicall/module/admin/controller/AdminAuthController.java \
  aicall-backend/src/test/java/com/aicall/module/admin/service/AdminServiceTest.java

git commit -m "feat: add admin auth endpoint"
```

### Task 2: Add doctor admin CRUD and schedule mapper support

**Files:**
- Create: `aicall-backend/src/main/java/com/aicall/module/doctor/entity/DoctorSchedule.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/doctor/mapper/DoctorScheduleMapper.java`
- Create: `aicall-backend/src/main/resources/mapper/DoctorScheduleMapper.xml`
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/dto/AdminDoctorPageRequest.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/dto/AdminDoctorCreateRequest.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/dto/AdminDoctorUpdateRequest.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/dto/AdminDoctorStatusRequest.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/dto/AdminDoctorListItemVO.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/dto/AdminDoctorDetailVO.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/dto/AdminDoctorScheduleRequest.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/dto/AdminDoctorScheduleVO.java`
- Modify: `aicall-backend/src/main/java/com/aicall/module/doctor/mapper/DoctorMapper.java`
- Modify: `aicall-backend/src/main/resources/mapper/DoctorMapper.xml`
- Test: `aicall-backend/src/test/java/com/aicall/module/admin/service/AdminDoctorServiceTest.java`

- [ ] **Step 1: Write the failing backend test**

```java
package com.aicall.module.admin.service;

import com.aicall.module.admin.dto.AdminDoctorCreateRequest;
import com.aicall.module.doctor.entity.Doctor;
import com.aicall.module.doctor.mapper.DoctorMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminDoctorServiceTest {

    @Mock
    private DoctorMapper doctorMapper;
    @Mock
    private PasswordEncoder passwordEncoder;
    @InjectMocks
    private AdminDoctorService adminDoctorService;

    @Test
    void createDoctorEncodesPasswordAndGeneratesUsername() {
        AdminDoctorCreateRequest request = new AdminDoctorCreateRequest();
        request.setName("张医生");
        request.setTitle("主任医师");
        request.setDepartment("内科");
        request.setPhone("13800000000");
        request.setPassword("123456");

        when(passwordEncoder.encode("123456")).thenReturn("encoded-password");

        adminDoctorService.createDoctor(request);

        ArgumentCaptor<Doctor> captor = ArgumentCaptor.forClass(Doctor.class);
        verify(doctorMapper).insert(captor.capture());
        Doctor doctor = captor.getValue();
        assertTrue(doctor.getUsername().startsWith("doctor_"));
        assertEquals("encoded-password", doctor.getPassword());
        assertEquals("张医生", doctor.getName());
    }
}
```

- [ ] **Step 2: Run the backend test to verify it fails**

Run: `mvn -f aicall-backend/pom.xml -Dtest=AdminDoctorServiceTest test`
Expected: FAIL because `AdminDoctorService`, doctor insert mapper methods, and schedule classes do not exist yet.

- [ ] **Step 3: Implement doctor and schedule persistence**

Create `DoctorSchedule.java`:

```java
package com.aicall.module.doctor.entity;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
public class DoctorSchedule {
    private Long id;
    private Long doctorId;
    private LocalDate scheduleDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
```

Create `DoctorScheduleMapper.java`:

```java
package com.aicall.module.doctor.mapper;

import com.aicall.module.doctor.entity.DoctorSchedule;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface DoctorScheduleMapper {
    List<DoctorSchedule> findByDoctorIdAndDate(@Param("doctorId") Long doctorId, @Param("date") LocalDate date);
    List<DoctorSchedule> findRecentByDoctorId(@Param("doctorId") Long doctorId, @Param("limit") int limit);
    DoctorSchedule findById(@Param("id") Long id);
    void insert(DoctorSchedule schedule);
    void update(DoctorSchedule schedule);
    void delete(@Param("id") Long id);
}
```

Create `DoctorScheduleMapper.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.aicall.module.doctor.mapper.DoctorScheduleMapper">
    <select id="findByDoctorIdAndDate" resultType="com.aicall.module.doctor.entity.DoctorSchedule">
        SELECT *
        FROM doctor_schedule
        WHERE doctor_id = #{doctorId}
        <if test="date != null">
            AND schedule_date = #{date}
        </if>
        ORDER BY schedule_date DESC, start_time ASC
    </select>

    <select id="findRecentByDoctorId" resultType="com.aicall.module.doctor.entity.DoctorSchedule">
        SELECT * FROM doctor_schedule WHERE doctor_id = #{doctorId}
        ORDER BY schedule_date DESC, start_time ASC LIMIT #{limit}
    </select>

    <select id="findById" resultType="com.aicall.module.doctor.entity.DoctorSchedule">
        SELECT * FROM doctor_schedule WHERE id = #{id}
    </select>

    <insert id="insert" useGeneratedKeys="true" keyProperty="id">
        INSERT INTO doctor_schedule (doctor_id, schedule_date, start_time, end_time, status)
        VALUES (#{doctorId}, #{scheduleDate}, #{startTime}, #{endTime}, #{status})
    </insert>

    <update id="update">
        UPDATE doctor_schedule
        SET schedule_date = #{scheduleDate}, start_time = #{startTime}, end_time = #{endTime}, status = #{status}
        WHERE id = #{id}
    </update>

    <delete id="delete">
        DELETE FROM doctor_schedule WHERE id = #{id}
    </delete>
</mapper>
```

Update `DoctorMapper.java`:

```java
@Mapper
public interface DoctorMapper {
    Doctor findByUsername(String username);
    Doctor findById(@Param("id") Long id);
    List<Doctor> findAdminPage(@Param("keyword") String keyword, @Param("offset") int offset, @Param("size") int size);
    long countAdminPage(@Param("keyword") String keyword);
    void insert(Doctor doctor);
    void updateById(Doctor doctor);
    void updateStatus(@Param("id") Long id, @Param("status") Integer status);
}
```

Add to `DoctorMapper.xml`:

```xml
<select id="findAdminPage" resultType="com.aicall.module.doctor.entity.Doctor">
    SELECT id, username, password, name, title, department, phone, avatar, introduction, status, create_time, update_time
    FROM doctor
    <where>
        <if test="keyword != null and keyword != ''">
            AND (name LIKE CONCAT('%', #{keyword}, '%')
            OR department LIKE CONCAT('%', #{keyword}, '%')
            OR phone LIKE CONCAT('%', #{keyword}, '%'))
        </if>
    </where>
    ORDER BY create_time DESC
    LIMIT #{offset}, #{size}
</select>

<select id="countAdminPage" resultType="long">
    SELECT COUNT(*)
    FROM doctor
    <where>
        <if test="keyword != null and keyword != ''">
            AND (name LIKE CONCAT('%', #{keyword}, '%')
            OR department LIKE CONCAT('%', #{keyword}, '%')
            OR phone LIKE CONCAT('%', #{keyword}, '%'))
        </if>
    </where>
</select>

<insert id="insert" useGeneratedKeys="true" keyProperty="id">
    INSERT INTO doctor (username, password, name, title, department, phone, introduction, status)
    VALUES (#{username}, #{password}, #{name}, #{title}, #{department}, #{phone}, #{introduction}, #{status})
</insert>

<update id="updateById">
    UPDATE doctor
    SET name = #{name}, title = #{title}, department = #{department}, phone = #{phone}, introduction = #{introduction}
    WHERE id = #{id}
</update>

<update id="updateStatus">
    UPDATE doctor SET status = #{status} WHERE id = #{id}
</update>
```

- [ ] **Step 4: Create DTOs with exact fields**

Create `AdminDoctorCreateRequest.java`:

```java
@Data
public class AdminDoctorCreateRequest {
    @NotBlank(message = "姓名不能为空")
    private String name;
    private String title;
    private String department;
    private String phone;
    private String username;
    @NotBlank(message = "密码不能为空")
    private String password;
}
```

Create `AdminDoctorUpdateRequest.java`:

```java
@Data
public class AdminDoctorUpdateRequest {
    @NotBlank(message = "姓名不能为空")
    private String name;
    private String title;
    private String department;
    private String phone;
    private String introduction;
}
```

Create `AdminDoctorStatusRequest.java`:

```java
@Data
public class AdminDoctorStatusRequest {
    @NotNull(message = "状态不能为空")
    private Integer status;
}
```

Create `AdminDoctorPageRequest.java`:

```java
@Data
public class AdminDoctorPageRequest {
    private String keyword;
    @NotNull
    private Integer page;
    @NotNull
    private Integer size;
}
```

Create `AdminDoctorListItemVO.java` and `AdminDoctorScheduleVO.java` as plain `@Data` classes matching the spec fields.

Create `AdminDoctorDetailVO.java` with fields:

```java
private Long id;
private String username;
private String name;
private String title;
private String department;
private String phone;
private String introduction;
private Integer status;
private Long consultationCount;
private List<AdminDoctorScheduleVO> recentSchedules;
```

Create `AdminDoctorScheduleRequest.java`:

```java
@Data
public class AdminDoctorScheduleRequest {
    @NotNull
    private LocalDate scheduleDate;
    @NotNull
    private LocalTime startTime;
    @NotNull
    private LocalTime endTime;
}
```

- [ ] **Step 5: Implement the service and verify**

Create `AdminDoctorService.java` with these method signatures:

```java
public PageResult<AdminDoctorListItemVO> getDoctors(String keyword, Integer page, Integer size)
public void createDoctor(AdminDoctorCreateRequest request)
public void updateDoctor(Long id, AdminDoctorUpdateRequest request)
public void updateDoctorStatus(Long id, Integer status)
public AdminDoctorDetailVO getDoctorDetail(Long id)
public List<AdminDoctorScheduleVO> getSchedules(Long doctorId, LocalDate date)
public void createSchedule(Long doctorId, AdminDoctorScheduleRequest request)
public void updateSchedule(Long doctorId, Long scheduleId, AdminDoctorScheduleRequest request)
public void deleteSchedule(Long doctorId, Long scheduleId)
```

Use this exact username generation pattern in `createDoctor`:

```java
String username = StrUtil.isBlank(request.getUsername())
        ? "doctor_" + RandomUtil.randomString(6)
        : request.getUsername();
```

Use this exact password storage:

```java
doctor.setPassword(passwordEncoder.encode(request.getPassword()));
```

Run: `mvn -f aicall-backend/pom.xml -Dtest=AdminDoctorServiceTest test`
Expected: PASS.

Run: `mvn -f aicall-backend/pom.xml compile`
Expected: BUILD SUCCESS.

- [ ] **Step 6: Commit**

```bash
git add aicall-backend/src/main/java/com/aicall/module/doctor/entity/DoctorSchedule.java \
  aicall-backend/src/main/java/com/aicall/module/doctor/mapper/DoctorScheduleMapper.java \
  aicall-backend/src/main/resources/mapper/DoctorScheduleMapper.xml \
  aicall-backend/src/main/java/com/aicall/module/admin/dto/AdminDoctorPageRequest.java \
  aicall-backend/src/main/java/com/aicall/module/admin/dto/AdminDoctorCreateRequest.java \
  aicall-backend/src/main/java/com/aicall/module/admin/dto/AdminDoctorUpdateRequest.java \
  aicall-backend/src/main/java/com/aicall/module/admin/dto/AdminDoctorStatusRequest.java \
  aicall-backend/src/main/java/com/aicall/module/admin/dto/AdminDoctorListItemVO.java \
  aicall-backend/src/main/java/com/aicall/module/admin/dto/AdminDoctorDetailVO.java \
  aicall-backend/src/main/java/com/aicall/module/admin/dto/AdminDoctorScheduleRequest.java \
  aicall-backend/src/main/java/com/aicall/module/admin/dto/AdminDoctorScheduleVO.java \
  aicall-backend/src/main/java/com/aicall/module/doctor/mapper/DoctorMapper.java \
  aicall-backend/src/main/resources/mapper/DoctorMapper.xml \
  aicall-backend/src/main/java/com/aicall/module/admin/service/AdminDoctorService.java \
  aicall-backend/src/test/java/com/aicall/module/admin/service/AdminDoctorServiceTest.java

git commit -m "feat: add admin doctor management"
```

### Task 3: Expose doctor admin endpoints

**Files:**
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/controller/AdminDoctorController.java`
- Modify: `aicall-backend/src/main/java/com/aicall/module/admin/controller/AdminController.java`
- Test: `aicall-backend/src/test/java/com/aicall/module/admin/controller/AdminDoctorControllerTest.java`

- [ ] **Step 1: Write the failing controller test**

```java
@WebMvcTest(AdminDoctorController.class)
class AdminDoctorControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @MockBean
    private AdminDoctorService adminDoctorService;

    @Test
    void listDoctorsReturnsPageResult() throws Exception {
        mockMvc.perform(get("/admin/doctors")
                .param("keyword", "内科")
                .param("page", "1")
                .param("size", "10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200));
    }
}
```

- [ ] **Step 2: Run the controller test to verify it fails**

Run: `mvn -f aicall-backend/pom.xml -Dtest=AdminDoctorControllerTest test`
Expected: FAIL because `AdminDoctorController` does not exist.

- [ ] **Step 3: Implement the controller**

Create `AdminDoctorController.java`:

```java
package com.aicall.module.admin.controller;

import com.aicall.common.result.Result;
import com.aicall.module.admin.dto.*;
import com.aicall.module.admin.service.AdminDoctorService;
import com.aicall.module.common.dto.PageResult;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/admin/doctors")
@RequiredArgsConstructor
public class AdminDoctorController {
    private final AdminDoctorService adminDoctorService;

    @GetMapping
    public Result<PageResult<AdminDoctorListItemVO>> list(@RequestParam(required = false) String keyword,
                                                          @RequestParam Integer page,
                                                          @RequestParam Integer size) {
        return Result.success(adminDoctorService.getDoctors(keyword, page, size));
    }

    @PostMapping
    public Result<Void> create(@Valid @RequestBody AdminDoctorCreateRequest request) {
        adminDoctorService.createDoctor(request);
        return Result.success();
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody AdminDoctorUpdateRequest request) {
        adminDoctorService.updateDoctor(id, request);
        return Result.success();
    }

    @PutMapping("/{id}/status")
    public Result<Void> updateStatus(@PathVariable Long id, @Valid @RequestBody AdminDoctorStatusRequest request) {
        adminDoctorService.updateDoctorStatus(id, request.getStatus());
        return Result.success();
    }

    @GetMapping("/{id}")
    public Result<AdminDoctorDetailVO> detail(@PathVariable Long id) {
        return Result.success(adminDoctorService.getDoctorDetail(id));
    }

    @GetMapping("/{id}/schedules")
    public Result<List<AdminDoctorScheduleVO>> schedules(@PathVariable Long id,
                                                         @RequestParam(required = false) LocalDate date) {
        return Result.success(adminDoctorService.getSchedules(id, date));
    }

    @PostMapping("/{id}/schedules")
    public Result<Void> createSchedule(@PathVariable Long id, @Valid @RequestBody AdminDoctorScheduleRequest request) {
        adminDoctorService.createSchedule(id, request);
        return Result.success();
    }

    @PutMapping("/{id}/schedules/{scheduleId}")
    public Result<Void> updateSchedule(@PathVariable Long id,
                                       @PathVariable Long scheduleId,
                                       @Valid @RequestBody AdminDoctorScheduleRequest request) {
        adminDoctorService.updateSchedule(id, scheduleId, request);
        return Result.success();
    }

    @DeleteMapping("/{id}/schedules/{scheduleId}")
    public Result<Void> deleteSchedule(@PathVariable Long id, @PathVariable Long scheduleId) {
        adminDoctorService.deleteSchedule(id, scheduleId);
        return Result.success();
    }
}
```

If `AdminController.java` still contains only login, leave login in place and later add dashboard there instead of moving login.

- [ ] **Step 4: Run verification**

Run: `mvn -f aicall-backend/pom.xml -Dtest=AdminDoctorControllerTest test`
Expected: PASS.

Run: `mvn -f aicall-backend/pom.xml compile`
Expected: BUILD SUCCESS.

- [ ] **Step 5: Commit**

```bash
git add aicall-backend/src/main/java/com/aicall/module/admin/controller/AdminDoctorController.java \
  aicall-backend/src/main/java/com/aicall/module/admin/controller/AdminController.java \
  aicall-backend/src/test/java/com/aicall/module/admin/controller/AdminDoctorControllerTest.java

git commit -m "feat: add admin doctor endpoints"
```

### Task 4: Add admin consultation list, detail, and cancel flow

**Files:**
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/dto/AdminConsultationPageRequest.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/dto/AdminConsultationListItemVO.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/dto/AdminConsultationDetailVO.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/dto/AdminConsultationCancelRequest.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/service/AdminConsultationService.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/controller/AdminConsultationController.java`
- Modify: `aicall-backend/src/main/java/com/aicall/module/consultation/mapper/ConsultationMapper.java`
- Modify: `aicall-backend/src/main/resources/mapper/ConsultationMapper.xml`
- Test: `aicall-backend/src/test/java/com/aicall/module/admin/service/AdminConsultationServiceTest.java`

- [ ] **Step 1: Write the failing service test**

```java
@ExtendWith(MockitoExtension.class)
class AdminConsultationServiceTest {

    @Mock
    private ConsultationMapper consultationMapper;
    @InjectMocks
    private AdminConsultationService adminConsultationService;

    @Test
    void cancelConsultationSetsStatusSevenAndReason() {
        adminConsultationService.cancelConsultation(1L, "管理员取消");
        verify(consultationMapper).updateCancel(1L, 7, "管理员取消");
    }
}
```

- [ ] **Step 2: Run the service test to verify it fails**

Run: `mvn -f aicall-backend/pom.xml -Dtest=AdminConsultationServiceTest test`
Expected: FAIL because `AdminConsultationService` and `updateCancel` do not exist.

- [ ] **Step 3: Extend the mapper**

Update `ConsultationMapper.java` with these methods:

```java
List<Consultation> findAdminPage(@Param("status") Integer status,
                                 @Param("keyword") String keyword,
                                 @Param("offset") int offset,
                                 @Param("size") int size);

long countAdminPage(@Param("status") Integer status,
                    @Param("keyword") String keyword);

void updateCancel(@Param("id") Long id,
                  @Param("status") Integer status,
                  @Param("reason") String reason);

List<Map<String, Object>> countByStatus();
List<Map<String, Object>> countByDepartment();
List<Map<String, Object>> countDailyTrend(@Param("startDate") String startDate);
```

Add to `ConsultationMapper.xml`:

```xml
<select id="findAdminPage" resultType="com.aicall.module.consultation.entity.Consultation">
    SELECT c.id, c.consultation_no, c.patient_id, c.type, c.status, c.department,
           c.chief_complaint, c.medical_summary, c.fee, c.payment_status,
           c.scheduled_time, c.end_time, c.cancel_reason, c.reject_reason,
           c.create_time, c.update_time,
           p.name AS patient_name, p.age AS patient_age, p.gender AS patient_gender
    FROM consultation c
    LEFT JOIN patient p ON c.patient_id = p.id
    <where>
        <if test="status != null">
            AND c.status = #{status}
        </if>
        <if test="keyword != null and keyword != ''">
            AND (p.name LIKE CONCAT('%', #{keyword}, '%')
            OR c.consultation_no LIKE CONCAT('%', #{keyword}, '%'))
        </if>
    </where>
    ORDER BY c.create_time DESC
    LIMIT #{offset}, #{size}
</select>

<select id="countAdminPage" resultType="long">
    SELECT COUNT(*)
    FROM consultation c
    LEFT JOIN patient p ON c.patient_id = p.id
    <where>
        <if test="status != null">
            AND c.status = #{status}
        </if>
        <if test="keyword != null and keyword != ''">
            AND (p.name LIKE CONCAT('%', #{keyword}, '%')
            OR c.consultation_no LIKE CONCAT('%', #{keyword}, '%'))
        </if>
    </where>
</select>

<update id="updateCancel">
    UPDATE consultation
    SET status = #{status}, cancel_reason = #{reason}
    WHERE id = #{id}
</update>
```

- [ ] **Step 4: Implement DTOs, service, and controller**

Create `AdminConsultationListItemVO` with fields:

```java
private Long id;
private String consultationNo;
private String patientName;
private String department;
private Integer status;
private BigDecimal fee;
private Integer paymentStatus;
private LocalDateTime createTime;
```

Create `AdminConsultationCancelRequest.java`:

```java
@Data
public class AdminConsultationCancelRequest {
    @NotBlank(message = "取消原因不能为空")
    private String reason;
}
```

Create `AdminConsultationService.java` with methods:

```java
public PageResult<AdminConsultationListItemVO> getConsultations(Integer status, String keyword, Integer page, Integer size)
public AdminConsultationDetailVO getConsultationDetail(Long id)
public void cancelConsultation(Long id, String reason)
```

Use this exact cancel implementation:

```java
consultationMapper.updateCancel(id, 7, reason);
```

Create `AdminConsultationController.java`:

```java
@RestController
@RequestMapping("/admin/consultations")
@RequiredArgsConstructor
public class AdminConsultationController {
    private final AdminConsultationService adminConsultationService;

    @GetMapping
    public Result<PageResult<AdminConsultationListItemVO>> list(@RequestParam(required = false) Integer status,
                                                                @RequestParam(required = false) String keyword,
                                                                @RequestParam Integer page,
                                                                @RequestParam Integer size) {
        return Result.success(adminConsultationService.getConsultations(status, keyword, page, size));
    }

    @GetMapping("/{id}")
    public Result<AdminConsultationDetailVO> detail(@PathVariable Long id) {
        return Result.success(adminConsultationService.getConsultationDetail(id));
    }

    @PutMapping("/{id}/cancel")
    public Result<Void> cancel(@PathVariable Long id,
                               @Valid @RequestBody AdminConsultationCancelRequest request) {
        adminConsultationService.cancelConsultation(id, request.getReason());
        return Result.success();
    }
}
```

- [ ] **Step 5: Run verification**

Run: `mvn -f aicall-backend/pom.xml -Dtest=AdminConsultationServiceTest test`
Expected: PASS.

Run: `mvn -f aicall-backend/pom.xml compile`
Expected: BUILD SUCCESS.

- [ ] **Step 6: Commit**

```bash
git add aicall-backend/src/main/java/com/aicall/module/admin/dto/AdminConsultationPageRequest.java \
  aicall-backend/src/main/java/com/aicall/module/admin/dto/AdminConsultationListItemVO.java \
  aicall-backend/src/main/java/com/aicall/module/admin/dto/AdminConsultationDetailVO.java \
  aicall-backend/src/main/java/com/aicall/module/admin/dto/AdminConsultationCancelRequest.java \
  aicall-backend/src/main/java/com/aicall/module/admin/service/AdminConsultationService.java \
  aicall-backend/src/main/java/com/aicall/module/admin/controller/AdminConsultationController.java \
  aicall-backend/src/main/java/com/aicall/module/consultation/mapper/ConsultationMapper.java \
  aicall-backend/src/main/resources/mapper/ConsultationMapper.xml \
  aicall-backend/src/test/java/com/aicall/module/admin/service/AdminConsultationServiceTest.java

git commit -m "feat: add admin consultation management"
```

### Task 5: Add dashboard aggregation backend

**Files:**
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/dto/AdminDashboardVO.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/service/AdminDashboardService.java`
- Modify: `aicall-backend/src/main/java/com/aicall/module/payment/mapper/PaymentOrderMapper.java`
- Modify: `aicall-backend/src/main/resources/mapper/PaymentOrderMapper.xml`
- Modify: `aicall-backend/src/main/java/com/aicall/module/admin/controller/AdminController.java`
- Test: `aicall-backend/src/test/java/com/aicall/module/admin/service/AdminDashboardServiceTest.java`

- [ ] **Step 1: Write the failing dashboard test**

```java
@ExtendWith(MockitoExtension.class)
class AdminDashboardServiceTest {

    @Mock
    private ConsultationMapper consultationMapper;
    @Mock
    private PaymentOrderMapper paymentOrderMapper;
    @InjectMocks
    private AdminDashboardService adminDashboardService;

    @Test
    void dashboardIncludesRevenueTotals() {
        when(paymentOrderMapper.sumAmountByStatus(1)).thenReturn(new BigDecimal("60000"));
        when(paymentOrderMapper.sumAmountByStatus(2)).thenReturn(new BigDecimal("5000"));

        AdminDashboardVO dashboard = adminDashboardService.getDashboard();

        assertEquals(new BigDecimal("60000"), dashboard.getRevenue().getPaid());
        assertEquals(new BigDecimal("5000"), dashboard.getRevenue().getRefunded());
    }
}
```

- [ ] **Step 2: Run the dashboard test to verify it fails**

Run: `mvn -f aicall-backend/pom.xml -Dtest=AdminDashboardServiceTest test`
Expected: FAIL because `AdminDashboardService`, `AdminDashboardVO`, and payment aggregation methods do not exist.

- [ ] **Step 3: Extend the payment mapper**

Update `PaymentOrderMapper.java`:

```java
@Mapper
public interface PaymentOrderMapper {
    void insert(PaymentOrder order);
    BigDecimal sumAmountByStatus(@Param("status") Integer status);
}
```

Update `PaymentOrderMapper.xml`:

```xml
<select id="sumAmountByStatus" resultType="java.math.BigDecimal">
    SELECT COALESCE(SUM(amount), 0)
    FROM payment_order
    WHERE status = #{status}
</select>
```

- [ ] **Step 4: Implement dashboard service and endpoint**

Create `AdminDashboardVO.java` with nested static classes:

```java
@Data
public class AdminDashboardVO {
    private Long consultationTotal;
    private Map<String, Long> consultationByStatus;
    private Long newThisMonth;
    private Long newThisWeek;
    private Map<String, Long> byDepartment;
    private List<DoctorWorkloadItem> doctorWorkload;
    private RevenueVO revenue;
    private List<DailyTrendItem> dailyTrend;

    @Data
    public static class DoctorWorkloadItem {
        private Long doctorId;
        private String name;
        private Long consultationCount;
    }

    @Data
    public static class RevenueVO {
        private BigDecimal total;
        private BigDecimal paid;
        private BigDecimal refunded;
    }

    @Data
    public static class DailyTrendItem {
        private String date;
        private Long count;
    }
}
```

Create `AdminDashboardService.java` with `getDashboard()` that:
- uses `consultationMapper.countAdminPage(null, null)` for total,
- transforms `countByStatus()` into `Map<String, Long>`,
- transforms `countByDepartment()` into `Map<String, Long>`,
- uses `paymentOrderMapper.sumAmountByStatus(1)` for paid,
- uses `paymentOrderMapper.sumAmountByStatus(2)` for refunded,
- sets `total = paid.subtract(refunded).max(BigDecimal.ZERO)` only if your product semantics mean net revenue, otherwise use `paid` as total and document it in code review.

Update `AdminController.java` to include:

```java
@GetMapping("/dashboard")
public Result<AdminDashboardVO> dashboard() {
    return Result.success(adminDashboardService.getDashboard());
}
```

Inject `AdminDashboardService` through `@RequiredArgsConstructor`.

- [ ] **Step 5: Run verification**

Run: `mvn -f aicall-backend/pom.xml -Dtest=AdminDashboardServiceTest test`
Expected: PASS.

Run: `mvn -f aicall-backend/pom.xml compile`
Expected: BUILD SUCCESS.

- [ ] **Step 6: Commit**

```bash
git add aicall-backend/src/main/java/com/aicall/module/admin/dto/AdminDashboardVO.java \
  aicall-backend/src/main/java/com/aicall/module/admin/service/AdminDashboardService.java \
  aicall-backend/src/main/java/com/aicall/module/payment/mapper/PaymentOrderMapper.java \
  aicall-backend/src/main/resources/mapper/PaymentOrderMapper.xml \
  aicall-backend/src/main/java/com/aicall/module/admin/controller/AdminController.java \
  aicall-backend/src/test/java/com/aicall/module/admin/service/AdminDashboardServiceTest.java

git commit -m "feat: add admin dashboard api"
```

### Task 6: Add shared admin frontend API and auth store

**Files:**
- Create: `frontend/packages/shared/src/api/admin.ts`
- Modify: `frontend/packages/shared/src/index.ts`
- Modify: `frontend/packages/admin/package.json`
- Modify: `frontend/packages/admin/src/main.ts`
- Create: `frontend/packages/admin/src/stores/admin.ts`
- Modify: `frontend/packages/admin/src/router/index.ts`
- Modify: `frontend/packages/admin/src/views/Login.vue`
- Test: `frontend/packages/admin/src/views/Login.vue`

- [ ] **Step 1: Write the failing frontend type usage**

Replace `Login.vue` script usage with imports that do not exist yet:

```ts
import { adminLogin, type AdminLoginResponse } from '@aicall/shared';
import { useAdminStore } from '@/stores/admin';
```

This should fail the frontend build until the shared API and store exist.

- [ ] **Step 2: Run the frontend build to verify it fails**

Run: `pnpm -C frontend/packages/admin build`
Expected: FAIL with missing module or export errors for `adminLogin`, `AdminLoginResponse`, `Pinia`, and `useAdminStore`.

- [ ] **Step 3: Implement shared API and auth store**

Create `frontend/packages/shared/src/api/admin.ts`:

```ts
import { del, get, post, put } from './request';
import type { PaginatedResult } from '../types';

export interface AdminLoginResponse {
  token: string;
  adminId: number;
  name: string;
  role: string;
}

export interface AdminDoctorListItem {
  id: number;
  name: string;
  title: string;
  department: string;
  phone: string;
  status: number;
  createTime: string;
}

export interface AdminDoctorDetail extends AdminDoctorListItem {
  username: string;
  introduction: string;
  consultationCount: number;
  recentSchedules: AdminDoctorSchedule[];
}

export interface AdminDoctorSchedule {
  id: number;
  doctorId: number;
  scheduleDate: string;
  startTime: string;
  endTime: string;
  status: number;
}

export interface AdminConsultationListItem {
  id: number;
  consultationNo: string;
  patientName: string;
  department: string;
  status: number;
  fee: number;
  paymentStatus: number;
  createTime: string;
}

export interface AdminDashboardData {
  consultationTotal: number;
  consultationByStatus: Record<string, number>;
  newThisMonth: number;
  newThisWeek: number;
  byDepartment: Record<string, number>;
  doctorWorkload: { doctorId: number; name: string; consultationCount: number }[];
  revenue: { total: number; paid: number; refunded: number };
  dailyTrend: { date: string; count: number }[];
}

export function adminLogin(username: string, password: string) {
  return post<AdminLoginResponse>('/admin/auth/login', { username, password });
}

export function getAdminDashboard() {
  return get<AdminDashboardData>('/admin/dashboard');
}

export function getAdminDoctors(params: { keyword?: string; page: number; size: number }) {
  return get<PaginatedResult<AdminDoctorListItem>>('/admin/doctors', { params });
}

export function createAdminDoctor(data: Record<string, unknown>) {
  return post('/admin/doctors', data);
}

export function updateAdminDoctor(id: number, data: Record<string, unknown>) {
  return put(`/admin/doctors/${id}`, data);
}

export function updateAdminDoctorStatus(id: number, status: number) {
  return put(`/admin/doctors/${id}/status`, { status });
}

export function getAdminDoctorDetail(id: number) {
  return get<AdminDoctorDetail>(`/admin/doctors/${id}`);
}

export function getAdminDoctorSchedules(id: number, date?: string) {
  return get<AdminDoctorSchedule[]>(`/admin/doctors/${id}/schedules`, { params: { date } });
}

export function createAdminDoctorSchedule(id: number, data: Record<string, unknown>) {
  return post(`/admin/doctors/${id}/schedules`, data);
}

export function updateAdminDoctorSchedule(id: number, scheduleId: number, data: Record<string, unknown>) {
  return put(`/admin/doctors/${id}/schedules/${scheduleId}`, data);
}

export function deleteAdminDoctorSchedule(id: number, scheduleId: number) {
  return del(`/admin/doctors/${id}/schedules/${scheduleId}`);
}

export function getAdminConsultations(params: { status?: number; keyword?: string; page: number; size: number }) {
  return get<PaginatedResult<AdminConsultationListItem>>('/admin/consultations', { params });
}

export function getAdminConsultationDetail(id: number) {
  return get(`/admin/consultations/${id}`);
}

export function cancelAdminConsultation(id: number, reason: string) {
  return put(`/admin/consultations/${id}/cancel`, { reason });
}
```

Export it from `frontend/packages/shared/src/index.ts`:

```ts
export * from './api/admin';
```

Update `frontend/packages/admin/package.json` dependencies:

```json
"pinia": "^2.2.2",
"@element-plus/icons-vue": "^2.3.1"
```

Update `frontend/packages/admin/src/main.ts`:

```ts
import { createPinia } from 'pinia';

const app = createApp(App);
app.use(createPinia());
app.use(router);
```

Create `frontend/packages/admin/src/stores/admin.ts`:

```ts
import { defineStore } from 'pinia';

export const useAdminStore = defineStore('admin', {
  state: () => ({
    adminId: Number(localStorage.getItem('adminId') || 0),
    name: localStorage.getItem('adminName') || '',
    role: localStorage.getItem('adminRole') || '',
  }),
  actions: {
    setAuth(payload: { adminId: number; name: string; role: string; token: string }) {
      this.adminId = payload.adminId;
      this.name = payload.name;
      this.role = payload.role;
      localStorage.setItem('token', payload.token);
      localStorage.setItem('adminId', String(payload.adminId));
      localStorage.setItem('adminName', payload.name);
      localStorage.setItem('adminRole', payload.role);
    },
    logout() {
      this.adminId = 0;
      this.name = '';
      this.role = '';
      localStorage.removeItem('token');
      localStorage.removeItem('adminId');
      localStorage.removeItem('adminName');
      localStorage.removeItem('adminRole');
    },
  },
});
```

- [ ] **Step 4: Implement login and route guard**

Replace `frontend/packages/admin/src/router/index.ts` with:

```ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import Login from '@/views/Login.vue';

const routes: RouteRecordRaw[] = [
  { path: '/login', name: 'Login', component: Login },
  {
    path: '/',
    component: () => import('@/layout/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'Dashboard', component: () => import('@/views/Dashboard.vue') },
      { path: 'doctors', name: 'Doctors', component: () => import('@/views/DoctorList.vue') },
      { path: 'doctors/:id', name: 'DoctorDetail', component: () => import('@/views/DoctorDetail.vue') },
      { path: 'consultations', name: 'Consultations', component: () => import('@/views/ConsultationList.vue') },
      { path: 'consultations/:id', name: 'ConsultationDetail', component: () => import('@/views/ConsultationDetail.vue') },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const token = localStorage.getItem('token');
  if (to.meta.requiresAuth && !token) {
    return '/login';
  }
  if (to.path === '/login' && token) {
    return '/';
  }
});

export default router;
```

Replace `Login.vue` script block with:

```ts
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { adminLogin } from '@aicall/shared';
import { useAdminStore } from '@/stores/admin';

const router = useRouter();
const adminStore = useAdminStore();
const form = reactive({ username: '', password: '' });
const loading = ref(false);

async function handleLogin() {
  loading.value = true;
  try {
    const res = await adminLogin(form.username, form.password);
    adminStore.setAuth({ token: res.token, adminId: res.adminId, name: res.name, role: res.role });
    ElMessage.success('登录成功');
    router.push('/');
  } catch (e: any) {
    ElMessage.error(e.message || '登录失败');
  } finally {
    loading.value = false;
  }
}
```

- [ ] **Step 5: Run verification**

Run: `pnpm -C frontend/packages/admin install`
Expected: installs new dependencies.

Run: `pnpm -C frontend/packages/admin build`
Expected: still FAIL because layout and page components do not exist yet, but shared API/store/login/guard errors are resolved.

- [ ] **Step 6: Commit**

```bash
git add frontend/packages/shared/src/api/admin.ts \
  frontend/packages/shared/src/index.ts \
  frontend/packages/admin/package.json \
  frontend/packages/admin/src/main.ts \
  frontend/packages/admin/src/stores/admin.ts \
  frontend/packages/admin/src/router/index.ts \
  frontend/packages/admin/src/views/Login.vue

git commit -m "feat: scaffold admin frontend auth"
```

### Task 7: Build admin layout, dashboard, and doctor pages

**Files:**
- Create: `frontend/packages/admin/src/layout/MainLayout.vue`
- Create: `frontend/packages/admin/src/views/Dashboard.vue`
- Create: `frontend/packages/admin/src/views/DoctorList.vue`
- Create: `frontend/packages/admin/src/views/DoctorDetail.vue`
- Test: `frontend/packages/admin/src/views/Dashboard.vue`

- [ ] **Step 1: Write the minimal page stubs to unblock routing**

Create placeholder components first:

```vue
<template><div>loading</div></template>
```

for `Dashboard.vue`, `DoctorList.vue`, and `DoctorDetail.vue`.

- [ ] **Step 2: Run the frontend build to verify the route tree compiles**

Run: `pnpm -C frontend/packages/admin build`
Expected: either PASS with placeholders or fail only on remaining consultation pages.

- [ ] **Step 3: Implement the layout and dashboard**

Create `MainLayout.vue`:

```vue
<template>
  <el-container style="min-height: 100vh">
    <el-aside width="220px">
      <div style="height: 60px; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 600;">
        AICall 管理端
      </div>
      <el-menu :default-active="route.path" router>
        <el-menu-item index="/">仪表盘</el-menu-item>
        <el-menu-item index="/doctors">医生管理</el-menu-item>
        <el-menu-item index="/consultations">会诊管理</el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header style="display: flex; justify-content: flex-end; align-items: center; gap: 12px;">
        <span>{{ adminStore.name }}</span>
        <el-button link type="danger" @click="logout">退出登录</el-button>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { useAdminStore } from '@/stores/admin';

const route = useRoute();
const router = useRouter();
const adminStore = useAdminStore();

function logout() {
  adminStore.logout();
  router.push('/login');
}
</script>
```

Create `Dashboard.vue` with `onMounted(loadData)` and `getAdminDashboard()`. Render:
- 4 `el-card` stats: `consultationTotal`, `newThisMonth`, `newThisWeek`, `revenue.paid`
- `div` refs for `departmentChartRef`, `statusChartRef`, `trendChartRef`
- `el-table` for `doctorWorkload`

Use this chart init pattern:

```ts
const chart = echarts.init(departmentChartRef.value!);
chart.setOption({
  tooltip: { trigger: 'item' },
  series: [{ type: 'pie', data: Object.entries(data.byDepartment).map(([name, value]) => ({ name, value })) }],
});
```

- [ ] **Step 4: Implement doctor pages**

Create `DoctorList.vue` with:
- search form: `keyword`
- `el-table` columns: `name`, `title`, `department`, `phone`, `status`, `createTime`
- pagination bound to `page`, `size`, `total`
- create/edit dialog with form fields matching backend DTOs
- status switch calling `updateAdminDoctorStatus`
- detail button routing to `/doctors/${row.id}`

Create `DoctorDetail.vue` with:
- `el-page-header`
- `el-descriptions` for doctor fields
- schedule filter by `date`
- schedule dialog using `scheduleDate`, `startTime`, `endTime`
- table backed by `getAdminDoctorSchedules`

Use this load pattern in `DoctorList.vue`:

```ts
async function loadData() {
  loading.value = true;
  try {
    const res = await getAdminDoctors({ keyword: keyword.value, page: page.value, size: size.value });
    list.value = res.list;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}
```

- [ ] **Step 5: Run verification**

Run: `pnpm -C frontend/packages/admin build`
Expected: FAIL only because consultation pages still do not exist, or PASS if you stub them too.

Run: `pnpm -C frontend/packages/admin dev`
Expected: local server starts on `http://localhost:3002`.

Manually verify in browser:
- login redirects to dashboard,
- sidebar navigation works,
- dashboard charts render,
- doctor create/edit/status/detail/schedule flows complete.

- [ ] **Step 6: Commit**

```bash
git add frontend/packages/admin/src/layout/MainLayout.vue \
  frontend/packages/admin/src/views/Dashboard.vue \
  frontend/packages/admin/src/views/DoctorList.vue \
  frontend/packages/admin/src/views/DoctorDetail.vue

git commit -m "feat: add admin dashboard and doctor pages"
```

### Task 8: Build consultation pages and finish end-to-end validation

**Files:**
- Create: `frontend/packages/admin/src/views/ConsultationList.vue`
- Create: `frontend/packages/admin/src/views/ConsultationDetail.vue`
- Modify: `frontend/packages/shared/src/api/admin.ts`
- Test: end-to-end manual verification in admin app

- [ ] **Step 1: Implement consultation list page**

Create `ConsultationList.vue` with:
- status tabs (`全部`, `已提交`, `专家确认中`, `已排期`, `待会诊`, `会诊中`, `已完成`, `已取消`, `已退回`)
- keyword search on patient name / consultation no
- `el-table` columns: `consultationNo`, `patientName`, `department`, `status`, `fee`, `paymentStatus`, `createTime`
- pagination and detail button

Use this status label map:

```ts
const consultationStatusMap: Record<number, string> = {
  0: '已提交',
  1: '资料审核中',
  2: '专家确认中',
  3: '已排期',
  4: '待会诊',
  5: '会诊中',
  6: '已完成',
  7: '已取消',
  8: '已退回',
};
```

- [ ] **Step 2: Implement consultation detail page**

Create `ConsultationDetail.vue` with:
- `el-page-header`
- `el-descriptions` for patient info and consultation fields
- assigned doctor display
- uploads table with `fileUrl` anchor
- report / QC / payment sections when data exists
- `取消会诊` button that opens `el-dialog` and calls `cancelAdminConsultation`

Use this cancel handler:

```ts
async function handleCancel() {
  if (!cancelReason.value) {
    ElMessage.warning('请输入取消原因');
    return;
  }
  actionLoading.value = true;
  try {
    await cancelAdminConsultation(id.value, cancelReason.value);
    ElMessage.success('会诊已取消');
    router.push('/consultations');
  } finally {
    actionLoading.value = false;
  }
}
```

- [ ] **Step 3: Run full frontend verification**

Run: `pnpm -C frontend/packages/admin build`
Expected: PASS.

Run: `pnpm -C frontend/packages/admin dev`
Expected: server starts on port 3002.

Manually verify in browser:
- `/login` uses `/admin/auth/login`
- dashboard loads cards + 3 charts + workload table
- doctor list search and pagination work
- doctor create/edit/status/detail/schedule work
- consultation list filters and search work
- consultation detail loads full data and cancel updates status
- logout returns to `/login`

- [ ] **Step 4: Run backend verification against frontend requirements**

Run: `mvn -f aicall-backend/pom.xml compile`
Expected: BUILD SUCCESS.

If any frontend request fails, fix the backend contract first instead of adding frontend workarounds.

- [ ] **Step 5: Commit**

```bash
git add frontend/packages/admin/src/views/ConsultationList.vue \
  frontend/packages/admin/src/views/ConsultationDetail.vue \
  frontend/packages/shared/src/api/admin.ts

git commit -m "feat: complete admin consultation pages"
```

### Task 9: Final integration pass

**Files:**
- Modify: any touched backend/frontend files required to fix integration mismatches discovered during verification
- Test: backend compile + admin frontend build + manual browser smoke test

- [ ] **Step 1: Run the full backend check**

Run: `mvn -f aicall-backend/pom.xml test`
Expected: PASS, including the new admin service/controller tests.

- [ ] **Step 2: Run the full admin frontend check**

Run: `pnpm -C frontend/packages/admin build`
Expected: PASS.

- [ ] **Step 3: Run manual smoke test in browser**

Run: `pnpm -C frontend/packages/admin dev`
Expected: server starts on `http://localhost:3002`.

Verify the golden path in browser:
1. Login as `admin / admin123`
2. Open dashboard and confirm all widgets render
3. Create a doctor without username and confirm auto-generated username is returned in detail
4. Edit the same doctor and toggle status
5. Add, edit, and delete a schedule for that doctor
6. Open consultation list, filter by status, search by patient name or consultation number
7. Open a consultation detail and cancel it with a reason
8. Refresh the detail and confirm status is `已取消`
9. Logout and confirm protected routes redirect to `/login`

- [ ] **Step 4: Commit final fixes**

```bash
git add aicall-backend/src/main/java/com/aicall/module/admin \
  aicall-backend/src/main/java/com/aicall/module/doctor \
  aicall-backend/src/main/java/com/aicall/module/consultation \
  aicall-backend/src/main/java/com/aicall/module/payment \
  aicall-backend/src/main/resources/mapper \
  frontend/packages/shared/src \
  frontend/packages/admin/src

git commit -m "feat: finish admin core flow"
```

---

## Self-review

### Spec coverage
- Admin auth: covered in Task 1 and Task 6.
- Doctor CRUD + scheduling: covered in Tasks 2, 3, and 7.
- Consultation list/detail/cancel: covered in Tasks 4 and 8.
- Dashboard aggregation + charts: covered in Tasks 5 and 7.
- Router/layout/logout: covered in Tasks 6 and 7.
- Pagination support: covered in Task 1, Task 2, Task 4, and frontend page tasks.

### Placeholder scan
- No `TODO`, `TBD`, or “similar to task N” placeholders remain.
- All new DTOs, service methods, and route paths are named explicitly.
- Every task includes concrete commands.

### Type consistency
- Backend auth response uses `AdminLoginResponse` consistently.
- Shared frontend API uses `PaginatedResult<T>` and backend uses `PageResult<T>` with the same JSON shape (`list`, `total`, `page`, `size`).
- Doctor schedule types use `scheduleDate`, `startTime`, `endTime` consistently across backend and frontend.

Plan complete and saved to `docs/superpowers/plans/2026-05-24-admin-core-flow.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
