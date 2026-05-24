package com.aicall.module.knowledge.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.InputStream;

@Slf4j
@Service
public class TextParserService {

    public String parseText(InputStream inputStream, String fileName) {
        if (fileName == null) {
            return "";
        }

        try {
            byte[] bytes = inputStream.readAllBytes();
            String lowerName = fileName.toLowerCase();

            if (lowerName.endsWith(".txt") || lowerName.endsWith(".md")) {
                return new String(bytes, "UTF-8");
            }

            if (lowerName.endsWith(".pdf")) {
                return parsePdf(bytes);
            }

            log.warn("Unsupported file type: {}", fileName);
            return "";
        } catch (Exception e) {
            log.error("Failed to parse file: {}", fileName, e);
            return "";
        }
    }

    private String parsePdf(byte[] bytes) {
        try {
            var document = org.apache.pdfbox.Loader.loadPDF(bytes);
            var stripper = new org.apache.pdfbox.text.PDFTextStripper();
            stripper.setSortByPosition(true);
            String text = stripper.getText(document);
            document.close();
            return text;
        } catch (Exception e) {
            log.error("Failed to extract text from PDF", e);
            return "";
        }
    }
}
