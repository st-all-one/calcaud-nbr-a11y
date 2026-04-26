-- Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
--
-- Copyright (c) 2026, Stallone L. S. (@st-all-one)
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at https://mozilla.org/MPL/2.0/.

-- CalcAUY - SQL DDL Schema (PostgreSQL)

CREATE TABLE IF NOT EXISTS calcauy_audit_traces (
    -- ID gerado pela aplicação (UUID v4)
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Lacre de Integridade (Hash BLAKE3)
    signature TEXT NOT NULL UNIQUE,

    -- Jurisdição / Contexto de Origem
    context_label TEXT NOT NULL,

    -- Estratégia de arredondamento aplicada no commit
    round_strategy TEXT NOT NULL,

    -- Resultado Consolidado (String BigInt)
    result_numerator TEXT NOT NULL,
    result_denominator TEXT NOT NULL,

    -- AST Completa
    ast JSONB NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_signature_length CHECK (length(signature) >= 32)
);

CREATE INDEX IF NOT EXISTS idx_calcauy_context ON calcauy_audit_traces (context_label);
CREATE INDEX IF NOT EXISTS idx_calcauy_signature ON calcauy_audit_traces (signature);
CREATE INDEX IF NOT EXISTS idx_calcauy_ast_gin ON calcauy_audit_traces USING GIN (ast);

COMMENT ON TABLE calcauy_audit_traces IS 'Armazenamento oficial de rastros forenses da CalcAUY. Metadados residem na AST.';
