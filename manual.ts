import { CalcAUD } from "./mod.ts";

const calc = CalcAUD.from(10).div(2).pow(3).commit(4);

console.log(calc.toCentsInBigInt());
console.log(calc.toUnicode());
console.log(calc.toLaTeX());
console.log(calc.toVerbalA11y());
