-- V2__Seed_Data.sql
-- Seed data with realistic transactions for testing

-- Insert demo user (password: Demo@123)
-- Password is set via DataInitializer on startup to ensure correct BCrypt encoding
INSERT INTO users (id, email, password, first_name, last_name, role, profile_type, enabled, email_verified)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'demo@financeflow.com',
    '$2a$10$placeholder',
    'Demo',
    'User',
    'USER',
    'INDIVIDUAL',
    true,
    true
);

-- Insert demo accounts
INSERT INTO accounts (id, name, type, initial_balance, current_balance, currency, color, icon, bank_name, user_id) VALUES
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Conta Corrente Nubank', 'CHECKING', 5000.00, 12500.00, 'BRL', '#820AD1', 'account_balance', 'Nubank', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Poupança Inter', 'SAVINGS', 10000.00, 15000.00, 'BRL', '#FF7A00', 'savings', 'Banco Inter', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Cartão Nubank', 'CREDIT_CARD', 0.00, -2500.00, 'BRL', '#820AD1', 'credit_card', 'Nubank', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('b4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Investimentos XP', 'INVESTMENT', 20000.00, 28000.00, 'BRL', '#FFD700', 'trending_up', 'XP Investimentos', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('b5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Carteira', 'CASH', 200.00, 350.00, 'BRL', '#4CAF50', 'wallet', NULL, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

-- Insert categories for demo user
INSERT INTO categories (id, name, type, color, icon, is_default, user_id) VALUES
-- Expense categories
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Alimentação', 'EXPENSE', '#E74C3C', 'restaurant', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Transporte', 'EXPENSE', '#3498DB', 'directions_car', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Moradia', 'EXPENSE', '#9B59B6', 'home', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('c4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Saúde', 'EXPENSE', '#1ABC9C', 'local_hospital', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('c5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Educação', 'EXPENSE', '#F39C12', 'school', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('c6eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Lazer', 'EXPENSE', '#E91E63', 'sports_esports', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('c7eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Vestuário', 'EXPENSE', '#00BCD4', 'checkroom', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('c8eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Contas', 'EXPENSE', '#FF5722', 'receipt', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('c9eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Assinaturas', 'EXPENSE', '#673AB7', 'subscriptions', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
-- Income categories
('c10ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Salário', 'INCOME', '#27AE60', 'payments', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('c11ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Freelance', 'INCOME', '#2ECC71', 'work', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('c12ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Investimentos', 'INCOME', '#16A085', 'trending_up', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('c13ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Outros', 'INCOME', '#1ABC9C', 'attach_money', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
-- Transfer category
('c14ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Transferência', 'TRANSFER', '#2196F3', 'swap_horiz', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

-- Insert budgets for current month
INSERT INTO budgets (category_id, user_id, limit_amount, spent_amount, month, year) VALUES
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1500.00, 1200.00, EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 800.00, 650.00, EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER),
('c6eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 500.00, 420.00, EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER);

-- Generate 1000+ transactions over the past 12 months
DO $$
DECLARE
    i INTEGER;
    trans_date DATE;
    trans_amount DECIMAL(19,4);
    trans_type VARCHAR(20);
    cat_id UUID;
    acct_id UUID;
    descriptions TEXT[];
    expense_cats UUID[];
    income_cats UUID[];
BEGIN
    expense_cats := ARRAY[
        'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID,
        'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID,
        'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID,
        'c4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID,
        'c5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID,
        'c6eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID,
        'c7eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID,
        'c8eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID,
        'c9eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID
    ];

    income_cats := ARRAY[
        'c10ebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID,
        'c11ebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID,
        'c12ebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID,
        'c13ebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID
    ];

    descriptions := ARRAY[
        'Supermercado', 'Restaurante', 'Uber', 'Combustível', 'Aluguel', 'Farmácia',
        'Curso Online', 'Cinema', 'Shopping', 'Conta de Luz', 'Conta de Água',
        'Internet', 'Netflix', 'Spotify', 'Academia', 'Médico', 'Dentista',
        'Mercado', 'Padaria', 'Lanche', 'Delivery', 'Manutenção', 'Seguro'
    ];

    -- Generate expenses (about 900 transactions)
    FOR i IN 1..900 LOOP
        trans_date := CURRENT_DATE - (random() * 365)::INTEGER;
        trans_amount := (random() * 500 + 10)::DECIMAL(19,4);
        cat_id := expense_cats[1 + floor(random() * array_length(expense_cats, 1))::INTEGER];
        acct_id := CASE floor(random() * 3)::INTEGER
            WHEN 0 THEN 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID
            WHEN 1 THEN 'b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID
            ELSE 'b5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID
        END;

        INSERT INTO transactions (description, amount, date, type, status, account_id, category_id, user_id)
        VALUES (
            descriptions[1 + floor(random() * array_length(descriptions, 1))::INTEGER],
            trans_amount,
            trans_date,
            'EXPENSE',
            'COMPLETED',
            acct_id,
            cat_id,
            'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
        );
    END LOOP;

    -- Generate income (about 120 transactions - salary + freelance + investments)
    FOR i IN 0..11 LOOP
        -- Monthly salary
        INSERT INTO transactions (description, amount, date, type, status, account_id, category_id, user_id)
        VALUES (
            'Salário Mensal',
            8500.00,
            (CURRENT_DATE - (i * 30) - 5),
            'INCOME',
            'COMPLETED',
            'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            'c10ebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
        );

        -- Occasional freelance
        IF random() > 0.5 THEN
            INSERT INTO transactions (description, amount, date, type, status, account_id, category_id, user_id)
            VALUES (
                'Projeto Freelance',
                (random() * 2000 + 500)::DECIMAL(19,4),
                (CURRENT_DATE - (i * 30) - floor(random() * 20)::INTEGER),
                'INCOME',
                'COMPLETED',
                'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
                'c11ebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
                'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
            );
        END IF;

        -- Investment dividends
        IF random() > 0.6 THEN
            INSERT INTO transactions (description, amount, date, type, status, account_id, category_id, user_id)
            VALUES (
                'Dividendos',
                (random() * 300 + 50)::DECIMAL(19,4),
                (CURRENT_DATE - (i * 30) - floor(random() * 15)::INTEGER),
                'INCOME',
                'COMPLETED',
                'b4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
                'c12ebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
                'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
            );
        END IF;
    END LOOP;

END $$;

-- Insert some investments
INSERT INTO investments (name, type, ticker, quantity, average_price, current_price, total_invested, current_value, purchase_date, account_id, user_id) VALUES
('Tesouro Selic 2029', 'TREASURY_BOND', 'SELIC29', 10.0000, 1000.00, 1150.00, 10000.00, 11500.00, '2023-01-15', 'b4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('PETR4', 'STOCK', 'PETR4', 100.0000, 28.50, 36.80, 2850.00, 3680.00, '2023-06-10', 'b4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('MXRF11', 'FII', 'MXRF11', 200.0000, 10.20, 10.85, 2040.00, 2170.00, '2023-03-20', 'b4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('Bitcoin', 'CRYPTO', 'BTC', 0.05000000, 150000.00, 210000.00, 7500.00, 10500.00, '2023-09-01', 'b4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

-- Insert some notifications
INSERT INTO notifications (title, message, type, user_id) VALUES
('Bem-vindo ao FinanceFlow!', 'Sua jornada para uma vida financeira organizada começa agora.', 'SYSTEM', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('Orçamento de Alimentação', 'Você atingiu 80% do orçamento de Alimentação este mês.', 'BUDGET_WARNING', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
