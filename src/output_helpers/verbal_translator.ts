import type { LocaleLang } from "./options.ts";
import { VERBAL_TOKENS, VERBAL_TRANSLATIONS } from "./i18n.ts";

/**
 * Traduz a expressão verbal tokenizada para o locale especificado.
 * @param template A string contendo tokens (ex: "10{#ADD#}20").
 * @param resultValue O valor final calculado formatado como string decimal (ex: "30.00").
 * @param locale O idioma alvo.
 * @param roundingMethod O nome do método de arredondamento utilizado.
 */
export function translateVerbal(
    template: string,
    resultValue: string,
    locale: LocaleLang,
    roundingMethod: string,
): string {
    const dict = VERBAL_TRANSLATIONS[locale];
    let output = template;

    // 1. Substituir Tokens de Operação
    // Itera sobre as chaves do dicionário para substituir tokens conhecidos
    // A ordem importa pouco pois os tokens são únicos

    // Mapeamento reverso manual ou iterar sobre VERBAL_TOKENS
    const tokens = Object.entries(VERBAL_TOKENS) as [keyof typeof VERBAL_TOKENS, string][];

    for (const [key, token] of tokens) {
        if (key === "COMMA" || key === "ROUNDING") { continue; // Tratamento especial depois
         }
        // replaceAll está disponível em ambientes modernos (ES2021+), Deno suporta.
        output = output.replaceAll(token, dict[key]);
    }

    // 2. Formatar Números na Expressão
    // A expressão original contém números como "10.50".
    // Precisamos substituir o ponto decimal pelo separador verbal (ex: " vírgula " ou " point ").

    // Estratégia simples: Substituir todos os pontos que estão entre dígitos.
    output = output.replace(/(\d)\.(\d)/g, `$1${dict.COMMA}$2`);

    // 3. Adicionar o Resultado Final e o Arredondamento
    const finalResultVerbal = resultValue.replace(".", dict.COMMA);
    const roundingInfo = `${dict.ROUNDING}${roundingMethod})`;

    return `${output}${dict.EQ}${finalResultVerbal}${roundingInfo}`;
}
