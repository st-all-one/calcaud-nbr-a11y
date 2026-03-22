import { assertEquals } from "@std/assert";
import { AuditableAmount } from "../mod.ts";

Deno.test("Unicode Output - Operações Básicas", () => {
  const calc = AuditableAmount.from(10).add(5).mult(2);
  // Esperado: "10 + 5 × 2 = 20.000000"
  assertEquals(calc.toUnicode(), "10 + 5 × 2 = 20.000000");
});

Deno.test("Unicode Output - Exponenciação e Grupos", () => {
  const pow = AuditableAmount.from(10).add(5).group().pow(2);
  // Esperado: "(10 + 5)² = 225.000000"
  assertEquals(pow.toUnicode(), "(10 + 5)² = 225.000000");
});

Deno.test("Unicode Output - Raízes Complexas", () => {
  const root = AuditableAmount.from(8).pow("1/3");
  // Esperado: "³√(8) = 2.000000"
  assertEquals(root.toUnicode(), "³√(8) = 2.000000");

  const squareRoot = AuditableAmount.from(81).pow("1/2");
  // Quadrada omite o índice por convenção: "√(81) = 9.000000"
  assertEquals(squareRoot.toUnicode(), "√(81) = 9.000000");
});

Deno.test("Unicode Output - Cadeia Longa", () => {
  const complex = AuditableAmount.from(100).div(2).sub(10).group().mult(2);
  assertEquals(complex.toUnicode(0), "(100 ÷ 2 - 10) × 2 = 80.0");
});
