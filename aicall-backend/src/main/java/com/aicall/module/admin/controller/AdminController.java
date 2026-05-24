package com.aicall.module.admin.controller;

import com.aicall.common.result.Result;
import com.aicall.module.admin.dto.AdminDashboardVO;
import com.aicall.module.admin.dto.LoginRequest;
import com.aicall.module.admin.dto.LoginResponse;
import com.aicall.module.admin.service.AdminDashboardService;
import com.aicall.module.admin.service.AdminService;
import com.aicall.module.admin.service.ExcelExportService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;
    private final AdminDashboardService adminDashboardService;
    private final ExcelExportService excelExportService;

    @PostMapping("/login")
    public Result<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return Result.success(adminService.login(request));
    }

    @GetMapping("/dashboard")
    public Result<AdminDashboardVO> dashboard() {
        return Result.success(adminDashboardService.getDashboard());
    }

    @GetMapping("/dashboard/export")
    public void exportDashboard(HttpServletResponse response) throws IOException {
        AdminDashboardVO data = adminDashboardService.getDashboard();
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        String filename = URLEncoder.encode("数据报表.xlsx", StandardCharsets.UTF_8);
        response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");
        excelExportService.exportDashboard(data, response.getOutputStream());
    }
}
