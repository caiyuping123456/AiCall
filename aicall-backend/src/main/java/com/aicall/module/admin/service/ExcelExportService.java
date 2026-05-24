package com.aicall.module.admin.service;

import com.aicall.module.admin.dto.AdminDashboardVO;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.OutputStream;
import java.math.BigDecimal;
import java.util.Map;

@Service
public class ExcelExportService {

    public void exportDashboard(AdminDashboardVO data, OutputStream outputStream) {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            createOverviewSheet(workbook, headerStyle, data);
            createDepartmentSheet(workbook, headerStyle, data);
            createStatusSheet(workbook, headerStyle, data);
            createTrendSheet(workbook, headerStyle, data);
            createDoctorSheet(workbook, headerStyle, data);

            workbook.write(outputStream);
        } catch (Exception e) {
            throw new RuntimeException("导出Excel失败", e);
        }
    }

    private void createOverviewSheet(Workbook workbook, CellStyle headerStyle, AdminDashboardVO data) {
        Sheet sheet = workbook.createSheet("概览");
        String[][] rows = {
                {"会诊总数", String.valueOf(data.getConsultationTotal())},
                {"本月新增", String.valueOf(data.getNewThisMonth())},
                {"本周新增", String.valueOf(data.getNewThisWeek())},
                {"已收金额", data.getRevenue().getPaid().toString()},
                {"退款金额", data.getRevenue().getRefunded().toString()},
        };
        int rowIdx = 0;
        Row header = sheet.createRow(rowIdx++);
        Cell h1 = header.createCell(0); h1.setCellValue("指标"); h1.setCellStyle(headerStyle);
        Cell h2 = header.createCell(1); h2.setCellValue("数值"); h2.setCellStyle(headerStyle);
        for (String[] row : rows) {
            Row r = sheet.createRow(rowIdx++);
            r.createCell(0).setCellValue(row[0]);
            r.createCell(1).setCellValue(row[1]);
        }
        sheet.autoSizeColumn(0);
        sheet.autoSizeColumn(1);
    }

    private void createDepartmentSheet(Workbook workbook, CellStyle headerStyle, AdminDashboardVO data) {
        Sheet sheet = workbook.createSheet("科室分布");
        Row header = sheet.createRow(0);
        Cell h1 = header.createCell(0); h1.setCellValue("科室"); h1.setCellStyle(headerStyle);
        Cell h2 = header.createCell(1); h2.setCellValue("会诊数"); h2.setCellStyle(headerStyle);
        int rowIdx = 1;
        for (Map.Entry<String, Long> entry : data.getByDepartment().entrySet()) {
            Row r = sheet.createRow(rowIdx++);
            r.createCell(0).setCellValue(entry.getKey());
            r.createCell(1).setCellValue(entry.getValue());
        }
        sheet.autoSizeColumn(0);
        sheet.autoSizeColumn(1);
    }

    private void createStatusSheet(Workbook workbook, CellStyle headerStyle, AdminDashboardVO data) {
        Sheet sheet = workbook.createSheet("状态分布");
        Row header = sheet.createRow(0);
        Cell h1 = header.createCell(0); h1.setCellValue("状态"); h1.setCellStyle(headerStyle);
        Cell h2 = header.createCell(1); h2.setCellValue("数量"); h2.setCellStyle(headerStyle);
        String[] statusNames = {"已提交", "资料审核中", "专家确认中", "已排期", "待会诊", "会诊中", "已完成", "已取消", "已退回"};
        int rowIdx = 1;
        for (Map.Entry<String, Long> entry : data.getConsultationByStatus().entrySet()) {
            int s = Integer.parseInt(entry.getKey());
            Row r = sheet.createRow(rowIdx++);
            r.createCell(0).setCellValue(s >= 0 && s < statusNames.length ? statusNames[s] : "未知");
            r.createCell(1).setCellValue(entry.getValue());
        }
        sheet.autoSizeColumn(0);
        sheet.autoSizeColumn(1);
    }

    private void createTrendSheet(Workbook workbook, CellStyle headerStyle, AdminDashboardVO data) {
        Sheet sheet = workbook.createSheet("近30天趋势");
        Row header = sheet.createRow(0);
        Cell h1 = header.createCell(0); h1.setCellValue("日期"); h1.setCellStyle(headerStyle);
        Cell h2 = header.createCell(1); h2.setCellValue("会诊数"); h2.setCellStyle(headerStyle);
        Cell h3 = header.createCell(2); h3.setCellValue("收入"); h3.setCellStyle(headerStyle);
        int rowIdx = 1;
        for (int i = 0; i < data.getDailyTrend().size(); i++) {
            Row r = sheet.createRow(rowIdx++);
            r.createCell(0).setCellValue(data.getDailyTrend().get(i).getDate());
            r.createCell(1).setCellValue(data.getDailyTrend().get(i).getCount());
            BigDecimal amt = i < data.getDailyRevenue().size() ? data.getDailyRevenue().get(i).getAmount() : BigDecimal.ZERO;
            r.createCell(2).setCellValue(amt.doubleValue());
        }
        sheet.autoSizeColumn(0);
        sheet.autoSizeColumn(1);
        sheet.autoSizeColumn(2);
    }

    private void createDoctorSheet(Workbook workbook, CellStyle headerStyle, AdminDashboardVO data) {
        Sheet sheet = workbook.createSheet("医生工作量");
        Row header = sheet.createRow(0);
        Cell h1 = header.createCell(0); h1.setCellValue("医生"); h1.setCellStyle(headerStyle);
        Cell h2 = header.createCell(1); h2.setCellValue("会诊数"); h2.setCellStyle(headerStyle);
        int rowIdx = 1;
        for (var item : data.getDoctorWorkload()) {
            Row r = sheet.createRow(rowIdx++);
            r.createCell(0).setCellValue(item.getName());
            r.createCell(1).setCellValue(item.getConsultationCount());
        }
        sheet.autoSizeColumn(0);
        sheet.autoSizeColumn(1);
    }
}
