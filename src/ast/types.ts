/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/** Tipos de nós fundamentais da árvore. */
export type NodeKind = "literal" | "operation" | "group";

/** Operações matemáticas suportadas pela engine. */
export type OperationType =
    | "add"
    | "sub"
    | "mul"
    | "div"
    | "pow"
    | "mod"
    | "divInt";

/** Representação serializável de um RationalNumber para hibernação. */
export interface RationalValue {
    n: string;
    d: string;
}

/**
 * Tipos permitidos para metadados de auditoria.
 * Restrito a tipos serializáveis para garantir a integridade do rastro JSON.
 */
export type MetadataValue =
    | string
    | number
    | boolean
    | MetadataValue[]
    | { [key: string]: MetadataValue };

/** Interface base para todos os nós, garantindo rastreabilidade. */
export interface BaseNode {
    kind: NodeKind;
    /** Nome amigável do nó para relatórios de auditoria. */
    label?: string;
    /** Dados customizados (ex: ID de uma parcela, nome de um imposto). */
    metadata?: Record<string, MetadataValue>;
}

/** Representa um valor fixo (ex: "10", "3.14"). Mantém o input original para precisão visual. */
export interface LiteralNode extends BaseNode {
    kind: "literal";
    value: RationalValue;
    originalInput: string;
}

/** Representa uma operação matemática e seus operandos. */
export interface OperationNode extends BaseNode {
    kind: "operation";
    type: OperationType;
    operands: CalculationNode[];
}

/** Representa um agrupamento lógico, essencial para a verbalização (A11y). */
export interface GroupNode extends BaseNode {
    kind: "group";
    child: CalculationNode;
    isRedundant?: boolean;
}

/** Tipo unificado para navegação na árvore. */
export type CalculationNode = LiteralNode | OperationNode | GroupNode;
