import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { describe, it } from "@std/testing/bdd";
import { CalcAUD } from "../src/main.ts";

describe("CalcAUD - Precedência e Alta Precisão", () => {
    it("deve respeitar a precedência de Potência sobre Divisão (10 / 2^3 = 1.25)", () => {
        const result = CalcAUD.from(10).div(2).pow(3).commit(4);
        
        console.log("Precedence LaTeX:", result.toLaTeX());
        console.log("Precedence Unicode:", result.toUnicode());
        
        // Antes resultava em 125, agora deve ser 1.25
        assertEquals(result.toString(), "1.2500");
    });

    it("deve manter alta precisão em cálculos complexos (1000 / (7/11)^9)", () => {
        // Para obter 58432.14, a potência deve ser aplicada ao bloco (7/11)
        const result = CalcAUD.from(1000).div(
            CalcAUD.from(7).div(11).group().pow(9)
        ).commit(8);
        
        console.log("High Precision Value:", result.toString());
        
        // Com 18 casas internas, ao arredondar para 8 casas, devemos ter o valor exato do usuário
        assertEquals(result.toString(), "58432.14191485");
    });

    it("deve permitir forçar precedência via group() ou nesting ((10/2)^3 = 125)", () => {
        const result = CalcAUD.from(10).div(2).group().pow(3).commit(0);
        assertEquals(result.toString(), "125");
    });
});
