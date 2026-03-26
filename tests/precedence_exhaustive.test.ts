import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { describe, it } from "@std/testing/bdd";
import { CalcAUD } from "../src/main.ts";

describe("CalcAUD - Bateria Exaustiva de Precedência Matemática", () => {
    
    describe("Nível 1: Potência vs Multiplicação/Divisão (P > M/D)", () => {
        it("deve calcular 10 * 2^3 = 80 (não 20^3)", () => {
            const res = CalcAUD.from(10).mult(2).pow(3).commit(0);
            assertEquals(res.toString(), "80");
            assertEquals(res.toUnicode().includes("10 × 2³"), true);
        });

        it("deve calcular 100 / 2^2 = 25 (não 50^2)", () => {
            const res = CalcAUD.from(100).div(2).pow(2).commit(0);
            assertEquals(res.toString(), "25");
            assertEquals(res.toLaTeX().includes("\\frac{100}{{2}^{2}}"), true);
        });

        it("deve calcular quocientes sucessivos com potência: 1000 / 10 / 2^3 = 12.5", () => {
            const res = CalcAUD.from(1000).div(10).div(2).pow(3).commit(1);
            assertEquals(res.toString(), "12.5");
        });
    });

    describe("Nível 2: Multiplicação/Divisão vs Soma/Subtração (M/D > A/S)", () => {
        it("deve calcular 10 + 2 * 5 = 20", () => {
            const res = CalcAUD.from(10).add(2).mult(5).commit(0);
            assertEquals(res.toString(), "20");
        });

        it("deve calcular 50 - 10 / 2 = 45", () => {
            const res = CalcAUD.from(50).sub(10).div(2).commit(0);
            assertEquals(res.toString(), "45");
        });
    });

    describe("Nível 3: Precedência Completa (P > M/D > A/S)", () => {
        it("deve calcular 10 + 2 * 3^2 = 28", () => {
            const res = CalcAUD.from(10).add(2).mult(3).pow(2).commit(0);
            assertEquals(res.toString(), "28");
        });

        it("deve calcular 100 / 2^2 + 5 * 3 = 40", () => {
            const res = CalcAUD.from(100).div(2).pow(2).add(5).mult(3).commit(0);
            assertEquals(res.toString(), "40");
        });
    });

    describe("Nível 4: Agrupamento e Aninhamento (Explícito e Automático)", () => {
        it("deve forçar precedência com group(): (10 + 2) * 5 = 60", () => {
            const res = CalcAUD.from(10).add(2).group().mult(5).commit(0);
            assertEquals(res.toString(), "60");
        });

        it("deve agrupar automaticamente instância em add: 10 + (5 * 2) = 20", () => {
            const inner = CalcAUD.from(5).mult(2);
            const res = CalcAUD.from(10).add(inner).commit(0);
            assertEquals(res.toString(), "20");
            assertEquals(res.toLaTeX().includes("\\left( 5 \\times 2 \\right)"), true);
        });

        it("deve agrupar automaticamente instância em pow (base): (2 + 3)^2 = 25", () => {
            const inner = CalcAUD.from(2).add(3);
            const res = CalcAUD.from(inner).pow(2).commit(0);
            assertEquals(res.toString(), "25");
        });

        it("deve agrupar automaticamente instância em pow (expoente): 2^(1+2) = 8", () => {
            const exp = CalcAUD.from(1).add(2);
            const res = CalcAUD.from(2).pow(exp).commit(0);
            assertEquals(res.toString(), "8");
        });
    });

    describe("Nível 5: Casos Complexos e Radiciação", () => {
        it("deve calcular raiz de uma soma agrupada: sqrt(9 + 16) = 5", () => {
            const sum = CalcAUD.from(9).add(16);
            const res = CalcAUD.from(sum).pow("1/2").commit(0);
            assertEquals(res.toString(), "5");
        });

        it("deve calcular potência de potência (Left-to-Right): (2^3)^2 = 64", () => {
            const res = CalcAUD.from(2).pow(3).pow(2).commit(0);
            assertEquals(res.toString(), "64");
        });

        it("deve permitir potência de potência (Right-to-Left) via aninhamento: 2^(3^2) = 512", () => {
            const exp = CalcAUD.from(3).pow(2);
            const res = CalcAUD.from(2).pow(exp).commit(0);
            assertEquals(res.toString(), "512");
        });
    });

    describe("Nível 6: Divisão Inteira e Módulo", () => {
        it("deve respeitar precedência: 10 + 25 // 2^2 = 16", () => {
            const res = CalcAUD.from(10).add(25).divInt(2).pow(2).commit(0);
            assertEquals(res.toString(), "16");
        });

        it("deve respeitar precedência: 10 + 25 % 3^2 = 17", () => {
            const res = CalcAUD.from(10).add(25).mod(3).pow(2).commit(0);
            assertEquals(res.toString(), "17");
        });
    });
});
