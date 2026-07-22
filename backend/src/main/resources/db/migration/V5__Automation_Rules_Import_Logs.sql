-- V5__Automation_Rules_Import_Logs.sql

-- ============================================================
-- PART 1: Automation Rules
-- ============================================================
CREATE TABLE automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    condition_field VARCHAR(30) NOT NULL,
    condition_operator VARCHAR(30) NOT NULL,
    condition_value VARCHAR(255) NOT NULL,
    set_category_id UUID,
    set_account_id UUID,
    set_description VARCHAR(255),
    set_tags VARCHAR(500),
    set_as_transfer BOOLEAN DEFAULT FALSE,
    priority INTEGER DEFAULT 0,
    enabled BOOLEAN DEFAULT TRUE,
    user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ar_category FOREIGN KEY (set_category_id) REFERENCES categories(id),
    CONSTRAINT fk_ar_account FOREIGN KEY (set_account_id) REFERENCES accounts(id),
    CONSTRAINT fk_ar_user FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX idx_ar_user ON automation_rules(user_id);
CREATE INDEX idx_ar_enabled ON automation_rules(enabled);

-- ============================================================
-- PART 2: Import Logs
-- ============================================================
CREATE TABLE import_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(10) NOT NULL,
    account_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    total_rows INTEGER DEFAULT 0,
    imported_count INTEGER DEFAULT 0,
    duplicate_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    error_details TEXT,
    user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_il_account FOREIGN KEY (account_id) REFERENCES accounts(id),
    CONSTRAINT fk_il_user FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX idx_il_user ON import_logs(user_id);
CREATE INDEX idx_il_account ON import_logs(account_id);
CREATE INDEX idx_il_status ON import_logs(status);
