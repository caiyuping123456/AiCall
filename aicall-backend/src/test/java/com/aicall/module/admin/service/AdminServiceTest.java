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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

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
