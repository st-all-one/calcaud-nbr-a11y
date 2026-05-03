# CalcAUY: Arquitetura, Convenções e Guia de Desenvolvimento

A **CalcAUY** (Audit + A11y) é uma infraestrutura aritmética de alta precisão baseada em Árvore de Sintaxe Abstrata (AST), desenvolvida em TypeScript para o ecossistema Deno. O projeto foca em **segurança jurídica**, **auditabilidade forense** e **acessibilidade universal (A11y)**.

## 🚀 Visão Geral do Projeto

-   **Objetivo:** Substituir o padrão impreciso `number` (IEEE 754) por um modelo de frações racionais (`n/d`) usando `BigInt`, garantindo precisão absoluta.
-   **Arquitetura:** Baseada em uma AST imutável. O cálculo é construído como uma árvore e só é "colapsado" (executado) na fase de `commit()`.
-   **Pilar de Segurança:** Cada etapa do cálculo é assinada criptograficamente (BLAKE3) para garantir a integridade do rastro de auditoria.
-   **Inclusividade:** Geração nativa de traduções verbais da lógica matemática (A11y) em múltiplos idiomas.

## 🏗️ Arquitetura e Fluxo de Trabalho

### 1. Isolamento por Instâncias (Contextos)
**Regra de Ouro:** Não existe estado global. Todo cálculo **deve** ser iniciado a partir de uma instância criada via `CalcAUY.create()`.

```ts
const Finance = CalcAUY.create({
    contextLabel: "tax-calculation",
    salt: "user-secret-salt",
    roundStrategy: "NBR5891"
});

const builder = Finance.from(100).add(50);
```

### 2. Ciclo de Vida do Cálculo
1.  **Input:** Ingestão de valores via `.from(value)` ou `.parseExpression(string)`.
2.  **Build (Fluent API):** Construção da AST imutável (`.add()`, `.mult()`, `.pow()`, `.group()`).
3.  **Enriquecimento:** Adição de metadados de negócio via `.setMetadata(key, value)`.
4.  **Commit:** Fase de avaliação onde a estratégia de arredondamento é aplicada e a assinatura final é gerada.
5.  **Output:** Geração de múltiplos formatos (LaTeX, Unicode, Verbal, Audit Trace, Slices).

### 3. Persistência e Hibernação
-   `.hibernate()`: Salva o estado atual da AST com assinatura de integridade para continuidade posterior.
-   `.hydrate()`: Reconstrói uma instância de cálculo a partir de um JSON assinado, validando o rastro bit-a-bit.

## 🛠️ Stack Tecnológica

-   **Runtime:** Deno
-   **Linguagem:** TypeScript (Strict Mode Máximo)
-   **Criptografia:** `@std/crypto` (BLAKE3) para assinaturas.
-   **Logging:** LogTape 2.0 (Zero dependências externas no core).
-   **Matemática:** BigInt nativo encapsulado na classe `RationalNumber`.

## 📜 Convenções de Desenvolvimento

### 1. Padrão de Testes (BDD)
-   **Framework:** `@std/testing/bdd`.
-   **Localização:** Todos os testes residem na pasta `tests/`.
-   **Nota de Manutenção:** O projeto passou por uma migração de "Static Helpers" para "Instance-based". Muitos testes legados ainda usam a sintaxe `CalcAUY.from()`. **Novos testes e refatorações devem priorizar o uso de instâncias via `CalcAUY.create()`**.

### 2. Imutabilidade e Encapsulamento
-   Nenhum nó da AST ou estado interno deve ser mutável.
-   Utilize `#private` fields para encapsulamento rigoroso de segredos e lógica interna.
-   O motor de execução (`src/ast/engine.ts`) deve ser puro.

### 3. Performance e Memória
-   **Simplificação de Frações:** Toda operação em `RationalNumber` aplica o MDC (Máximo Divisor Comum) imediatamente para manter as frações no menor tamanho possível.
-   **AST Cache:** O builder utiliza `WeakRef` e `FinalizationRegistry` para reutilizar nós literais idênticos e otimizar o uso de memória em cálculos massivos.

## 🏗️ Comandos Principais (Deno)

-   **Executar Testes:** `deno task test`
-   **Formatação de Código:** `deno task fmt`
-   **Linting:** `deno task lint`

## 📂 Estrutura de Pastas

-   `src/`: Núcleo da engine (Builder, Parser, Engine, Core).
-   `processor/`: Processadores de saída customizados (HTML, Protobuf, CBOR, etc.).
-   `tests/`: Testes unitários, de integração e stress tests (BDD).
-   `wiki/`: Documentação técnica detalhada e especificações.
-   `schema/`: Definições formais do rastro de auditoria (JSON Schema, Proto, SQL).

---
**Importante:** Qualquer modificação na lógica aritmética deve ser validada contra os testes de arredondamento fiscal (`tests/nbr5891.test.ts`) e integridade criptográfica.
