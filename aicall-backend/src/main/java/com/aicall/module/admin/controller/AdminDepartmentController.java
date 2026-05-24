package com.aicall.module.admin.controller;

import com.aicall.common.result.Result;
import com.aicall.module.admin.dto.DepartmentCreateRequest;
import com.aicall.module.admin.dto.DepartmentUpdateRequest;
import com.aicall.module.admin.dto.DepartmentVO;
import com.aicall.module.admin.service.DepartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/departments")
@RequiredArgsConstructor
public class AdminDepartmentController {
    private final DepartmentService departmentService;

    @GetMapping
    public Result<List<DepartmentVO>> list() {
        return Result.success(departmentService.list());
    }

    @PostMapping
    public Result<DepartmentVO> create(@Valid @RequestBody DepartmentCreateRequest request) {
        return Result.success(departmentService.create(request));
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody DepartmentUpdateRequest request) {
        departmentService.update(id, request);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        departmentService.delete(id);
        return Result.success();
    }
}
