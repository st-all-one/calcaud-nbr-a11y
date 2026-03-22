/**
 * Implementa estratégias de arredondamento para BigInt com escala fixa.
 */

/**
 * Arredondamento "Half-Up" (Padrão escolar).
 * Se a parte fracionária for >= 0.5, arredonda para cima. Caso contrário, para baixo.
 */
export function roundHalfUp(value: bigint, currentScale: number, targetDecimals: number): bigint {
    const scaleDiff = BigInt(currentScale - targetDecimals);
    if (scaleDiff <= 0n) return value; // Sem necessidade de arredondamento se a escala alvo for maior

    const divisor = 10n ** scaleDiff;
    const remainder = value % divisor;
    const half = divisor / 2n;

    let result = value / divisor;
    
    // Tratamento para números negativos
    if (value < 0n) {
        if (remainder <= -half) {
             result -= 1n;
        }
    } else {
        if (remainder >= half) {
            result += 1n;
        }
    }

    return result;
}

/**
 * Arredondamento "Half-Even" (Bancário).
 * Se a parte fracionária for 0.5, arredonda para o inteiro par mais próximo.
 */
export function roundHalfEven(value: bigint, currentScale: number, targetDecimals: number): bigint {
    const scaleDiff = BigInt(currentScale - targetDecimals);
    if (scaleDiff <= 0n) return value;

    const divisor = 10n ** scaleDiff;
    const remainder = value % divisor;
    const half = divisor / 2n;
    
    let result = value / divisor;

    // Se o resto for exatamente metade
    if (remainder === half || remainder === -half) {
        // Se o resultado atual for ímpar, arredonda para o par (soma/subtrai 1)
        if (result % 2n !== 0n) {
             if (value < 0n) {
                 result -= 1n;
             } else {
                 result += 1n;
             }
        }
    } else {
        // Comportamento normal de Half-Up para outros casos
        if (value < 0n) {
             if (remainder < -half) result -= 1n;
        } else {
             if (remainder > half) result += 1n;
        }
    }

    return result;
}

/**
 * Arredondamento "Truncate" (Floor para positivos, Ceil para negativos em direção a zero).
 * Simplesmente descarta a precisão extra.
 */
export function roundTruncate(value: bigint, currentScale: number, targetDecimals: number): bigint {
    const scaleDiff = BigInt(currentScale - targetDecimals);
    if (scaleDiff <= 0n) return value;

    const divisor = 10n ** scaleDiff;
    return value / divisor;
}

/**
 * Arredondamento "Ceil".
 * Sempre arredonda em direção ao infinito positivo.
 */
export function roundCeil(value: bigint, currentScale: number, targetDecimals: number): bigint {
    const scaleDiff = BigInt(currentScale - targetDecimals);
    if (scaleDiff <= 0n) return value;

    const divisor = 10n ** scaleDiff;
    const remainder = value % divisor;
    
    let result = value / divisor;

    if (remainder > 0n) {
        result += 1n;
    }
    // Para negativos, a divisão inteira já faz o "ceil" em direção a zero, que é maior que o valor original
    // Ex: -1.1 -> -1 (que é > -1.1)

    return result;
}
