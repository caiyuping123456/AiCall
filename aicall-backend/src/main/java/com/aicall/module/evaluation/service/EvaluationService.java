package com.aicall.module.evaluation.service;

import com.aicall.common.exception.BusinessException;
import com.aicall.module.consultation.entity.Consultation;
import com.aicall.module.consultation.mapper.ConsultationMapper;
import com.aicall.module.evaluation.dto.EvaluationVO;
import com.aicall.module.evaluation.dto.SubmitEvaluationRequest;
import com.aicall.module.evaluation.entity.Evaluation;
import com.aicall.module.evaluation.mapper.EvaluationMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EvaluationService {
    private final EvaluationMapper evaluationMapper;
    private final ConsultationMapper consultationMapper;

    @Transactional
    public void createEvaluation(Long consultationId) {
        Consultation c = consultationMapper.findById(consultationId);
        if (c == null) return;
        Evaluation e = new Evaluation();
        e.setConsultationId(consultationId);
        e.setPatientId(c.getPatientId());
        evaluationMapper.insert(e);
    }

    public EvaluationVO getByConsultation(Long consultationId) {
        Evaluation e = evaluationMapper.findByConsultationId(consultationId);
        return e != null ? toVO(e) : null;
    }

    public List<EvaluationVO> getPendingByPatient(Long patientId) {
        return evaluationMapper.findPendingByPatientId(patientId).stream()
                .map(this::toVO).collect(Collectors.toList());
    }

    @Transactional
    public void submitEvaluation(Long consultationId, Long patientId, SubmitEvaluationRequest request) {
        Evaluation e = evaluationMapper.findByConsultationId(consultationId);
        if (e == null) throw BusinessException.fail("评价记录不存在");
        if (!e.getPatientId().equals(patientId)) throw BusinessException.fail("无权操作");
        if (e.getDoctorScore() != null) throw BusinessException.fail("已评价");
        evaluationMapper.updateScore(e.getId(), request.getDoctorScore(),
                request.getServiceScore(), request.getComment());
    }

    private EvaluationVO toVO(Evaluation e) {
        EvaluationVO vo = new EvaluationVO();
        vo.setId(e.getId());
        vo.setConsultationId(e.getConsultationId());
        vo.setDoctorScore(e.getDoctorScore());
        vo.setServiceScore(e.getServiceScore());
        vo.setComment(e.getComment());
        vo.setCreateTime(e.getCreateTime());
        vo.setConsultationNo(e.getConsultationNo());
        return vo;
    }
}
