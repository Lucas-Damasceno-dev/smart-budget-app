package com.financeflow.service;

import com.financeflow.dto.imports.ImportConfirmRequest;
import com.financeflow.dto.imports.ImportHistoryResponse;
import com.financeflow.dto.imports.ImportLogResponse;
import com.financeflow.dto.imports.ImportPreviewResponse;
import com.financeflow.dto.imports.ImportPreviewResponse.ImportRowDto;
import com.financeflow.entity.*;
import com.financeflow.exception.BadRequestException;
import com.financeflow.exception.ResourceNotFoundException;
import com.financeflow.repository.*;
import com.opencsv.CSVReader;
import com.opencsv.CSVReaderBuilder;
import com.opencsv.CSVParserBuilder;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.text.ParsePosition;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImportService {

    private final ImportLogRepository importLogRepo;
    private final TransactionRepository transactionRepo;
    private final AccountRepository accountRepo;
    private final CategoryRepository categoryRepo;
    private final UserRepository userRepository;
    private final AccountService accountService;
    private final AutomationRuleService automationRuleService;
    private final NotificationService notificationService;

    private final Map<UUID, List<ImportRowDto>> previewCache = new ConcurrentHashMap<>();

    private static final List<String> CSV_DATE_NAMES = List.of("data", "date", "dt", "data_lancamento", "data lançamento");
    private static final List<String> CSV_DESC_NAMES = List.of("descricao", "descrição", "description", "historico",
            "histórico", "lancamento", "lançamento", "nome", "name", "histórico do lançamento");
    private static final List<String> CSV_AMOUNT_NAMES = List.of("valor", "amount", "valor_lancamento", "vlr", "vl_lancamento", "valor do lançamento");
    private static final List<String> CSV_FITID_NAMES = List.of("fitid", "id", "id_transacao", "codigo", "identificador");

    private static final DateTimeFormatter[] DATE_FORMATTERS = {
            DateTimeFormatter.ofPattern("yyyy-MM-dd"),
            DateTimeFormatter.ofPattern("dd/MM/yyyy"),
            DateTimeFormatter.ofPattern("dd/MM/yy"),
            DateTimeFormatter.ofPattern("yyyyMMdd"),
            DateTimeFormatter.ofPattern("dd-MM-yyyy"),
            DateTimeFormatter.ofPattern("MM/dd/yyyy"),
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"),
            DateTimeFormatter.ofPattern("yyyyMMddHHmmss")
    };

    @Transactional
    public ImportPreviewResponse previewImport(MultipartFile file, UUID accountId, UUID userId) {
        Account account = accountRepo.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        String fileName = file.getOriginalFilename();
        if (fileName == null || fileName.isBlank()) {
            throw new BadRequestException("File name is required");
        }

        String fileType = detectFileType(fileName);
        if (fileType == null) {
            throw new BadRequestException("Unsupported file format. Supported: CSV, OFX, QFX, OFC");
        }

        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }

        if (file.getSize() > 10 * 1024 * 1024) {
            throw new BadRequestException("File size exceeds maximum of 10MB");
        }

        List<ImportRowDto> rows;
        String rawContent;

        try {
            byte[] bytes = file.getBytes();
            rawContent = new String(bytes, "UTF-8");

            if ("CSV".equals(fileType)) {
                rows = parseCsv(bytes);
            } else {
                rows = parseOfx(rawContent);
            }
        } catch (IOException e) {
            throw new BadRequestException("Failed to read file: " + e.getMessage());
        } catch (com.opencsv.exceptions.CsvException e) {
            throw new BadRequestException("Failed to parse CSV file: " + e.getMessage());
        }

        if (rows.isEmpty()) {
            throw new BadRequestException("No valid transaction rows found in file");
        }

        // Detect duplicates
        int duplicateCount = 0;
        for (ImportRowDto row : rows) {
            if (isDuplicate(row, accountId)) {
                row.setDuplicate(true);
                duplicateCount++;
            }
        }

        // Create ImportLog
        ImportLog importLog = ImportLog.builder()
                .fileName(fileName)
                .fileType(fileType)
                .accountId(accountId)
                .status("PREVIEWED")
                .totalRows(rows.size())
                .duplicateCount(duplicateCount)
                .userId(userId)
                .build();
        importLog = importLogRepo.save(importLog);

        // Store in cache for confirmation step
        previewCache.put(importLog.getId(), rows);

        return ImportPreviewResponse.builder()
                .importLogId(importLog.getId())
                .fileName(fileName)
                .fileType(fileType)
                .accountId(accountId)
                .accountName(account.getName())
                .totalRows(rows.size())
                .duplicateCount(duplicateCount)
                .rows(rows)
                .build();
    }

    @Transactional
    public ImportLogResponse confirmImport(ImportConfirmRequest request, UUID userId) {
        ImportLog importLog = importLogRepo.findByIdAndUserId(request.getImportLogId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Import log not found"));

        if (!"PREVIEWED".equals(importLog.getStatus())) {
            throw new BadRequestException("Import is not in PREVIEWED status");
        }

        List<ImportRowDto> rows = previewCache.remove(request.getImportLogId());
        if (rows == null) {
            throw new BadRequestException("Import preview data expired. Please preview again.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Account account = accountRepo.findById(importLog.getAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        int importedCount = 0;
        int duplicateSkipped = 0;
        int errorCount = 0;
        StringBuilder errorDetails = new StringBuilder();

        Map<Integer, UUID> categoryOverrides = request.getCategoryOverrides();
        if (categoryOverrides == null) {
            categoryOverrides = Collections.emptyMap();
        }

        for (int i = 0; i < rows.size(); i++) {
            ImportRowDto row = rows.get(i);

            try {
                if (request.isSkipDuplicates() && row.isDuplicate()) {
                    duplicateSkipped++;
                    continue;
                }

                LocalDate date = parseDate(row.getDate());
                if (date == null) {
                    errorCount++;
                    errorDetails.append("Row ").append(i + 1).append(": invalid date '").append(row.getDate()).append("'\n");
                    continue;
                }

                BigDecimal amount = row.getAmount();
                if (amount == null || amount.compareTo(BigDecimal.ZERO) == 0) {
                    errorCount++;
                    errorDetails.append("Row ").append(i + 1).append(": invalid or zero amount\n");
                    continue;
                }

                Category.TransactionType type = amount.compareTo(BigDecimal.ZERO) < 0
                        ? Category.TransactionType.EXPENSE
                        : Category.TransactionType.INCOME;
                BigDecimal absAmount = amount.abs();

                // Resolve category
                UUID categoryId = categoryOverrides.get(i);
                Category category = null;
                if (categoryId != null) {
                    category = categoryRepo.findById(categoryId).orElse(null);
                }
                if (category == null) {
                    // Auto-detect: look for matching automation rules first (suggestion)
                    String suggestedCat = row.getSuggestedCategory();
                    if (suggestedCat != null && !suggestedCat.isBlank()) {
                        category = categoryRepo.findByUserIdAndNameAndType(userId, suggestedCat, type)
                                .orElse(null);
                    }
                }
                if (category == null) {
                    // Fallback: find or create a default category for this type
                    category = getOrCreateDefaultCategory(userId, type, user);
                }

                String description = row.getDescription() != null ? row.getDescription().trim() : "Importação";

                // Build transaction directly (bypassing TransactionService to avoid @NotNull category constraint issues)
                Transaction transaction = Transaction.builder()
                        .description(description)
                        .amount(absAmount)
                        .date(date)
                        .type(type)
                        .status(Transaction.TransactionStatus.COMPLETED)
                        .account(account)
                        .category(category)
                        .user(user)
                        .build();

                transaction = transactionRepo.save(transaction);

                // Update account balance
                boolean isCredit = type == Category.TransactionType.INCOME;
                accountService.updateBalance(account.getId(), absAmount, isCredit);

                // Apply automation rules
                if (automationRuleService != null) {
                    automationRuleService.applyRulesToTransaction(transaction);
                }

                importedCount++;
            } catch (Exception e) {
                errorCount++;
                errorDetails.append("Row ").append(i + 1).append(": ").append(e.getMessage()).append("\n");
                log.error("Error importing row {}: {}", i + 1, e.getMessage());
            }
        }

        // Update import log
        importLog.setStatus("CONFIRMED");
        importLog.setImportedCount(importedCount);
        importLog.setDuplicateCount(duplicateSkipped);
        importLog.setErrorCount(errorCount);
        importLog.setErrorDetails(errorDetails.length() > 0 ? errorDetails.toString() : null);
        importLogRepo.save(importLog);

        // Clean up cache for this import
        previewCache.remove(request.getImportLogId());

        // Notify user
        if (importedCount > 0) {
            notificationService.createNotification(
                    userId,
                    "Importação concluída",
                    String.format("%d transações importadas de %s", importedCount, importLog.getFileName()),
                    Notification.NotificationType.SYSTEM
            );
        }

        return toResponse(importLog, account.getName());
    }

    public ImportHistoryResponse getHistory(UUID userId) {
        List<ImportLog> logs = importLogRepo.findByUserIdOrderByCreatedAtDesc(userId);
        List<ImportLogResponse> responses = logs.stream()
                .map(log -> {
                    String accountName = accountRepo.findById(log.getAccountId())
                            .map(Account::getName)
                            .orElse(null);
                    return toResponse(log, accountName);
                })
                .toList();

        int totalImported = logs.stream()
                .filter(l -> l.getImportedCount() != null)
                .mapToInt(ImportLog::getImportedCount)
                .sum();

        int totalDuplicates = logs.stream()
                .filter(l -> l.getDuplicateCount() != null)
                .mapToInt(ImportLog::getDuplicateCount)
                .sum();

        return ImportHistoryResponse.builder()
                .imports(responses)
                .totalImported(totalImported)
                .totalDuplicates(totalDuplicates)
                .build();
    }

    public List<ImportLogResponse> getRecentImports(UUID userId) {
        return importLogRepo.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .limit(20)
                .map(log -> {
                    String accountName = accountRepo.findById(log.getAccountId())
                            .map(Account::getName)
                            .orElse(null);
                    return toResponse(log, accountName);
                })
                .toList();
    }

    // ========== CSV PARSING ==========

    private List<ImportRowDto> parseCsv(byte[] content) throws IOException, com.opencsv.exceptions.CsvException {
        // Strip BOM if present
        String raw = new String(content, "UTF-8");
        if (raw.startsWith("\uFEFF")) {
            raw = raw.substring(1);
        }

        // Detect delimiter: check first line for semicolons vs commas
        String firstLine = raw.split("\n")[0].trim();
        char delimiter = firstLine.contains(";") ? ';' : ',';

        List<ImportRowDto> rows = new ArrayList<>();
        var parser = new CSVParserBuilder()
                .withSeparator(delimiter)
                .withQuoteChar('"')
                .withEscapeChar('\\')
                .build();
        try (CSVReader reader = new CSVReaderBuilder(new StringReader(raw))
                .withSkipLines(0)
                .withCSVParser(parser)
                .build()) {
            List<String[]> allLines = reader.readAll();
            if (allLines.isEmpty()) return rows;

            // Auto-detect header and column mapping
            String[] header = allLines.get(0);
            int colDate = -1, colDesc = -1, colAmount = -1, colFitId = -1;
            boolean hasHeader = false;

            for (int i = 0; i < header.length; i++) {
                String col = header[i].toLowerCase().trim().replaceAll("[^a-z0-9_áéíóúãõç]", "");
                if (CSV_DATE_NAMES.contains(col)) { colDate = i; hasHeader = true; }
                if (CSV_DESC_NAMES.contains(col)) { colDesc = i; hasHeader = true; }
                if (CSV_AMOUNT_NAMES.contains(col)) { colAmount = i; hasHeader = true; }
                if (CSV_FITID_NAMES.contains(col)) { colFitId = i; hasHeader = true; }
            }

            int startRow = hasHeader ? 1 : 0;
            if (!hasHeader && header.length >= 3) {
                // Positional: assume 0=date, 1=desc, 2=amount
                colDate = 0;
                colDesc = 1;
                colAmount = 2;
            }

            for (int i = startRow; i < allLines.size(); i++) {
                String[] row = allLines.get(i);
                if (row.length == 0) continue;
                if (row.length == 1 && row[0].trim().isEmpty()) continue;

                String dateStr = colDate >= 0 && colDate < row.length ? row[colDate].trim() : "";
                String descStr = colDesc >= 0 && colDesc < row.length ? row[colDesc].trim() : "";
                String amtStr = colAmount >= 0 && colAmount < row.length ? row[colAmount].trim() : "";
                String fitIdStr = colFitId >= 0 && colFitId < row.length ? row[colFitId].trim() : "";

                if (dateStr.isEmpty() && amtStr.isEmpty()) continue;

                BigDecimal amount = parseBrazilianDecimal(amtStr);
                if (amount == null) continue;

                // Suggest expense/income based on amount sign
                String suggestedCategory = amount.compareTo(BigDecimal.ZERO) < 0 ? "Despesas" : "Receitas";

                ImportRowDto dto = ImportRowDto.builder()
                        .rowIndex(i - startRow)
                        .date(dateStr)
                        .description(descStr)
                        .amount(amount)
                        .fitId(fitIdStr)
                        .duplicate(false)
                        .suggestedCategory(suggestedCategory)
                        .build();

                rows.add(dto);
            }
        }

        return rows;
    }

    // ========== OFX PARSING ==========

    private List<ImportRowDto> parseOfx(String content) {
        List<ImportRowDto> rows = new ArrayList<>();
        int index = 0;

        // Find all STMTTRN blocks
        Pattern blockPattern = Pattern.compile("<STMTTRN>\\s*(.*?)\\s*</STMTTRN>", Pattern.DOTALL | Pattern.CASE_INSENSITIVE);
        Matcher blockMatcher = blockPattern.matcher(content);

        while (blockMatcher.find()) {
            String block = blockMatcher.group(1);

            String trnType = extractTag(block, "TRNTYPE");
            String dtPosted = extractTag(block, "DTPOSTED");
            String trnAmt = extractTag(block, "TRNAMT");
            String fitId = extractTag(block, "FITID");
            String name = extractTag(block, "NAME");
            String memo = extractTag(block, "MEMO");

            if (trnAmt == null || trnAmt.isBlank()) continue;

            BigDecimal amount;
            try {
                amount = new BigDecimal(trnAmt.trim().replace(",", "."));
            } catch (NumberFormatException e) {
                continue;
            }

            // OFX: positive = credit (INCOME), negative = debit (EXPENSE)
            // Already implicit in the sign

            String description = name != null ? name : "";
            if (memo != null && !memo.isBlank() && !memo.equals(name)) {
                description = description + " - " + memo;
            }

            String dateStr = "";
            if (dtPosted != null && dtPosted.length() >= 8) {
                // DTPOSTED format: YYYYMMDDHHMMSS or YYYYMMDD
                dateStr = dtPosted.substring(0, 4) + "-" + dtPosted.substring(4, 6) + "-" + dtPosted.substring(6, 8);
            }

            String suggestedCategory = amount.compareTo(BigDecimal.ZERO) < 0 ? "Despesas" : "Receitas";

            ImportRowDto dto = ImportRowDto.builder()
                    .rowIndex(index++)
                    .date(dateStr)
                    .description(description.trim())
                    .amount(amount)
                    .fitId(fitId != null ? fitId.trim() : "")
                    .duplicate(false)
                    .suggestedCategory(suggestedCategory)
                    .build();

            rows.add(dto);
        }

        return rows;
    }

    private String extractTag(String content, String tagName) {
        Pattern pattern = Pattern.compile("<" + tagName + ">\\s*(.*?)\\s*(?:</" + tagName + ">|$)", Pattern.DOTALL | Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(content);
        if (matcher.find()) {
            String val = matcher.group(1).trim();
            return val.isEmpty() ? null : val;
        }
        // Also try without closing tag (SGML style)
        Pattern altPattern = Pattern.compile("<" + tagName + ">([^<]*)", Pattern.CASE_INSENSITIVE);
        Matcher altMatcher = altPattern.matcher(content);
        if (altMatcher.find()) {
            String val = altMatcher.group(1).trim();
            return val.isEmpty() ? null : val;
        }
        return null;
    }

    // ========== DUPLICATE DETECTION ==========

    private boolean isDuplicate(ImportRowDto row, UUID accountId) {
        // For OFX with FITID
        if (row.getFitId() != null && !row.getFitId().isBlank()) {
            List<Transaction> existing = transactionRepo.findByAccountIdAndDateBetween(
                    accountId, LocalDate.MIN, LocalDate.MAX);
            return existing.stream()
                    .anyMatch(tx -> row.getFitId().equals(tx.getId().toString()));
        }

        // For CSV: match by amount (within 0.01) and date (±1 day)
        if (row.getAmount() == null) return false;
        LocalDate parsedDate = parseDate(row.getDate());
        if (parsedDate == null) return false;

        BigDecimal absAmount = row.getAmount().abs();

        List<Transaction> accountTx = transactionRepo.findByAccountIdAndDateBetween(
                accountId, parsedDate.minusDays(1), parsedDate.plusDays(1));

        return accountTx.stream()
                .anyMatch(tx -> tx.getStatus() == Transaction.TransactionStatus.COMPLETED
                        && tx.getAmount().subtract(absAmount).abs().compareTo(new BigDecimal("0.01")) <= 0);
    }

    // ========== HELPERS ==========

    private String detectFileType(String fileName) {
        String lower = fileName.toLowerCase();
        if (lower.endsWith(".csv")) return "CSV";
        if (lower.endsWith(".ofx") || lower.endsWith(".qfx")) return "OFX";
        if (lower.endsWith(".ofc")) return "OFX"; // OFC is similar to OFX
        return null;
    }

    private BigDecimal parseBrazilianDecimal(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            // Remove "R$", spaces, and other non-numeric chars except . , and -
            String cleaned = value.replaceAll("[^\\d.,\\-]", "").trim();

            // Check if it's Brazilian format (e.g. 1.234,56)
            boolean hasComma = cleaned.contains(",");
            boolean hasDot = cleaned.contains(".");

            if (hasComma && hasDot) {
                // Brazilian: 1.234,56 -> dots are thousands separators, comma is decimal
                cleaned = cleaned.replace(".", "").replace(",", ".");
            } else if (hasComma && !hasDot) {
                // Just comma: could be decimal separator
                cleaned = cleaned.replace(",", ".");
            }
            // If just dots, it's likely already a valid decimal

            return new BigDecimal(cleaned);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return null;
        String cleaned = dateStr.trim();
        for (DateTimeFormatter fmt : DATE_FORMATTERS) {
            try {
                return LocalDate.parse(cleaned, fmt);
            } catch (DateTimeParseException ignored) {
            }
        }
        return null;
    }

    private Category getOrCreateDefaultCategory(UUID userId, Category.TransactionType type, User user) {
        String defaultName = type == Category.TransactionType.EXPENSE ? "Importação" : "Receitas Importadas";

        // Try to find existing
        List<Category> existing = categoryRepo.findByUserIdAndTypeAndActiveTrue(userId, type);
        if (!existing.isEmpty()) {
            return existing.get(0);
        }

        // Create default
        Category category = Category.builder()
                .name(defaultName)
                .type(type)
                .user(user)
                .active(true)
                .isDefault(false)
                .color(type == Category.TransactionType.EXPENSE ? "#ef4444" : "#22c55e")
                .build();
        return categoryRepo.save(category);
    }

    private ImportLogResponse toResponse(ImportLog log, String accountName) {
        return ImportLogResponse.builder()
                .id(log.getId())
                .fileName(log.getFileName())
                .fileType(log.getFileType())
                .accountId(log.getAccountId())
                .accountName(accountName)
                .status(log.getStatus())
                .totalRows(log.getTotalRows() != null ? log.getTotalRows() : 0)
                .importedCount(log.getImportedCount() != null ? log.getImportedCount() : 0)
                .duplicateCount(log.getDuplicateCount() != null ? log.getDuplicateCount() : 0)
                .errorCount(log.getErrorCount() != null ? log.getErrorCount() : 0)
                .errorDetails(log.getErrorDetails())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
