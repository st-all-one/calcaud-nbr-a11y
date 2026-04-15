# Persistência e Hibernação

Um dos diferenciais arquiteturais da CalcAUY é a capacidade de persistir não apenas o resultado de um cálculo, mas a **lógica completa da fórmula**, incluindo seu rastro de auditoria e contexto de negócio.

## 1. O Conceito de Hibernação

Diferente da persistência comum que armazena o valor decimal final (ex: `3.33`), o método `hibernate()` serializa o estado atual da Árvore de Sintaxe Abstrata (AST) em uma string JSON.

- **Integridade da Fórmula:** A hibernação captura a hierarquia de nós, os valores racionais (`n/d`) e todos os metadados anexados.
- **Independência de Ambiente:** O objeto serializado é agnóstico e pode ser transportado via rede, armazenado em bancos de dados relacionais (JSONB) ou NoSQL, e reidratado em qualquer runtime compatível (Deno, Node.js, Browser).

## 2. Reidratação (Hydrate)

O método estático `hydrate()` reconstrói uma instância ativa e funcional da CalcAUY a partir de um estado hibernado.

- **Validação de Estrutura:** O processo de hidratação verifica a integridade dos campos obrigatórios em cada nó da árvore antes de reconstruir o objeto.
- **Reconstrução de Tipos:** Valores numéricos serializados são convertidos novamente em instâncias de `RationalNumber`, recuperando a precisão BigInt original.
- **Continuidade da API Fluida:** Uma instância hidratada comporta-se como uma instância recém-criada, permitindo que novas operações sejam encadeadas sobre o estado anterior.

## 3. Lógica de Persistência vs. Valor

| Atributo | Armazenamento de Valor (Tradicional) | Hibernação CalcAUY |
| :--- | :--- | :--- |
| **Precisão** | Limitada pela escala do banco (ex: DECIMAL(18,2)). | Absoluta (BigInt Racional). |
| **Rastro** | Perde-se a origem do cálculo. | Mantém a árvore de operações completa. |
| **Contexto** | Requer tabelas extras para metadados. | Metadados são inerentes ao nó da AST. |
| **Recuperação** | Impossível reconstruir a fórmula original. | Permite gerar rastro visual (LaTeX) anos depois. |

Este mecanismo é essencial para fluxos de aprovação multi-etapas, onde um cálculo iniciado em um serviço pode ser concluído em outro, preservando a imutabilidade e a auditabilidade total.
