# CalcAUY: Documentação Técnica de Engenharia

A **CalcAUY** (Audit + A11y) é uma engine de cálculo matemático de alta precisão baseada em Árvore de Sintaxe Abstrata (AST) e aritmética racional. O projeto visa substituir o modelo de ponto flutuante (IEEE 754) por uma estrutura auditável e de precisão absoluta.

## 1. Princípios de Operação

O funcionamento da engine fundamenta-se em três pilares:

1.  **Aritmética Racional:** Todos os números são processados como frações de BigInt (`n/d`), eliminando erros de arredondamento intermediário e mantendo a integridade matemática durante todo o fluxo.
2.  **AST Imutável:** O cálculo é tratado como um objeto de dados (árvore) e não como um resultado volátil. Cada operação gera uma nova representação do estado, preservando a lógica da fórmula.
3.  **Audit Trace Nativo:** Cada nó da árvore suporta metadados contextuais, permitindo a reconstrução histórica de cada decisão matemática para fins de auditoria forense.

## 2. Fluxo Processual de Dados

O ciclo de vida do dado na CalcAUY é dividido em quatro etapas sequenciais e desacopladas:

| Fase | Descrição Técnica | Saída Principal |
| :--- | :--- | :--- |
| **Ingestão** | Normalização de inputs (strings, BigInt) para a forma racional pura. | `LiteralNode` |
| **Construção** | Montagem da AST via Fluent API ou Parser. Anexação de metadados. | `CalcAUY` (Building AST) |
| **Colapso** | Execução recursiva da árvore com simplificação via MDC (GCD). | `CalcAUYOutput` |
| **Representação** | Geração de multiformatos (LaTeX, A11y, Monetário, Imagem). | Rendered Output |

## 3. Estrutura da Wiki

Para aprofundamento técnico, os módulos abaixo detalham cada aspecto da engine:

-   **[Ciclo de Vida do Dado](wiki/lifecycle.md):** Detalhamento das fases de ingestão, construção e colapso.
-   **[Motor e Representação Interna](wiki/engine.md):** O funcionamento do `RationalNumber` e a estrutura da AST.
-   **[Persistência e Hibernação](wiki/persistence.md):** Como serializar e reidratar cálculos complexos sem perda de contexto.
-   **[Auditoria e Segurança](wiki/audit-security.md):** O rastro forense, proteção de PII e telemetria.

---
**Nota:** A integridade matemática depende da observância rigorosa das regras de input e precedência definidas nestas especificações.
