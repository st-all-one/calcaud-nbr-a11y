/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { CalcAUYLogic } from "./builder.ts";
import type { CalculationNode } from "./ast/types.ts";
import { createCacheSession } from "./core/rational.ts";
import { DEFAULT_INSTANCE_CONFIG, type SignatureEncoder } from "./utils/sanitizer.ts";
import { generateSignature } from "./utils/security.ts";
import { CalcAUYError } from "./core/errors.ts";
import type { InstanceConfig } from "./core/types.ts";

/**
 * CalcAUY - Primary factory for creating isolated calculation instances.
 *
 * This class provides the entry point for initializing calculation contexts
 * with specific security and rounding policies, ensuring deterministic results
 * and auditability across different domains.
 */
export class CalcAUY {
    /**
     * Creates a new `CalcAUYLogic` instance with isolated configurations.
     *
     * @param config - Instance configuration (salt, encoder, sensitive, contextLabel).
     * @returns A CalcAUYLogic builder instance.
     *
     * @example Financial: Compound Interest Calculation
     * ```ts
     * const Finance = CalcAUY.create({
     *     contextLabel: "investment-portfolio",
     *     salt: "vault-secret-2026",
     *     roundStrategy: "HALF_UP",
     * });
     *
     * const projection = Finance.from(10000)
     *     .mult(
     *         Finance.from(1)
     *             .add("5.25%")
     *             .group()
     *             .pow(5),
     *     );
     *
     * const result = await projection.commit();
     *
     * console.log(result.toMonetary()); // e.g., "R$ 12.915,48"
     * ```
     *
     * @example Legal: Sentence Penalty with Recidivism
     * ```ts
     * const Judiciary = CalcAUY.create({
     *     contextLabel: "criminal-court-penalty",
     *     salt: "justice-protocol-01",
     *     roundStrategy: "TRUNCATE",
     * });
     *
     * const fine = Judiciary.from(5000)
     *     .mult(1.5).setMetadata("ref", "Recidivism multiplier")
     *     .add(1200).setMetadata("ref", "Court costs")
     *     .setMetadata("case_id", "2026-ABC-99");
     *
     * const result = await fine.commit();
     *
     * console.log(result.toMonetary({ locale: "en-US" })); // $8,700.00
     * ```
     *
     * @example Healthcare: Pediatric Dosage Calculation
     * ```ts
     * const Pediatrics = CalcAUY.create({
     *   contextLabel: "icu-dosage-safety",
     *   salt: "hospital-unit-7",
     *   roundStrategy: "HALF_EVEN"
     * });
     *
     * const dose = await Pediatrics.from(12.5).setMetadata("info", "Weight in Kg")
     *   .mult("0.15").setMetadata("un", "mg/Kg")
     *   .setMetadata("drug", "Paracetamol")
     *   .commit();
     * ```
     */
    public static create<const T extends InstanceConfig & { contextLabel: string }>(
        config: T,
    ): CalcAUYLogic<T["contextLabel"], T> {
        if (!config || typeof config.contextLabel !== "string" || config.contextLabel.trim() === "") {
            throw new CalcAUYError(
                "invalid-syntax",
                "The 'contextLabel' parameter is required and must be a non-empty string to create an instance.",
            );
        }

        const fullConfig: Required<InstanceConfig> = {
            ...DEFAULT_INSTANCE_CONFIG,
            ...config,
        };

        const instanceId = Symbol(fullConfig.contextLabel);

        return new CalcAUYLogic<T["contextLabel"], T>(null, instanceId, fullConfig, null);
    }

    /**
     * Starts a new cache session for memory optimization in high-volume batch processing.
     *
     * This mechanism allows the engine to reuse AST literal nodes during a processing loop,
     * significantly reducing heap allocation and pressure on the Garbage Collector (GC).
     *
     * @example Financial: High-Volume Tax Processing (100k+ Invoices)
     * ```ts
     * const Billing = CalcAUY.create({ contextLabel: "invoice-system", salt: "vault-123" });
     *
     * {
     *   // Using block automatically closes the session at the end of the scope
     *   using _session = CalcAUY.createCacheSession();
     *
     *   for (const invoice of invoices) {
     *     // Repeated values like tax rates ("15%") are cached and shared across iterations,
     *     // preventing the creation of thousands of identical objects.
     *     const res = await Billing.from(invoice.total).mult("15%").commit();
     *     saveResult(res.toAuditTrace());
     *   }
     * }
     * ```
     *
     * @example Healthcare: Clinical Lab Result Standardization
     * ```ts
     * const Analytics = CalcAUY.create({ contextLabel: "lab-data", salt: "biosecure-key" });
     *
     * {
     *   using _session = CalcAUY.createCacheSession();
     *
     *   // Standardizing millions of patient results against a fixed correction factor.
     *   // The constant "1.00045" is instantiated once and reused for the entire batch.
     *   const correctionFactor = "1.00045";
     *   const normalized = patientData.map(record =>
     *     Analytics.from(record.raw_value).div(correctionFactor).commit()
     *   );
     * }
     * ```
     */
    public static createCacheSession(): Disposable {
        return createCacheSession();
    }

    /**
     * Validates the integrity of a signed calculation trace.
     *
     * This method follows a "Fail-Fast" philosophy: if the signature is invalid, it throws
     * a CalcAUYError with detailed forensic evidence (expected vs. received hash),
     * ensuring that tampered data never enters critical business logic.
     *
     * @param ast - The signed audit trace (JSON string or object).
     * @param config - Security configuration (salt and encoder).
     * @returns true if the signature is valid.
     * @throws {CalcAUYError} if signature validation fails or integrity is breached.
     *
     * @example Legal: Detecting Tampering in Judicial Sentences
     * ```ts
     * try {
     *   // Simulate receiving a signed trace from an external court system
     *   const receivedRecord = JSON.parse(externallyProvidedTrace);
     *
     *   // Fraud Attempt: Attacker tries to change the rounding strategy to "TRUNCATE"
     *   // to slightly lower the penalty amount in a large database.
     *   receivedRecord.roundStrategy = "TRUNCATE";
     *
     *   await CalcAUY.checkIntegrity(receivedRecord, { salt: "justice-system-salt" });
     * } catch (err) {
     *   if (err instanceof CalcAUYError && err.title === "integrity-critical-violation") {
     *     // The error provides the exact mismatch context for audit logs
     *     console.error("CRITICAL: Anti-tampering layer detected record modification!");
     *     sendToCyberSecurity(err.context);
     *   }
     * }
     * ```
     *
     * @example Audit: Massive Integrity Validation of Stored Records
     * ```ts
     * // During a periodic security sweep, we verify thousands of records stored
     * // in a database to ensure no unauthorized database-level modifications occurred.
     * const archivedLogs = await db.query("SELECT id, trace FROM calculation_archives");
     *
     * for (const log of archivedLogs) {
     *   // checkIntegrity is used here to validate the 'bit-by-bit' state of the record
     *   // without the computational cost of full object re-hydration.
     *   await CalcAUY.checkIntegrity(log.trace, {
     *     salt: process.env.MASTER_AUDIT_SALT
     *   });
     * }
     * ```
     */
    public static async checkIntegrity(
        ast: CalculationNode | string | object,
        config: { salt: string; encoder?: SignatureEncoder },
    ): Promise<true | CalcAUYError> {
        let payload: Record<string, unknown>;

        if (typeof ast === "string") {
            try {
                payload = JSON.parse(ast);
            } catch {
                throw new CalcAUYError("invalid-syntax", "Failed to process JSON for signature verification.");
            }
        } else {
            payload = ast as Record<string, unknown>;
        }

        if (!payload || typeof payload !== "object" || !payload.signature) {
            throw new CalcAUYError(
                "integrity-critical-violation",
                "Integrity signature missing from audit trace.",
            );
        }

        const dataToVerify = payload.data || {
            ast: payload.ast,
            finalResult: payload.finalResult,
            roundStrategy: payload.roundStrategy,
        };

        const encoder = config.encoder || DEFAULT_INSTANCE_CONFIG.encoder;
        const expectedHash = await generateSignature(
            dataToVerify,
            config.salt,
            encoder,
        );

        if (payload.signature !== expectedHash) {
            throw new CalcAUYError(
                "integrity-critical-violation",
                "Integrity violation detected: signature does not match content.",
                { expected: expectedHash, received: payload.signature as string },
            );
        }

        return true;
    }
}
