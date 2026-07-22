package com.financeflow.dto.sharing;

import com.financeflow.entity.AccountShare;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountShareRequest {

    @NotNull(message = "Conta é obrigatória")
    private UUID accountId;

    @NotBlank(message = "E-mail é obrigatório")
    @Email(message = "E-mail inválido")
    private String sharedWithEmail;

    private AccountShare.PermissionLevel permissionLevel;
}
