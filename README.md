<header align="center">

# CalcAUY (Audit + A11y)

**Engine de Cálculo Baseada em AST para Engenharia Financeira e Acessibilidade Universal**

[![JSR](https://jsr.io/badges/@st-all-one/calc-auy?logoColor=f7df1e&color=f7df1e&labelColor=083344)](https://jsr.io/@st-all-one/calc-auy)
[![Deno](https://img.shields.io/badge/runtime-deno-black?logo=deno)](https://deno.land/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

</header>

A **CalcAUY** é uma infraestrutura de cálculo de alta precisão desenvolvida em **TypeScript**, projetada para neutralizar os riscos de imprecisão do padrão IEEE 754 em sistemas fiscais, jurídicos e bancários. Através de uma arquitetura baseada em **Árvore de Sintaxe Abstrata (AST)** e **Aritmética Racional (`n/d`)**, a biblioteca garante integridade matemática absoluta e rastro forense pleno para cada centavo processado.

---

## 🚀 Início Rápido

### Instalação (JSR)
```bash
# Deno
deno add jsr:@st-all-one/calc-auy

# Node.js / Bun / Package Managers
npx jsr add @st-all-one/calc-auy
bunx jsr add @st-all-one/calc-auy
```

### Exemplo: Engenharia de Juros e Impostos
```ts
import { CalcAUY } from "@st-all-one/calc-auy";

// 1. Construção do Cálculo (Build Phase)
const fatura = CalcAUY.from("1250.50")
  .add(
    CalcAUY.from("50.00")
      .setMetadata("desc", "Taxa de Logística") // Rastro forense
  )
  .mult(
    CalcAUY.from(1).add("0.15").group() // (1 + 15%)
  )
  .setMetadata("rule", "reajuste_anual_2026");

// 2. Colapso Matemático (Commit Phase)
const resultado = fatura.commit({ roundStrategy: "NBR-5891" });

// 3. Extração Multimodal (Output Phase)
console.log(resultado.toMonetary());        // "R$ 1.495,58"
console.log(resultado.toUnicode());         // "roundₙᵦᵣ₋₅₈₉₁((1250.50 + 50.00) × (1 + 0.15), 4) = 1495.5750"
console.log(resultado.toVerbalA11y());      // "mil quatrocentos e noventa e cinco reais e cinquenta e oito centavos..."
console.log(resultado.toJSON());            // Snapshot JSON consolidado para APIs
```

---

## 🏛️ Pilares da Engenharia

### 1. O Paradigma da AST (Abstract Syntax Tree)
Diferente de calculadoras sequenciais que arredondam a cada passo, a CalcAUY constrói uma **Árvore de Sintaxe**. Isso permite:
- **Postergação da Execução:** O cálculo real só ocorre no `commit()`, eliminando erros acumulados.
- **Persistência (Hibernação):** Serialize um cálculo complexo via `.hibernate()` e transmita-o via rede para ser reidratado em outro serviço.
- **Audit Trace:** A árvore preserva a "intenção" do programador, permitindo provar *como* um resultado foi obtido.

### 2. Precisão Racional Absoluta
Substituímos o tipo `number` (float64) por uma estrutura de **Frações Racionais (`RationalNumber`)** baseada em `BigInt`.
- **Precisão Interna:** 50 casas decimais garantidas.
- **Imunidade IEEE 754:** Operações com dízimas (ex: 1/3) são mantidas como frações puras, evitando que `0.1 + 0.2` seja diferente de `0.3`.
- **Simplificação Automática:** Aplicação de MDC (GCD) em cada operação para manter BigInts performáticos.

### 3. Acessibilidade Radical (A11y)
A CalcAUY trata a **acessibilidade como um requisito matemático**.
- **Engine Fonética:** Gera descrições verbais inteligentes que respeitam a hierarquia de precedência.
- **Internacionalização (i18n):** Suporte nativo a múltiplos locales e moedas utilizando a API `Intl` para formatação monetária forense.

### 4. Rateio Exato (Slicing)
Implementação do **Algoritmo de Maior Resto** para garantir que a soma das parcelas sempre bata com o total original.
```ts
// Dividindo 10.00 em 3 parcelas (sem perder centavos)
const parcelas = total.toSlice(3); // ["3.34", "3.33", "3.33"]
```

---

## 🛡️ Qualidade e Rigor Normativo

- **Conformidade NBR-5891:** Implementação rigorosa da norma brasileira de arredondamento.
- **RFC 7807:** Sistema de erros baseado em "Problem Details" para APIs distribuídas.
- **Telemetria:** Logs estruturados via LogTape 2.0 integrados ao ciclo de vida do cálculo.
- **Strict TypeScript:** 100% de cobertura de tipos, garantindo segurança em tempo de compilação.

---

## 🤝 Contribuição e Open Source

Este é um projeto **comunitário e transparente**. Encorajamos a criação de novos **OutputProcessors** (ex: Excel, Protobuf, Blockchain Ledger).

1. Faça o Fork do projeto.
2. Crie uma branch para sua feature (`git checkout -b feature/nova-saida`).
3. Certifique-se de que os testes passam (`deno task test`).
4. Abra um Pull Request detalhando a melhoria de engenharia.

---

<footer align="center">

**CalcAUY** — Porque a confiança no seu software começa pela integridade dos seus números.
Desenvolvido sob a licença **MIT**.

</footer>
