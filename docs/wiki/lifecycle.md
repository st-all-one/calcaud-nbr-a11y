# Ciclo de Vida do Dado

O processamento na CalcAUY é um fluxo linear e unidirecional, projetado para garantir que a intenção matemática original seja preservada desde a entrada até a representação final.

## 1. Fase de Ingestão (Input)

A ingestão é a camada de higienização que converte entradas heterogêneas em uma representação racional única (`LiteralNode`).

- **Normalização de Strings:** Entradas como `"10.50"`, `"1/3"`, `"10.5%"` ou `"1.2e-2"` são convertidas em frações de `BigInt`.
- **Prevenção de Imprecisão:** O uso de tipos `number` é desencorajado para evitar que o erro inerente ao ponto flutuante (IEEE 754) contamine a engine antes do processamento.
- **Identidade Original:** O campo `originalInput` é preservado em cada nó para garantir que a auditoria visual reflita exatamente o que foi inserido pelo usuário (ex: manter `"1/3"` em vez de convertê-lo em decimal no rastro).

## 2. Fase de Construção (Build)

Nesta fase, a lógica matemática é estruturada em uma Árvore de Sintaxe Abstrata (AST).

- **Fluent API:** Cada chamada de método (`add()`, `mult()`, etc.) anexa um novo `OperationNode` à árvore. Devido à imutabilidade, o estado anterior nunca é alterado; uma nova raiz é gerada com a árvore expandida.
- **Parser de Expressão:** Strings complexas são convertidas em AST respeitando a precedência PEMDAS (Parênteses, Expoentes, Multiplicação/Divisão, Adição/Subtração).
- **Auto-Agrupamento:** A injeção de uma sub-árvore em outra resulta em agrupamento léxico automático (`GroupNode`), prevenindo que a precedência de operações externas corrompa a integridade da sub-expressão.
- **Anexação de Metadados:** Cada nó pode carregar um contexto de negócio (ex: "Taxa de IOF", "Juros de Mora"), que permanece acoplado à operação durante todo o ciclo.

## 3. Fase de Colapso (Commit)

O "Commit" é o gatilho de execução que transforma a estrutura lógica (AST) em um resultado numérico final.

- **Avaliação Recursiva:** O motor percorre a árvore das folhas para a raiz, resolvendo as operações matemáticas entre as instâncias de `RationalNumber`.
- **Simplificação Contínua:** O MDC (GCD) é aplicado em cada passo intermediário para otimizar o consumo de memória e a performance de cálculo.
- **Precisão Interna:** O cálculo é mantido como fração pura. Quando irracionais são necessários (raízes), utiliza-se uma precisão de 50 casas decimais.

## 4. Fase de Representação (Output)

O objeto `CalcAUYOutput` resultante permite múltiplas visualizações do mesmo fato matemático.

- **Lazy Evaluation:** As representações (LaTeX, HTML, Unicode) são geradas apenas sob demanda e armazenadas em cache para acesso imediato (O(1)) em chamadas subsequentes.
- **Arredondamento Final:** Políticas de arredondamento (como NBR-5891) são aplicadas apenas nesta fase, garantindo que o valor final seja uma projeção precisa da fração racional acumulada.
- **Processamento em Massa:** Utilitários de *Batch Processing* garantem que grandes volumes de cálculos não bloqueiem o Event Loop, utilizando técnicas de *Yielding*.
