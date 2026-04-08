import { CalcAUY } from "./mod.ts";
// import { configure, getConsoleSink, type LogRecord } from "@logtape";

// await configure({
//     sinks: {
//         console: getConsoleSink({
//             formatter(r: LogRecord): unknown[] {
//                 return [r.properties];
//             },
//         }),
//     },
//     loggers: [
//         {
//             category: "calc-auy",
//             lowestLevel: "debug",
//             sinks: ["console"],
//         },
//     ],
// });

const calc = CalcAUY.from(100).pow(2).commit();

console.log("String => ", calc.toStringNumber());
console.log("MOnetary => ", calc.toMonetary({ locale: "de-DE" }));
console.log("MOnetary => ", calc.toMonetary({ locale: "en-EU" }));
console.log("MOnetary => ", calc.toMonetary({ locale: "fr-FR" }));
console.log("MOnetary => ", calc.toMonetary({ locale: "ja-JP" }));
console.log("MOnetary => ", calc.toMonetary({ locale: "pt-BR" }));
console.log("MOnetary => ", calc.toMonetary({ locale: "zh-CN" }));
console.log("===============================================");
