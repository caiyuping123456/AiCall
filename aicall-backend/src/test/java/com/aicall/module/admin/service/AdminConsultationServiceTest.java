package com.aicall.module.admin.service;

import com.aicall.module.consultation.entity.Consultation;
import com.aicall.module.consultation.mapper.ConsultationDoctorMapper;
import com.aicall.module.consultation.mapper.ConsultationMapper;
import com.aicall.module.consultation.mapper.ConsultationUploadMapper;
import com.aicall.module.doctor.mapper.DoctorMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminConsultationServiceTest {

    @Mock
    private ConsultationMapper consultationMapper;
    @Mock
    private ConsultationDoctorMapper consultationDoctorMapper;
    @Mock
    private ConsultationUploadMapper uploadMapper;
    @Mock
    private DoctorMapper doctorMapper;
    @InjectMocks
    private AdminConsultationService adminConsultationService;

    @Test
    void cancelConsultationSetsStatusSevenAndReason() {
        Consultation c = new Consultation();
        c.setId(1L);
        c.setStatus(2);
        when(consultationMapper.findById(1L)).thenReturn(c);

        adminConsultationService.cancelConsultation(1L, "管理员取消");
        verify(consultationMapper).updateCancel(1L, 7, "管理员取消");
    }
}