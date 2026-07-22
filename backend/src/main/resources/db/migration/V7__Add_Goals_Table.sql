-- Create Goals Table
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    target_amount NUMERIC(19, 4) NOT NULL,
    current_amount NUMERIC(19, 4) NOT NULL DEFAULT 0.00,
    target_date DATE NOT NULL,
    color VARCHAR(50),
    icon VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_goals_user ON goals(user_id);

-- Seed sample goals for demo user
INSERT INTO goals (id, name, target_amount, current_amount, target_date, color, icon, status, user_id) VALUES
('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Reserva de Emergência', 30000.00, 18500.00, '2026-12-31', '#059669', 'shield', 'IN_PROGRESS', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('d2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Viagem para Europa', 15000.00, 6200.00, '2027-06-30', '#2563eb', 'flight', 'IN_PROGRESS', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Novo Notebook M3', 12000.00, 12000.00, '2026-05-15', '#7c3aed', 'laptop', 'COMPLETED', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
