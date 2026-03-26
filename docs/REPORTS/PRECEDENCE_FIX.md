# Relatório Técnico: Correção de Precedência Matemática e Ampliação de Precisão

Este relatório descreve as alterações arquiteturais realizadas na biblioteca **CalcAUD** para corrigir o comportamento de precedência linear do expoente e elevar a precisão interna para conformidade fiscal rigorosa.

## 1. Problema Identificado
Originalmente, a biblioteca operava como uma calculadora linear sequencial. Em uma cadeia de métodos como `CalcAUD.from(10).div(2).pow(3)`, o cálculo era realizado da esquerda para a direita:
1. `10 / 2 = 5`
2. `5 ^ 3 = 125`

Matematicamente, em uma expressão como $10 / 2^3$, a potência deve ter precedência sobre a divisão, resultando em $10 / 8 = 1.25$. Além disso, a representação visual (Unicode/LaTeX) gerava ambiguidades que podiam induzir o auditor ao erro.

## 2. Solução Implementada: Refatoração do Estado Tripartido

Para suportar precedência sem perder a fluidez da API de métodos encadeados, o estado interno da classe `CalcAUD` foi refatorado. Em vez de um único "valor ativo", a classe agora rastreia três componentes distintos:

### A. Estrutura de Estado
*   **`accumulatedValue`**: Armazena a soma/subtração de termos já finalizados.
*   **`activeTermProduct`**: Armazena o produto ou quociente acumulado dos fatores anteriores dentro do termo multiplicativo atual.
*   **`activeFactorValue`**: Armazena o valor do **último fator** inserido. É sobre este componente que o método `.pow()` agora opera exclusivamente.
*   **`activeFactorIsDivision`**: Um booleano que indica se o fator atual deve ser multiplicado ou dividido ao consolidar o termo.

### B. Novo Fluxo de Precedência (Exemplo: `10 / 2^3`)
1.  **`from(10)`**: Inicializa `activeFactorValue = 10`.
2.  **`.div(2)`**: 
    - Move o `10` para o `activeTermProduct`.
    - Define o novo `activeFactorValue = 2` e `activeFactorIsDivision = true`.
3.  **`.pow(3)`**: 
    - Aplica a potência **apenas** ao `activeFactorValue`.
    - Resultado interno: `activeFactorValue = 8` (2³).
4.  **`.commit()`**: 
    - Consolida o termo: `10 / 8 = 1.25`.

## 3. Ampliação da Precisão Fiscal
Para resolver problemas de arredondamento em potências de frações complexas (como juros compostos), a precisão interna foi ampliada:
*   **Escala Anterior**: 12 casas decimais ($10^{12}$).
*   **Nova Escala**: 18 casas decimais ($10^{18}$).

Esta mudança garante que erros infinitesimais em divisões sucessivas (ex: $7/11$) não se propaguem ao serem elevados a potências altas, mantendo a integridade do resultado até a 15ª casa decimal ou superior.

## 4. Agrupamento Automático e Inteligente
Conforme solicitado, o comportamento de instâncias aninhadas foi padronizado:
*   **Injeção de Instância**: Ao passar uma instância de `CalcAUD` para métodos como `from()`, `add()`, `mult()`, ou como expoente em `pow()`, a biblioteca agora chama automaticamente o método `.group()`.
*   **Prevenção de Redundância**: Adicionada lógica para detectar se uma expressão já está agrupada por parênteses no LaTeX/Unicode, evitando a geração de parênteses duplos como `((a + b))`.

## 5. Resultados e Validação
As alterações foram validadas com 238 testes automatizados, incluindo novos cenários de alta precisão e precedência algébrica:

| Cenário | Entrada | Resultado Antigo | Resultado Novo |
| :--- | :--- | :--- | :--- |
| **Precedência** | `from(10).div(2).pow(3)` | 125.00 | 1.25 |
| **Alta Precisão** | `1000 / (7/11)^9` | 58432.141916... | 58432.141914848... |
| **Visual Unicode** | `from(10).div(2).pow(3)` | `10 ÷ 2³` (Ambíguo) | `10 ÷ 2³` (Calculado como $10/2^3$) |

A biblioteca agora comporta-se de forma mais próxima às expectativas de ferramentas científicas e algébricas, mantendo a facilidade de uso da API fluente.
