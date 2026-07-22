-- Migration V6: Account Sharing and Expense Splits

CREATE TABLE account_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shared_with_email VARCHAR(255) NOT NULL,
    shared_with_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    permission_level VARCHAR(20) NOT NULL DEFAULT 'READ',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_account_shares_account ON account_shares(account_id);
CREATE INDEX idx_account_shares_shared_with ON account_shares(shared_with_user_id);
CREATE INDEX idx_account_shares_email ON account_shares(shared_with_email);

CREATE TABLE expense_splits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    total_amount NUMERIC(15, 2) NOT NULL,
    split_amount NUMERIC(15, 2) NOT NULL,
    payer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    debtor_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    debtor_email VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    settled_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_expense_splits_payer ON expense_splits(payer_user_id);
CREATE INDEX idx_expense_splits_debtor ON expense_splits(debtor_user_id);
CREATE INDEX idx_expense_splits_status ON expense_splits(status);
