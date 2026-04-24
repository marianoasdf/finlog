-- Script de creación de base de datos para Finlog

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE months (
    id SERIAL PRIMARY KEY,
    year INT NOT NULL,
    month INT NOT NULL,
    UNIQUE(year, month)
);

CREATE TABLE movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    category_id INT REFERENCES categories(id),
    amount NUMERIC(12,2) NOT NULL,
    date DATE NOT NULL,
    month INT GENERATED ALWAYS AS (EXTRACT(MONTH FROM date)) STORED,
    year INT GENERATED ALWAYS AS (EXTRACT(YEAR FROM date)) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices útiles
CREATE INDEX idx_movements_date ON movements(date);
CREATE INDEX idx_movements_category ON movements(category_id);
CREATE INDEX idx_movements_year_month ON movements(year, month);
