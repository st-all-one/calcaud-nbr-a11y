/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { getLogger, type Logger } from "@logtape";
import { LOG_NAMESPACE } from "../core/constants.ts";

/**
 * Pre-configured logger for the library using LogTape 2.0.
 */
export const logger: Logger = getLogger(LOG_NAMESPACE);

/**
 * Creates a sub-logger for specific namespaces.
 */
export function getSubLogger(subName: string): Logger {
    return getLogger([...LOG_NAMESPACE, subName]);
}

/**
 * Utility to measure execution time of a function using the Temporal API.
 * Returns a tuple [result, durationInMsString].
 */
export function measureTime<T>(fn: () => T): [T, string] {
    // @ts-ignore: Temporal is native in modern Deno but might lack types in some environments
    // deno-lint-ignore no-undef
    const start = Temporal.Now.instant();
    const result = fn();
    // @ts-ignore: Temporal is native in modern Deno but might lack types in some environment
    // deno-lint-ignore no-undef
    const end = Temporal.Now.instant();
    const duration = end.since(start);
    // @ts-ignore: Duration is calculated using Temporal's native API
    return [result, `${duration.total({ unit: "milliseconds" }).toFixed(4)}ms`];
}
