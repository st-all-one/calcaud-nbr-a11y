import { roundToPrecisionNBR5891 } from "./rounding.ts";
import { DEFAULT_DISPLAY_PRECISION, INTERNAL_CALCULATION_PRECISION, INTERNAL_SCALE_FACTOR, KATEX_CSS_MINIFIED } from "./constants.ts";
import { calculateBigIntPower, calculateNthRoot } from "./math_utils.ts";
import katex from "@katex";

/**
 * Representa qualquer valor que possa ser convertido em um montante auditável.
 */
export type NumericValue = string | number | bigint | AuditableAmount;

/**
 * Classe principal para cálculos financeiros precisos, auditáveis e acessíveis.
 */
export class AuditableAmount {
    private readonly accumulatedValue: bigint;
    private readonly activeTermValue: bigint;
    private readonly accumulatedExpression: string;
    private readonly activeTermExpression: string;
    private readonly accumulatedVerbal: string;
    private readonly activeTermVerbal: string;
    private readonly accumulatedUnicode: string;
    private readonly activeTermUnicode: string;

    // Cache estático para o CSS do KaTeX para evitar múltiplas leituras de disco
    private static cachedKaTeXCSS: string | null = null;

    private constructor(
        accumulatedValue: bigint,
        activeTermValue: bigint,
        accumulatedExpression: string,
        activeTermExpression: string,
        accumulatedVerbal: string,
        activeTermVerbal: string,
        accumulatedUnicode: string,
        activeTermUnicode: string,
    ) {
        this.accumulatedValue = accumulatedValue;
        this.activeTermValue = activeTermValue;
        this.accumulatedExpression = accumulatedExpression;
        this.activeTermExpression = activeTermExpression;
        this.accumulatedVerbal = accumulatedVerbal;
        this.activeTermVerbal = activeTermVerbal;
        this.accumulatedUnicode = accumulatedUnicode;
        this.activeTermUnicode = activeTermUnicode;
    }

    static from(value: NumericValue): AuditableAmount {
        if (value instanceof AuditableAmount) { return value; }
        const rawValue = typeof value === "bigint"
            ? value * INTERNAL_SCALE_FACTOR
            : this.parseStringValue(value.toString());
        const initialExpression = value.toString();
        const initialVerbal = initialExpression.replace(".", ",");
        const initialUnicode = initialExpression;
        return new AuditableAmount(
            0n,
            rawValue,
            "",
            initialExpression,
            "",
            initialVerbal,
            "",
            initialUnicode,
        );
    }

    private static parseStringValue(value: string): bigint {
        const numericPattern = /^(-?\d+)(?:\.(\d+))?$/;
        const match = value.match(numericPattern);
        if (!match) { throw new Error(`Invalid numeric format: ${value}`); }
        const [_, integerPart, decimalPart = ""] = match;
        const isNegative = integerPart.startsWith("-");
        const absoluteInteger = BigInt(integerPart.replace("-", "")) * INTERNAL_SCALE_FACTOR;
        let absoluteDecimal = 0n;
        if (decimalPart) {
            const normalizedDecimal = decimalPart.slice(0, INTERNAL_CALCULATION_PRECISION + 1).padEnd(
                INTERNAL_CALCULATION_PRECISION + 1,
                "0",
            );
            absoluteDecimal = BigInt(normalizedDecimal.slice(0, INTERNAL_CALCULATION_PRECISION));
            if (Number(normalizedDecimal[INTERNAL_CALCULATION_PRECISION]) >= 5) { absoluteDecimal += 1n; }
        }
        const totalAbsoluteValue = absoluteInteger + absoluteDecimal;
        return isNegative ? -totalAbsoluteValue : totalAbsoluteValue;
    }

    add(value: NumericValue): AuditableAmount {
        const other = AuditableAmount.from(value);
        const newAccumulatedValue = this.accumulatedValue + this.activeTermValue;
        return new AuditableAmount(
            newAccumulatedValue,
            other.accumulatedValue + other.activeTermValue,
            this.getFullLaTeXExpression(),
            other.activeTermExpression,
            this.getFullVerbalExpression(),
            other.activeTermVerbal,
            this.getFullUnicodeExpression(),
            other.activeTermUnicode,
        );
    }

    sub(value: NumericValue): AuditableAmount {
        const other = AuditableAmount.from(value);
        const otherValue = other.accumulatedValue + other.activeTermValue;
        const newAccumulatedValue = this.accumulatedValue + this.activeTermValue;
        return new AuditableAmount(
            newAccumulatedValue,
            -otherValue,
            this.getFullLaTeXExpression(),
            `- ${other.activeTermExpression}`,
            this.getFullVerbalExpression(),
            `menos ${other.activeTermVerbal}`,
            this.getFullUnicodeExpression(),
            `- ${other.activeTermUnicode}`,
        );
    }

    mult(value: NumericValue): AuditableAmount {
        const other = AuditableAmount.from(value);
        const otherValue = other.accumulatedValue + other.activeTermValue;
        const nextActiveValue = (this.activeTermValue * otherValue) / INTERNAL_SCALE_FACTOR;

        const nextActiveExpr = `${this.wrapLaTeX(this.activeTermExpression)} \\times ${
            other.wrapLaTeX(other.getFullLaTeXExpression())
        }`;
        const nextActiveVerbal = `${this.activeTermVerbal} multiplicado por ${other.getFullVerbalExpression()}`;
        const nextActiveUnicode = `${this.wrapUnicode(this.activeTermUnicode)} × ${
            this.wrapUnicode(other.getFullUnicodeExpression())
        }`;

        return new AuditableAmount(
            this.accumulatedValue,
            nextActiveValue,
            this.accumulatedExpression,
            nextActiveExpr,
            this.accumulatedVerbal,
            nextActiveVerbal,
            this.accumulatedUnicode,
            nextActiveUnicode,
        );
    }

    div(value: NumericValue): AuditableAmount {
        const other = AuditableAmount.from(value);
        const otherValue = other.accumulatedValue + other.activeTermValue;
        if (otherValue === 0n) { throw new Error("Division by zero"); }
        const nextActiveValue = (this.activeTermValue * INTERNAL_SCALE_FACTOR) / otherValue;

        const nextActiveExpr = `\\frac{${this.activeTermExpression}}{${other.getFullLaTeXExpression()}}`;
        const nextActiveVerbal = `${this.activeTermVerbal} dividido por ${other.getFullVerbalExpression()}`;
        const nextActiveUnicode = `${this.wrapUnicode(this.activeTermUnicode)} ÷ ${
            this.wrapUnicode(other.getFullUnicodeExpression())
        }`;

        return new AuditableAmount(
            this.accumulatedValue,
            nextActiveValue,
            this.accumulatedExpression,
            nextActiveExpr,
            this.accumulatedVerbal,
            nextActiveVerbal,
            this.accumulatedUnicode,
            nextActiveUnicode,
        );
    }

    pow(exponent: string | number): AuditableAmount {
        const baseValue = this.activeTermValue;
        const baseExpr = this.wrapLaTeX(this.activeTermExpression);
        const baseVerbal = this.activeTermVerbal;
        const baseUnicode = this.wrapUnicode(this.activeTermUnicode);

        let nextExpr: string;
        let nextVerbal: string;
        let nextUnicode: string;
        let nextValue: bigint;

        const expStr = exponent.toString();
        if (expStr.includes("/")) {
            const [num, den] = expStr.split("/").map((s) => BigInt(s.trim()));
            nextValue = calculateNthRoot(
                calculateBigIntPower(baseValue, num) * calculateBigIntPower(INTERNAL_SCALE_FACTOR, den - num),
                den,
            );

            const denSup = AuditableAmount.toSuperscript(den.toString());
            const numSup = num === 1n ? "" : AuditableAmount.toSuperscript(num.toString());

            nextExpr = num === 1n ? `\\sqrt[${den}]{${baseExpr}}` : `\\sqrt[${den}]{${baseExpr}^{${num}}}`;
            nextVerbal = `raiz de índice ${den} de ${baseVerbal}${num === 1n ? "" : " elevado a " + num}`;
            nextUnicode = `${denSup === "²" ? "" : denSup}√(${baseUnicode}${numSup})`;
        } else {
            const exp = BigInt(expStr);
            const expSup = AuditableAmount.toSuperscript(expStr);

            nextExpr = `{${baseExpr}}^{${expStr}}`;
            nextVerbal = `${baseVerbal} elevado a ${expStr}`;
            nextUnicode = `${baseUnicode}${expSup}`;

            if (exp === 0n) { nextValue = INTERNAL_SCALE_FACTOR; }
            else if (exp > 0n) {
                nextValue = calculateBigIntPower(baseValue, exp)
                    / calculateBigIntPower(INTERNAL_SCALE_FACTOR, exp - 1n);
            } else {
                const denVal = calculateBigIntPower(baseValue, -exp)
                    / calculateBigIntPower(INTERNAL_SCALE_FACTOR, (-exp) - 1n);
                nextValue = (INTERNAL_SCALE_FACTOR * INTERNAL_SCALE_FACTOR) / denVal;
            }
        }
        return new AuditableAmount(
            this.accumulatedValue,
            nextValue,
            this.accumulatedExpression,
            nextExpr,
            this.accumulatedVerbal,
            nextVerbal,
            this.accumulatedUnicode,
            nextUnicode,
        );
    }

    group(): AuditableAmount {
        const totalValue = this.accumulatedValue + this.activeTermValue;
        const groupedExpr = `\\left( ${this.getFullLaTeXExpression()} \\right)`;
        const groupedVerbal = `em grupo, ${this.getFullVerbalExpression()}, fim do grupo`;
        const groupedUnicode = `(${this.getFullUnicodeExpression()})`;
        return new AuditableAmount(0n, totalValue, "", groupedExpr, "", groupedVerbal, "", groupedUnicode);
    }

    commit(decimals: number = DEFAULT_DISPLAY_PRECISION): string {
        const finalValue = this.accumulatedValue + this.activeTermValue;
        const rounded = roundToPrecisionNBR5891(finalValue, INTERNAL_CALCULATION_PRECISION, decimals);
        return this.formatBigIntToString(rounded, decimals);
    }

    private formatBigIntToString(value: bigint, decimals: number): string {
        const isNeg = value < 0n;
        const abs = isNeg ? -value : value;
        const scale = 10n ** BigInt(decimals);
        const int = abs / scale;
        const frac = (abs % scale).toString().padStart(decimals, "0");
        return `${isNeg ? "-" : ""}${int}.${frac}`;
    }

    toLaTeX(decimals: number = DEFAULT_DISPLAY_PRECISION): string {
        return `$$ ${this.getFullLaTeXExpression()} = ${this.commit(decimals)} $$`;
    }

    toHTML(decimals: number = DEFAULT_DISPLAY_PRECISION): string {
        if (!AuditableAmount.cachedKaTeXCSS) {
            AuditableAmount.cachedKaTeXCSS = KATEX_CSS_MINIFIED;
        }
        const latex = this.getFullLaTeXExpression() + " = " + this.commit(decimals);
        const renderedHTML = katex.renderToString(latex, {
            displayMode: true,
            throwOnError: false,
        });
        return `
<div class="auditable-amount-container" aria-label="${this.toVerbal(decimals)}">
  <style>
    ${AuditableAmount.cachedKaTeXCSS}
    .auditable-amount-container { margin: 1em 0; overflow-x: auto; }
  </style>
  ${renderedHTML}
</div>`.trim();
    }

    toVerbal(decimals: number = DEFAULT_DISPLAY_PRECISION): string {
        const result = this.commit(decimals).replace(".", " vírgula ");
        return `${this.getFullVerbalExpression()} é igual a ${result}`;
    }

    /**
     * Gera uma representação em string Unicode para visualização em CLI.
     */
    toUnicode(decimals: number = DEFAULT_DISPLAY_PRECISION): string {
        return `${this.getFullUnicodeExpression()} = ${this.commit(decimals)}`;
    }

    private getFullLaTeXExpression(): string {
        let expr = this.accumulatedExpression;
        if (this.accumulatedExpression && this.activeTermExpression) {
            expr += this.activeTermExpression.startsWith("-") ? " " : " + ";
        }
        expr += this.activeTermExpression;
        return expr;
    }

    private getFullVerbalExpression(): string {
        let verbal = this.accumulatedVerbal;
        if (this.accumulatedVerbal && this.activeTermVerbal) {
            verbal += this.activeTermVerbal.includes("menos") ? " " : " mais ";
        }
        verbal += this.activeTermVerbal;
        return verbal;
    }

    private getFullUnicodeExpression(): string {
        let unicode = this.accumulatedUnicode;
        if (this.accumulatedUnicode && this.activeTermUnicode) {
            unicode += this.activeTermUnicode.startsWith("-") ? " " : " + ";
        }
        unicode += this.activeTermUnicode;
        return unicode;
    }

    private wrapLaTeX(expr: string): string {
        const trimmed = expr.trim();
        if (
            !trimmed.startsWith("\\left(") && !trimmed.startsWith("{")
            && (trimmed.includes("+") || trimmed.includes(" - "))
        ) {
            return `\\left( ${expr} \\right)`;
        }
        return expr;
    }

    private wrapUnicode(expr: string): string {
        const trimmed = expr.trim();
        if (
            !trimmed.startsWith("(") && (trimmed.includes("+") || trimmed.includes(" - "))
        ) {
            return `(${expr})`;
        }
        return expr;
    }

    private static toSuperscript(s: string): string {
        const map: Record<string, string> = {
            "0": "⁰",
            "1": "¹",
            "2": "²",
            "3": "³",
            "4": "⁴",
            "5": "⁵",
            "6": "⁶",
            "7": "⁷",
            "8": "⁸",
            "9": "⁹",
            "+": "⁺",
            "-": "⁻",
            "(": "⁽",
            ")": "⁾",
            ".": "·",
            ",": "·",
        };
        return s.split("").map((c) => map[c] || c).join("");
    }

    toString(): string {
        return this.commit();
    }
}
