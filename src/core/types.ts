/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { RoundingStrategy } from "./constants.ts";

/**
 * Supported Locales for verbal and monetary formatting.
 */
export type CalcAUYLocale =
    | "pt-BR"
    | "en-US"
    | "en-EU"
    | "es-ES"
    | "fr-FR"
    | "de-DE"
    | "ru-RU"
    | "zh-CN"
    | "ja-JP";

/**
 * Minimal interface for KaTeX library to ensure strict typing.
 */
export interface IKatex {
    /**
     * Renders a TeX expression into an HTML string.
     */
    renderToString(latex: string, options?: KaTeXOptions): string;
}

/**
 * Simplified KaTeX options interface.
 */
export interface KaTeXOptions {
    displayMode?: boolean;
    throwOnError?: boolean;
    [key: string]: unknown;
}

/**
 * Supported Currencies based on Locales, allowing custom strings as well.
 */
export type CalcAUYCurrency =
    | "BRL"
    | "USD"
    | "EUR"
    | "RUB"
    | "CNY"
    | "JPY"
    | (string & Record<never, never>);

/**
 * Global configuration options for outputs.
 */
export interface OutputOptions {
    decimalPrecision?: number;
    locale?: CalcAUYLocale;
    currency?: CalcAUYCurrency;
    roundStrategy?: RoundingStrategy;
}
