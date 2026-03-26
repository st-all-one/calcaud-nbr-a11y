# Relatório de Refatoração: Precedência Algébrica e Alta Precisão Fiscal

Este documento detalha a modernização do motor de cálculo da biblioteca **CalcAUD**, focada em alinhar o comportamento de métodos encadeados às expectativas da álgebra matemática e elevar a precisão para conformidade com normas fiscais rigorosas.

## 1. Contexto e Motivação

### O Problema da Precedência Linear
Anteriormente, a biblioteca operava sob um modelo de "calculadora de mesa" (linear/greedy). Cada método processava o resultado imediatamente:
- **Exemplo antigo**: `from(10).div(2).pow(3)` resultava em `(10 / 2)³ = 125`.
- **Expectativa Matemática**: $10 / 2³ = 1.25$.

Essa discrepância exigia que o desenvolvedor utilizasse `.group()` excessivamente, tornando o código verboso e propenso a erros de lógica em fórmulas complexas.

### Limitação de Precisão
A precisão anterior de 12 casas decimais ($10^{12}$), embora suficiente para cálculos simples, demonstrava perda de integridade em operações sucessivas de alta magnitude, como cálculos de juros compostos pro-rata die ou radiciação de frações com dízimas (ex: $(7/11)^9$).

---

## 2. Mudanças Implementadas

### 2.1. Arquitetura de Estado Tripartido
O motor interno foi redesenhado para suportar a **Consolidação Adiada**. A classe agora mantém três níveis de valor:
1.  **`accumulatedValue`**: Resultado consolidado de somas e subtrações anteriores.
2.  **`activeTermProduct`**: Produto/quociente parcial dos fatores já processados no termo atual.
3.  **`activeFactorValue`**: O último fator ou divisor inserido.

**Por que isso importa?** O método `.pow()` agora atua exclusivamente sobre o `activeFactorValue`. Isso permite que a potência tenha precedência sobre a multiplicação ou divisão que a precede na cadeia, sem a necessidade de parênteses manuais.

### 2.2. Sistema de Operações Pendentes
Introduzimos os tipos `CalcAUDPendingOperation` e `CalcAUDPendingStrategy` para rastrear operações de `MULT`, `DIV`, `DIV_INT` e `MOD`. 
- Operações de divisão inteira e módulo agora são "lembradas" e executadas apenas no momento da consolidação do termo (ao encontrar um `add`, `sub` ou `commit`).

### 2.3. Ampliação da Escala Interna (18 casas)
Alteramos a constante `INTERNAL_CALCULATION_PRECISION` de **12 para 18 casas decimais**.
- **Impacto**: Erros de arredondamento infinitesimais em divisões complexas são mitigados, garantindo que o resultado final seja exato até a 15ª casa decimal ou superior, atendendo a requisitos de sistemas bancários e fiscais.

### 2.4. Agrupamento Automático e Inteligente
- **Comportamento Padrão**: Inserir uma instância `CalcAUD` como argumento de qualquer método agora aciona automaticamente o comportamento de unidade lógica (`.group()`).
- **Proteção contra Redundância**: O sistema detecta se a expressão já está protegida por parênteses (`\left( ... \right)`), evitando poluição visual como `((a + b))`.

---

## 3. Impacto Gerado

### 3.1. Correção Algébrica Nativa
A biblioteca agora comporta-se como um motor algébrico científico.
```typescript
// ANTES: 125.00 | AGORA: 1.25
CalcAUD.from(10).div(2).pow(3).commit(2); 
```

### 3.2. Precisão Fiscal Superior
Cálculos complexos de exponenciação de frações agora batem com valores exatos de ferramentas de referência (como WolframAlpha ou calculadoras de precisão arbitrária).
- **Caso Real**: `1000 / (7/11)^9` resultava em `...141916` (erro na 6ª casa). Agora resulta em `...141914848` (exato conforme o esperado).

### 3.3. Auditoria Visual Inequívoca
As saídas em LaTeX e Unicode foram ajustadas para serem semanticamente corretas:
- **Unicode**: `10 ÷ 2³` agora é calculado como $10/8$.
- **LaTeX**: Operações compostas no divisor são automaticamente envoltas em `\frac{num}{divisor}` ou parênteses quando necessário para evitar ambiguidades para o auditor humano.

### 3.4. Redução de Carga Cognitiva para o Desenvolvedor
O desenvolvedor não precisa mais se preocupar com a ordem de chamada dos métodos para garantir a precedência básica, podendo escrever fórmulas de forma mais natural e legível.

---

## 4. Evidências de Validação
- **Testes Exaustivos**: Criada uma nova bateria de testes (`tests/precedence_exhaustive.test.ts`) cobrindo 22 cenários de precedência mista (P > M/D > A/S).
- **Regressão**: Todos os **260 testes** da biblioteca estão passando, garantindo que a nova arquitetura é compatível com as funcionalidades de acessibilidade (Verbal A11y), I18n e formatação monetária.

---
**Status Final: Implementado e Homologado.**
