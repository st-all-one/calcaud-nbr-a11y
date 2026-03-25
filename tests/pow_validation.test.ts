import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { CurrencyNBR } from "../mod.ts";
import { CurrencyNBRError } from "../src/errors.ts";

describe("CurrencyNBR.pow - Validação de Expoente", () => {
    it("deve lançar erro para expoente com múltiplas barras (ex: '2/3/5')", () => {
        const base = CurrencyNBR.from(10);
        expect(() => base.pow("2/3/5")).toThrow(CurrencyNBRError);
        try {
            base.pow("2/3/5");
        } catch (e) {
            expect((e as CurrencyNBRError).detail).toContain(
                "Um expoente fracionário deve conter exatamente um numerador e um denominador",
            );
        }
    });

    it("deve lançar erro para expoente com caracteres não numéricos (ex: '1/abc')", () => {
        const base = CurrencyNBR.from(10);
        expect(() => base.pow("1/abc")).toThrow(CurrencyNBRError);
        try {
            base.pow("1/abc");
        } catch (e) {
            expect((e as CurrencyNBRError).detail).toContain(
                "Não foi possível converter as partes do expoente '1/abc' para números inteiros",
            );
        }
    });

    it("deve lançar erro para apenas uma barra sem números (ex: '/')", () => {
        const base = CurrencyNBR.from(10);
        expect(() => base.pow("/")).toThrow(CurrencyNBRError);
        // Detail check if possible
    });

    it("deve lançar erro para espaços em branco resultando em múltiplas barras (ex: '1 / 2 / 3')", () => {
        const base = CurrencyNBR.from(10);
        expect(() => base.pow("1 / 2 / 3")).toThrow(CurrencyNBRError);
    });

    it("deve aceitar expoente fracionário válido com espaços", () => {
        const base = CurrencyNBR.from(4);
        // "1 / 2" deve ser aceito
        const result = base.pow(" 1 / 2 ");
        const output = result.commit(2);
        expect(output.toString()).toBe("2.00");
    });
});
