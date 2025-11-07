-- Script SQL para criar a tabela de licenças
CREATE TABLE IF NOT EXISTS licencas (
    id SERIAL PRIMARY KEY,
    id_funcionario INTEGER NOT NULL REFERENCES funcionario(id),
    tipo_licenca VARCHAR(100) NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    observacoes TEXT,
    anexos TEXT,
    status VARCHAR(20) DEFAULT 'pendente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para melhorar performance nas consultas
CREATE INDEX IF NOT EXISTS idx_licencas_funcionario ON licencas(id_funcionario);
CREATE INDEX IF NOT EXISTS idx_licencas_status ON licencas(status);
CREATE INDEX IF NOT EXISTS idx_licencas_data_inicio ON licencas(data_inicio);
