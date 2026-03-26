import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { describe, it } from "@std/testing/bdd";
import { CalcAUD } from "../src/main.ts";

describe("CalcAUD - Agrupamento Automático (A11y)", () => {
    it("deve agrupar automaticamente instâncias aninhadas ao usar from()", () => {
        const inner = CalcAUD.from(3).mult(2);
        const result = CalcAUD.from(inner).pow(2).commit(0);

        const expected = CalcAUD.from(3).mult(2).group().pow(2).commit(0);

        assertEquals(result.toLaTeX(), expected.toLaTeX());
        assertEquals(result.toString(), "36");
    });

    it("deve agrupar automaticamente instâncias passadas para add()", () => {
        const inner = CalcAUD.from(3).mult(2);
        const result = CalcAUD.from(10).add(inner).commit(0);

        assertEquals(result.toString(), "16");
        assertEquals(result.toLaTeX().includes("\\left( 3 \\times 2 \\right)"), true);
    });

    it("deve agrupar automaticamente instâncias passadas como expoente para pow()", () => {
        const exp = CalcAUD.from(1).add(2);
        const result = CalcAUD.from(2).pow(exp).commit(0);

        assertEquals(result.toString(), "8");
        assertEquals(result.toLaTeX().includes("^{2}"), false);
        assertEquals(result.toLaTeX().includes("^{\\left( 1 + 2 \\right)}"), true);
    });
});
