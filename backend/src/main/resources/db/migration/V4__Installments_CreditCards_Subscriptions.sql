-- V4__Installments_CreditCards_Subscriptions.sql

-- ============================================================
-- PART 1: Installment Groups
-- ============================================================
CREATE TABLE installment_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description VARCHAR(255) NOT NULL,
    total_amount DECIMAL(19, 4) NOT NULL,
    total_installments INTEGER NOT NULL,
    installment_number INTEGER NOT NULL DEFAULT 1,
    installment_amount DECIMAL(19, 4) NOT NULL,
    interest_rate DECIMAL(19, 4) DEFAULT 0,
    purchase_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    account_id UUID NOT NULL,
    category_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_instgrp_account FOREIGN KEY (account_id) REFERENCES accounts(id),
    CONSTRAINT fk_instgrp_category FOREIGN KEY (category_id) REFERENCES categories(id),
    CONSTRAINT fk_instgrp_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_instgrp_user ON installment_groups(user_id);
CREATE INDEX idx_instgrp_account ON installment_groups(account_id);
CREATE INDEX idx_instgrp_status ON installment_groups(status);

ALTER TABLE transactions ADD COLUMN installment_group_id UUID;
ALTER TABLE transactions ADD COLUMN installment_index INTEGER;
ALTER TABLE transactions ADD CONSTRAINT fk_tx_instgrp FOREIGN KEY (installment_group_id) REFERENCES installment_groups(id);
CREATE INDEX idx_tx_instgrp ON transactions(installment_group_id);

ALTER TABLE accounts ADD COLUMN credit_limit DECIMAL(19, 4);
ALTER TABLE accounts ADD COLUMN closing_day INTEGER;
ALTER TABLE accounts ADD COLUMN due_day INTEGER;

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    amount DECIMAL(19, 4) NOT NULL,
    billing_cycle VARCHAR(20) NOT NULL,
    category_id UUID,
    account_id UUID,
    user_id UUID NOT NULL,
    next_billing_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    color VARCHAR(20),
    icon VARCHAR(50),
    url VARCHAR(500),
    auto_create_transaction BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sub_category FOREIGN KEY (category_id) REFERENCES categories(id),
    CONSTRAINT fk_sub_account FOREIGN KEY (account_id) REFERENCES accounts(id),
    CONSTRAINT fk_sub_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_sub_user ON subscriptions(user_id);
CREATE INDEX idx_sub_next_billing ON subscriptions(next_billing_date);
CREATE INDEX idx_sub_status ON subscriptions(status);
