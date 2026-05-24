package com.aicall.module.admin.controller;

import com.aicall.infrastructure.security.JwtAuthenticationFilter;
import com.aicall.module.admin.service.AdminDoctorService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminDoctorController.class)
@AutoConfigureMockMvc(addFilters = false)
class AdminDoctorControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @MockBean
    private AdminDoctorService adminDoctorService;
    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

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
