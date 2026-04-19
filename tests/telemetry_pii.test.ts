import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { CalcAUY } from "@src/builder.ts";
import { sanitizeAST, sanitizeObject } from "@src/utils/sanitizer.ts";

describe("Telemetria e Proteção de PII (Security by Default)", () => {
    it("deve usar o marcador [PII] por padrão", async () => {
        CalcAUY.setSecurityPolicy({ sensitive: true });
        const calc = CalcAUY.from(100);
        const sanitized = sanitizeAST(calc.getAST()) as any;
        expect(sanitized.value).toEqual({ n: "[PII]", d: "[PII]" });
    });

    it("deve mostrar PII quando a política global sensitive for false", () => {
        CalcAUY.setSecurityPolicy({ sensitive: false });
        const calc = CalcAUY.from(100);
        const sanitized = sanitizeAST(calc.getAST()) as any;
        expect(sanitized.value.n).toBe("100");

        // Reset para padrão seguro
        CalcAUY.setSecurityPolicy({ sensitive: true });
    });

    it("deve ocultar um nó específico com pii: true mesmo com política sensitive: false", () => {
        CalcAUY.setSecurityPolicy({ sensitive: false });
        const calc = CalcAUY.from(100).setMetadata("pii", true);
        const sanitized = sanitizeAST(calc.getAST()) as any;
        expect(sanitized.value).toEqual({ n: "[PII]", d: "[PII]" });

        CalcAUY.setSecurityPolicy({ sensitive: true });
    });

    it("deve mostrar um nó específico com pii: false mesmo com política sensitive: true", () => {
        CalcAUY.setSecurityPolicy({ sensitive: true });
        const calc = CalcAUY.from(100).setMetadata("pii", false);
        const sanitized = sanitizeAST(calc.getAST()) as any;
        expect(sanitized.value.n).toBe("100");
    });

    it("deve respeitar a política global na sanitização de objetos de erro", () => {
        CalcAUY.setSecurityPolicy({ sensitive: true });
        const context = { rawInput: "123.45" };
        expect(sanitizeObject(context)).toEqual({ rawInput: "[PII]" });

        CalcAUY.setSecurityPolicy({ sensitive: false });
        expect(sanitizeObject(context)).toEqual({ rawInput: "123.45" });

        CalcAUY.setSecurityPolicy({ sensitive: true });
    });
});
