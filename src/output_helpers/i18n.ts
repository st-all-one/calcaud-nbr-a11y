import type { LocaleLang } from "./options.ts";

/**
 * Tokens internos usados para representar operações matemáticas de forma agnóstica à linguagem.
 */
export const VERBAL_TOKENS = {
    ADD: "{#ADD#}",
    SUB: "{#SUB#}",
    MULT: "{#MULT#}",
    DIV: "{#DIV#}",

    // Potenciação e Raízes
    POW: "{#POW#}", // "elevado a"
    ROOT_IDX: "{#ROOT_IDX#}", // "raiz de índice"
    ROOT_OF: "{#ROOT_OF#}", // "de" (após o índice)

    // Agrupamento
    GRP_START: "{#GRP_S#}",
    GRP_END: "{#GRP_E#}",

    // Conectores finais
    EQ: "{#EQ#}", // "é igual a"
    COMMA: "{#COMMA#}", // Separador decimal verbal
    ROUNDING: "{#ROUNDING#}", // Prefixo para indicar o método de arredondamento
} as const;

type TranslationSchema = Record<keyof typeof VERBAL_TOKENS, string>;

/**
 * Mapa de traduções para todos os locales suportados.
 */
export const VERBAL_TRANSLATIONS: Record<LocaleLang, TranslationSchema> = {
    "pt-BR": {
        ADD: " mais ",
        SUB: " menos ",
        MULT: " multiplicado por ",
        DIV: " dividido por ",
        POW: " elevado a ",
        ROOT_IDX: "raiz de índice ",
        ROOT_OF: " de ",
        GRP_START: "em grupo, ",
        GRP_END: ", fim do grupo",
        EQ: " é igual a ",
        COMMA: " vírgula ",
        ROUNDING: " (Arredondamento: ",
    },
    "en-US": {
        ADD: " plus ",
        SUB: " minus ",
        MULT: " multiplied by ",
        DIV: " divided by ",
        POW: " raised to the power of ",
        ROOT_IDX: "root with index ",
        ROOT_OF: " of ",
        GRP_START: "grouped, ",
        GRP_END: ", end of group",
        EQ: " equals ",
        COMMA: " point ",
        ROUNDING: " (Rounding: ",
    },
    "en-EU": { // Fallback to EN-US style but maybe "comma" for decimal? Keeping simple for now.
        ADD: " plus ",
        SUB: " minus ",
        MULT: " multiplied by ",
        DIV: " divided by ",
        POW: " raised to the power of ",
        ROOT_IDX: "root with index ",
        ROOT_OF: " of ",
        GRP_START: "grouped, ",
        GRP_END: ", end of group",
        EQ: " equals ",
        COMMA: " comma ",
        ROUNDING: " (Rounding: ",
    },
    "es-ES": {
        ADD: " más ",
        SUB: " menos ",
        MULT: " multiplicado por ",
        DIV: " dividido por ",
        POW: " elevado a ",
        ROOT_IDX: "raíz de índice ",
        ROOT_OF: " de ",
        GRP_START: "agrupado, ",
        GRP_END: ", fin del grupo",
        EQ: " es igual a ",
        COMMA: " coma ",
        ROUNDING: " (Redondeo: ",
    },
    "fr-FR": {
        ADD: " plus ",
        SUB: " moins ",
        MULT: " multiplié par ",
        DIV: " divisé par ",
        POW: " puissance ",
        ROOT_IDX: "racine d'indice ",
        ROOT_OF: " de ",
        GRP_START: "groupé, ",
        GRP_END: ", fin du groupe",
        EQ: " est égal à ",
        COMMA: " virgule ",
        ROUNDING: " (Arrondi: ",
    },
    "zh-CN": {
        ADD: " 加 ",
        SUB: " 减 ",
        MULT: " 乘以 ",
        DIV: " 除以 ",
        POW: " 的次方 ",
        ROOT_IDX: "根指数 ",
        ROOT_OF: " 的 ",
        GRP_START: "分组, ",
        GRP_END: ", 组结束",
        EQ: " 等于 ",
        COMMA: " 点 ",
        ROUNDING: " (舍入: ",
    },
    "ru-RU": {
        ADD: " плюс ",
        SUB: " минус ",
        MULT: " умножить на ",
        DIV: " разделить на ",
        POW: " в степени ",
        ROOT_IDX: "корень степени ",
        ROOT_OF: " из ",
        GRP_START: "в скобках, ",
        GRP_END: ", конец скобок",
        EQ: " равно ",
        COMMA: " запятая ",
        ROUNDING: " (Округление: ",
    },
    "ja-JP": {
        ADD: " 足す ",
        SUB: " 引く ",
        MULT: " 掛ける ",
        DIV: " 割る ",
        POW: " 乗 ",
        ROOT_IDX: "乗根 ",
        ROOT_OF: " の ",
        GRP_START: "括弧, ",
        GRP_END: ", 括弧閉じ",
        EQ: " は ",
        COMMA: " 点 ",
        ROUNDING: " (丸め: ",
    },
};
