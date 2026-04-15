# Auditoria e Segurança

A CalcAUY é projetada com o princípio de **Auditabilidade Forense** e **Security by Default**, garantindo que a integridade dos dados e a privacidade das informações sensíveis sejam mantidas durante todo o ciclo de vida do cálculo.

## 1. Audit Trace e Rastro Forense

O método `.toAuditTrace()` fornece um snapshot JSON que documenta exaustivamente a execução.

- **Snapshot de Estado:** Inclui a estrutura final da AST, a estratégia de arredondamento aplicada e os resultados intermediários de cada nó.
- **Transparência Jurídica:** Permite que peritos ou sistemas de auditoria terceiros validem o cálculo reconstruindo a lógica exatamente como ela foi executada na engine.
- **Visualização de Auditoria:** O rastro LaTeX e Unicode gerado pelo `CalcAUYOutput` serve como prova documental da fórmula, evidenciando precedências e agrupamentos.

## 2. Proteção de PII (Security by Default)

Como a engine processa dados financeiros e de negócio, existe uma proteção nativa contra o vazamento de Informações Pessoais Identificáveis (PII) em logs de telemetria.

- **Camada Global (Logging Policy):** Permite configurar a engine para redigir valores sensíveis em todos os logs técnicos por padrão.
- **Camada Granular (Metadata Overlap):** O metadado `"pii": true` em um nó força a ocultação do dado real, substituindo-o por `[PII]` ou `[REDACTED]` nos logs, mesmo que a política global esteja desativada.
- **Sanitização Automática:** Utilitários internos de log identificam e ocultam padrões numéricos e financeiros antes de enviá-los aos transportes do LogTape.

## 3. Telemetria e Logs Estruturados

A biblioteca utiliza o **LogTape 2.0** para instrumentação interna.

- **Namespaces Granulares:** Os logs são organizados em categorias (`engine`, `output`, `parser`, `slicer`), facilitando o diagnóstico de falhas em ambientes de produção.
- **Diagnóstico de Erros:** O sistema de erro `CalcAUYError` segue o padrão RFC 7807 (Problem Details), anexando o contexto técnico da falha (como a sub-árvore da AST) sem expor dados sensíveis do cliente.

## 4. Segurança em Runtime

- **Hard Privacy (#):** O uso de campos privados reais do JavaScript impede que códigos externos manipulem o estado interno da engine ou acessem valores brutos sem passar pelos métodos de auditoria.
- **Imutabilidade Estrutural:** A impossibilidade de alterar um cálculo após sua criação evita ataques de manipulação de estado em memória durante o processamento.
