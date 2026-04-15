# Motor e Representação Interna

A arquitetura interna da CalcAUY é dividida entre a unidade fundamental de valor (`RationalNumber`) e a estrutura organizacional do cálculo (AST).

## 1. RationalNumber: A Unidade Básica

A engine descarta o tipo de dados nativo do JavaScript para números em favor de uma representação racional real.

- **Representação:** Utiliza dois campos privados nativos (`#n` para numerador e `#d` para denominador) do tipo `bigint`.
- **Imutabilidade Real:** O estado interno é protegido por campos privados nativos (`#`), impossibilitando a alteração após a criação.
- **Simplificação via GCD Híbrido:** Todas as operações matemáticas acionam automaticamente um algoritmo de Máximo Divisor Comum. Este algoritmo é híbrido, utilizando o operador de módulo nativo do V8 para máxima performance em números de qualquer escala.
- **Operações Suportadas:** Soma, subtração, multiplicação, divisão (fração), potência (incluindo raízes), módulo euclidiano e divisão inteira.

## 2. Estrutura da AST (Árvore de Sintaxe Abstrata)

O cálculo é modelado como uma árvore hierárquica onde cada nó possui uma função específica:

1.  **LiteralNode:** Representa um valor estático e sua entrada original. É a base da árvore.
2.  **OperationNode:** Representa uma operação entre operandos. A profundidade do nó na árvore determina sua ordem de precedência (operações de menor precedência ficam mais próximas da raiz).
3.  **GroupNode:** Atua como um isolador léxico, representando parênteses explícitos ou agrupamentos automáticos. Garante que a estrutura matemática seja preservada na renderização visual e verbal.

## 3. Precedência e Associatividade

A engine segue rigorosamente as regras matemáticas padrão, com uma distinção crítica na exponenciação:

- **Torre de Potência:** A exponenciação (`^`) possui associatividade à direita. Ex: `2^3^2` é avaliado como `2^(3^2)`.
- **Operações Multiplicativas:** Multiplicação, divisão, divisão inteira e módulo possuem o mesmo nível de precedência e associatividade à esquerda.
- **Operações Aditivas:** Soma e subtração possuem o menor nível de precedência e associatividade à esquerda.

## 4. Precisão e Colapso

Durante a fase de colapso, o motor de execução mantém o cálculo como frações puras sempre que possível. Em casos onde a conversão decimal é necessária (como a função `toStringNumber()` ou operações de raiz), utiliza-se uma constante de escala de $10^{50}$ para garantir 50 casas decimais de precisão interna, eliminando qualquer viés estatístico significativo no resultado final.
