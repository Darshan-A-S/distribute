package com.sender.service;

import com.sender.dto.ExcelPreview;
import com.sender.model.Recipient;
import com.sender.repository.RecipientRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ExcelService {

    private final RecipientRepository recipientRepo;

    public ExcelPreview parseExcel(MultipartFile file) {
        try (InputStream is = file.getInputStream(); Workbook wb = new XSSFWorkbook(is)) {
            Sheet sheet = wb.getSheetAt(0);
            Row headerRow = sheet.getRow(0);
            if (headerRow == null) throw new RuntimeException("Excel has no header row");

            List<String> headers = new ArrayList<>();
            for (int i = 0; i < headerRow.getLastCellNum(); i++) {
                Cell cell = headerRow.getCell(i, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
                headers.add(cellToString(cell).trim());
            }

            List<Map<String, String>> rows = new ArrayList<>();
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                Map<String, String> rowData = new LinkedHashMap<>();
                for (int j = 0; j < headers.size(); j++) {
                    Cell cell = row.getCell(j, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
                    rowData.put(headers.get(j), cellToString(cell).trim());
                }
                if (rowData.values().stream().noneMatch(String::isEmpty)) {
                    rows.add(rowData);
                }
            }

            ExcelPreview preview = new ExcelPreview();
            preview.setHeaders(headers);
            preview.setRows(rows);
            preview.setTotalRows(rows.size());
            return preview;
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Excel: " + e.getMessage(), e);
        }
    }

    public List<Recipient> saveRecipients(MultipartFile file, String batchName, Map<String, String> columnMapping, Long ownerId) {
        try (InputStream is = file.getInputStream(); Workbook wb = new XSSFWorkbook(is)) {
            Sheet sheet = wb.getSheetAt(0);
            Row headerRow = sheet.getRow(0);

            List<String> headers = new ArrayList<>();
            for (int i = 0; i < headerRow.getLastCellNum(); i++) {
                Cell cell = headerRow.getCell(i, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
                headers.add(cellToString(cell).trim());
            }

            // Find which columns map to "name" and "email"
            int nameCol = -1, emailCol = -1;
            Map<Integer, String> varColumns = new HashMap<>();

            for (Map.Entry<String, String> entry : columnMapping.entrySet()) {
                String templateVar = entry.getKey(); // e.g. "name", "email", "org"
                String excelCol = entry.getValue();  // e.g. "Name", "Email Address"
                int colIdx = headers.indexOf(excelCol);
                if (colIdx == -1) continue;

                if ("name".equalsIgnoreCase(templateVar)) nameCol = colIdx;
                else if ("email".equalsIgnoreCase(templateVar)) emailCol = colIdx;
                else varColumns.put(colIdx, templateVar);
            }

            if (nameCol == -1 || emailCol == -1) {
                throw new RuntimeException("Must map 'name' and 'email' columns");
            }

            List<Recipient> recipients = new ArrayList<>();
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                String name = cellToString(row.getCell(nameCol, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK)).trim();
                String email = cellToString(row.getCell(emailCol, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK)).trim();
                if (name.isEmpty() || email.isEmpty()) continue;

                // Build variables JSON
                Map<String, String> vars = new LinkedHashMap<>();
                vars.put("name", name);
                for (Map.Entry<Integer, String> vc : varColumns.entrySet()) {
                    vars.put(vc.getValue(), cellToString(row.getCell(vc.getKey(), Row.MissingCellPolicy.CREATE_NULL_AS_BLANK)).trim());
                }

                recipients.add(Recipient.builder()
                        .ownerId(ownerId)
                        .name(name)
                        .email(email)
                        .variablesJson(mapToJson(vars))
                        .uploadBatch(batchName)
                        .build());
            }

            return recipientRepo.saveAll(recipients);
        } catch (Exception e) {
            throw new RuntimeException("Failed to save recipients: " + e.getMessage(), e);
        }
    }

    public List<Recipient> getRecipients(String batchName, Long ownerId) {
        return recipientRepo.findByOwnerIdAndUploadBatch(ownerId, batchName);
    }

    public List<Map<String, Object>> getBatches(Long ownerId) {
        List<Map<String, Object>> batches = new ArrayList<>();
        for (String name : recipientRepo.findDistinctBatchesByOwnerId(ownerId)) {
            batches.add(Map.of(
                    "batch", name,
                    "total", recipientRepo.countByOwnerIdAndUploadBatch(ownerId, name),
                    "sent", recipientRepo.countByOwnerIdAndUploadBatchAndSentTrue(ownerId, name),
                    "pending", recipientRepo.countByOwnerIdAndUploadBatchAndSentFalse(ownerId, name)
            ));
        }
        return batches;
    }

    public long[] getBatchStats(String batchName, Long ownerId) {
        return new long[]{
                recipientRepo.countByOwnerIdAndUploadBatchAndSentTrue(ownerId, batchName),
                recipientRepo.countByOwnerIdAndUploadBatchAndSentFalse(ownerId, batchName)
        };
    }

    public void deleteBatch(String batchName, Long ownerId) {
        recipientRepo.deleteByOwnerIdAndUploadBatch(ownerId, batchName);
    }

    @Transactional
    public int resetBatch(String batchName, Long ownerId) {
        return recipientRepo.resetBatch(ownerId, batchName);
    }

    private String cellToString(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> {
                double v = cell.getNumericCellValue();
                yield v == Math.floor(v) && !Double.isInfinite(v) ? String.valueOf((long) v) : String.valueOf(v);
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> cell.getCellFormula();
            default -> "";
        };
    }

    private String mapToJson(Map<String, String> map) {
        StringBuilder sb = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, String> e : map.entrySet()) {
            if (!first) sb.append(",");
            sb.append("\"").append(escape(e.getKey())).append("\":\"").append(escape(e.getValue())).append("\"");
            first = false;
        }
        return sb.append("}").toString();
    }

    private String escape(String s) {
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
