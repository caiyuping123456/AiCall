package com.aicall.module.knowledge.mapper;

import com.aicall.module.knowledge.entity.MedicalDocument;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface MedicalDocumentMapper {
    int insert(MedicalDocument document);

    MedicalDocument findById(Long id);

    List<MedicalDocument> findAll();

    int deleteById(Long id);
}
