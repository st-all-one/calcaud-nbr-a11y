/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Generates an SVG string based on calculation results.
 */
export function generateSVG(
    html: string,
    fullLatex: string,
): string {
    const scaleFactor = 1.3;
    const averagePxPerChar = 8;
    const paddingHorizontal = 16;
    const paddingVertical = 16;

    const estimatedWidth: number = (fullLatex.length * averagePxPerChar * scaleFactor)
        + (paddingHorizontal * 1.5);
    const finalWidth: number = Math.max(300, Math.min(1000, Math.ceil(estimatedWidth)));

    let verticalExpansion = 0;
    const fracMatches: RegExpMatchArray | null = fullLatex.match(/\\frac/g);
    if (fracMatches) { verticalExpansion += fracMatches.length * 15; }
    const sqrtMatches: RegExpMatchArray | null = fullLatex.match(/\\sqrt/g);
    if (sqrtMatches) { verticalExpansion += sqrtMatches.length * 25; }

    const baseHeight: number = (24 * scaleFactor) + (paddingVertical * 2) + verticalExpansion;
    const finalHeight: number = Math.max(80, Math.min(1000, Math.ceil(baseHeight)));

    return `
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 ${finalWidth} ${finalHeight}"
  width="${finalWidth}"
  height="${finalHeight}"
  preserveAspectRatio="xMidYMid meet"
  role="img"
  style="background: white; border-radius: 8px; border: 1px solid #eee;"
>
  <foreignObject width="100%" height="100%">
    <div
      xmlns="http://www.w3.org/1999/xhtml"
      style="
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        width: 100%;
        box-sizing: border-box;
        padding: ${paddingVertical}px ${paddingHorizontal}px;
        margin: 0;
      "
    >
      <div style="font-size: ${scaleFactor}em; margin: 0; color: #333;">
        ${html}
      </div>
    </div>
  </foreignObject>
</svg>`.trim();
}
