package com.financeflow.dto.sharing;

import com.financeflow.entity.AccountShare;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountShareResponse {
    private UUID id;
    private UUID accountId;
    private String accountName;
    private String ownerEmail;
    private String sharedWithEmail;
    private AccountShare.PermissionLevel permissionLevel;
    private AccountShare.ShareStatus status;
    private LocalDateTime createdAt;
}
