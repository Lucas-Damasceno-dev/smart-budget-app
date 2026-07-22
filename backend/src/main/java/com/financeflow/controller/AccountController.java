package com.financeflow.controller;

import com.financeflow.dto.account.AccountRequest;
import com.financeflow.dto.account.AccountResponse;
import com.financeflow.dto.common.ApiResponse;
import com.financeflow.dto.transaction.TransactionResponse;
import com.financeflow.service.AccountService;
import com.financeflow.service.InvoiceService;
import com.financeflow.service.TransactionService;
import com.financeflow.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/accounts")
@RequiredArgsConstructor
@Tag(name = "Accounts", description = "Bank accounts and wallets management")
@SecurityRequirement(name = "Bearer Authentication")
public class AccountController {

    private final AccountService accountService;
    private final InvoiceService invoiceService;
    private final TransactionService transactionService;
    private final SecurityUtils securityUtils;

    @GetMapping
    @Operation(summary = "Get all accounts")
    public ResponseEntity<ApiResponse<List<AccountResponse>>> getAllAccounts() {
        UUID userId = securityUtils.getCurrentUserId();
        List<AccountResponse> accounts = accountService.getAllAccounts(userId);
        return ResponseEntity.ok(ApiResponse.success(accounts));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get account by ID")
    public ResponseEntity<ApiResponse<AccountResponse>> getAccount(@PathVariable UUID id) {
        UUID userId = securityUtils.getCurrentUserId();
        AccountResponse account = accountService.getAccount(id, userId);
        return ResponseEntity.ok(ApiResponse.success(account));
    }

    @GetMapping("/{id}/balance")
    @Operation(summary = "Get account balance")
    public ResponseEntity<ApiResponse<BigDecimal>> getAccountBalance(@PathVariable UUID id) {
        UUID userId = securityUtils.getCurrentUserId();
        AccountResponse account = accountService.getAccount(id, userId);
        return ResponseEntity.ok(ApiResponse.success(account.getCurrentBalance()));
    }

    @GetMapping("/total-balance")
    @Operation(summary = "Get total balance across all accounts")
    public ResponseEntity<ApiResponse<BigDecimal>> getTotalBalance() {
        UUID userId = securityUtils.getCurrentUserId();
        BigDecimal total = accountService.getTotalBalance(userId);
        return ResponseEntity.ok(ApiResponse.success(total));
    }

    @PostMapping
    @Operation(summary = "Create new account")
    public ResponseEntity<ApiResponse<AccountResponse>> createAccount(@Valid @RequestBody AccountRequest request) {
        UUID userId = securityUtils.getCurrentUserId();
        AccountResponse account = accountService.createAccount(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(account, "Account created successfully"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update account")
    public ResponseEntity<ApiResponse<AccountResponse>> updateAccount(
            @PathVariable UUID id,
            @Valid @RequestBody AccountRequest request) {
        UUID userId = securityUtils.getCurrentUserId();
        AccountResponse account = accountService.updateAccount(id, request, userId);
        return ResponseEntity.ok(ApiResponse.success(account, "Account updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete account")
    public ResponseEntity<ApiResponse<Void>> deleteAccount(@PathVariable UUID id) {
        UUID userId = securityUtils.getCurrentUserId();
        accountService.deleteAccount(id, userId);
        return ResponseEntity.ok(ApiResponse.success(null, "Account deleted successfully"));
    }

    @GetMapping("/{id}/invoice")
    @Operation(summary = "Get invoice for a credit card account")
    public ResponseEntity<ApiResponse<InvoiceService.InvoiceData>> getInvoice(
            @PathVariable UUID id,
            @RequestParam(required = false) String month) {
        UUID userId = securityUtils.getCurrentUserId();
        InvoiceService.InvoiceData invoice;
        if (month != null) {
            LocalDate refDate = LocalDate.parse(month + "-01");
            invoice = invoiceService.getInvoiceForMonth(id, userId, refDate);
        } else {
            invoice = invoiceService.getCurrentInvoice(id, userId);
        }
        return ResponseEntity.ok(ApiResponse.success(invoice));
    }

    @PostMapping("/{id}/invoice/pay")
    @Operation(summary = "Pay invoice for a credit card account")
    public ResponseEntity<ApiResponse<TransactionResponse>> payInvoice(
            @PathVariable UUID id,
            @RequestBody Map<String, UUID> body) {
        UUID userId = securityUtils.getCurrentUserId();
        UUID sourceAccountId = body.get("sourceAccountId");
        if (sourceAccountId == null) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("sourceAccountId is required"));
        }
        var payment = invoiceService.payInvoice(id, sourceAccountId, userId);
        TransactionResponse response = transactionService.toResponse(payment);
        return ResponseEntity.ok(ApiResponse.success(response, "Invoice paid"));
    }
}
