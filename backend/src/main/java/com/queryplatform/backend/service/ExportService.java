package com.queryplatform.backend.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.queryplatform.backend.entity.Query;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ExportService {

    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public byte[] exportToExcel(List<Query> queries) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Queries Report");

            // Define styles
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            // Create headers
            Row headerRow = sheet.createRow(0);
            String[] columns = {"Query Number", "Date Raised", "Subject", "Status", "Critical", "Created By", "Assigned SME", "Flags", "Question"};
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            // Fill data rows
            int rowIdx = 1;
            for (Query q : queries) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(q.getQueryNumber());
                row.createCell(1).setCellValue(q.getDateRaised() != null ? q.getDateRaised().format(formatter) : "");
                row.createCell(2).setCellValue(q.getSubject());
                row.createCell(3).setCellValue(q.getStatus() != null ? q.getStatus().name() : "");
                row.createCell(4).setCellValue(q.getCriticalFlag() != null && q.getCriticalFlag() ? "Yes" : "No");
                row.createCell(5).setCellValue(q.getCreatedBy() != null ? q.getCreatedBy().getEmail() : "");
                row.createCell(6).setCellValue(q.getAssignedSme() != null ? q.getAssignedSme().getEmail() : "Unassigned");
                row.createCell(7).setCellValue(q.getFlags() != null ? String.join(", ", q.getFlags()) : "");
                row.createCell(8).setCellValue(q.getQuestion() != null ? q.getQuestion() : "");
            }

            // Auto-size columns
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    public byte[] exportToPdf(List<Query> queries) throws DocumentException {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4.rotate());
            PdfWriter.getInstance(document, out);
            document.open();

            // Font configurations
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.BLACK);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
            Font cellFont = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.BLACK);

            // Title
            Paragraph title = new Paragraph("Query Management System - Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Create table: 8 columns (exclude question to save space in horizontal layouts)
            PdfPTable table = new PdfPTable(8);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1.5f, 2f, 3f, 1.2f, 1f, 2.5f, 2.5f, 2f});

            // Table Headers
            String[] columns = {"Query No.", "Date Raised", "Subject", "Status", "Critical", "Created By", "Assigned SME", "Flags"};
            for (String column : columns) {
                PdfPCell cell = new PdfPCell(new Phrase(column, headerFont));
                cell.setBackgroundColor(new Color(0, 51, 102));
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setPadding(6);
                table.addCell(cell);
            }

            // Fill Table Data
            for (Query q : queries) {
                table.addCell(new PdfPCell(new Phrase(q.getQueryNumber(), cellFont)));
                table.addCell(new PdfPCell(new Phrase(q.getDateRaised() != null ? q.getDateRaised().format(formatter) : "", cellFont)));
                table.addCell(new PdfPCell(new Phrase(q.getSubject(), cellFont)));
                table.addCell(new PdfPCell(new Phrase(q.getStatus() != null ? q.getStatus().name() : "", cellFont)));
                table.addCell(new PdfPCell(new Phrase(q.getCriticalFlag() != null && q.getCriticalFlag() ? "Yes" : "No", cellFont)));
                table.addCell(new PdfPCell(new Phrase(q.getCreatedBy() != null ? q.getCreatedBy().getEmail() : "", cellFont)));
                table.addCell(new PdfPCell(new Phrase(q.getAssignedSme() != null ? q.getAssignedSme().getEmail() : "Unassigned", cellFont)));
                table.addCell(new PdfPCell(new Phrase(q.getFlags() != null ? String.join(", ", q.getFlags()) : "", cellFont)));
            }

            document.add(table);
            document.close();
            return out.toByteArray();
        } catch (IOException e) {
            throw new DocumentException(e.getMessage());
        }
    }
}
