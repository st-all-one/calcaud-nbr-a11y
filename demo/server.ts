import { AuditableAmount } from "../mod.ts";
import { join, fromFileUrl, dirname } from "https://deno.land/std@0.224.0/path/mod.ts";

const __dirname = dirname(fromFileUrl(import.meta.url));
const ROOT = dirname(__dirname);

const getExamples = () => [
  { 
    title: "Baskhara (Raiz Positiva)", 
    params: "a=1, b=-5, c=6", 
    source: "const delta = b.pow(2).sub(AuditableAmount.from(4).mult(a).mult(c)).group();\nconst x1 = b.mult(-1).add(delta.pow('1/2')).group().div(a.mult(2).group());",
    calc: (() => {
      const a = AuditableAmount.from(1);
      const b = AuditableAmount.from(-5);
      const c = AuditableAmount.from(6);
      const delta = b.pow(2).sub(AuditableAmount.from(4).mult(a).mult(c)).group();
      return b.mult(-1).add(delta.pow("1/2")).group().div(a.mult(2).group());
    })()
  },
  { 
    title: "SAC (Parcela N=10)", 
    params: "Saldo=200k, n=100, i=0.8%, Pago=9", 
    source: "const amort = saldo.div(n).group();\nconst juros = saldo.sub(amort.mult(9)).group().mult(0.008).group();\nconst prestacao = amort.add(juros);",
    calc: (() => {
      const saldo = AuditableAmount.from(200000);
      const n = 100;
      const amort = saldo.div(n).group();
      const juros = saldo.sub(amort.mult(9)).group().mult(0.008).group();
      return amort.add(juros);
    })()
  }
].map(ex => ({
  title: ex.title,
  params: ex.params,
  source: ex.source,
  html: ex.calc.toHTML(4), 
  verbal: ex.calc.toVerbal(4),
  result: ex.calc.commit(4)
}));

async function serveFile(path: string) {
  const ext = path.split(".").pop();
  const mimes: Record<string, string> = {
    html: "text/html; charset=utf-8",
    js: "application/javascript",
    css: "text/css",
    woff: "font/woff",
    woff2: "font/woff2",
    ttf: "font/ttf"
  };
  try {
    const data = await Deno.readFile(path);
    return new Response(data, { 
      headers: { 
        "content-type": mimes[ext!] || "application/octet-stream",
        "cache-control": "no-store, must-revalidate" // Força recarregamento do script.js
      } 
    });
  } catch {
    return new Response("Not Found", { status: 404 });
  }
}

Deno.serve({ port: 8000 }, async (req) => {
  const url = new URL(req.url);

  if (url.pathname === "/") return serveFile(join(__dirname, "index.html"));
  if (url.pathname === "/style.css") return serveFile(join(__dirname, "style.css"));
  if (url.pathname === "/script.js") return serveFile(join(__dirname, "script.js"));
  
  if (url.pathname === "/api/examples") return new Response(JSON.stringify(getExamples()), { 
    headers: { "content-type": "application/json", "cache-control": "no-store" } 
  });
  
  if (url.pathname === "/api/calculate") {
    try {
      const { principal, rate, time } = await req.json();
      const res = AuditableAmount.from(principal).mult(AuditableAmount.from(1).add(rate).group().pow(time));
      return new Response(JSON.stringify({ 
        result: res.commit(2), 
        html: res.toHTML(2), 
        verbal: res.toVerbal(2) 
      }), { headers: { "content-type": "application/json", "cache-control": "no-store" } });
    } catch {
      return new Response("Error", { status: 400 });
    }
  }
  
  if (url.pathname.startsWith("/assets/")) return serveFile(join(ROOT, url.pathname));
  return new Response("Not Found", { status: 404 });
});
