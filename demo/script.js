// Função para carregar exemplos via API (Utilizando toHTML autocontido)
async function loadExamples() {
  const grid = document.getElementById("grid");
  if (!grid) return;

  try {
    const response = await fetch("/api/examples");
    if (!response.ok) throw new Error("Falha ao carregar exemplos do servidor.");
    const examples = await response.json();

    grid.innerHTML = ""; 

    examples.forEach((ex) => {
      const article = document.createElement("article");
      article.className = "card";
      
      article.innerHTML = `
        <h3 style="color: var(--primary);">${ex.title}</h3>
        <p><strong>Cenário:</strong> ${ex.params}</p>
        
        <div class="card-code" aria-label="Código fonte executado">
<code>${ex.source || "// Código não disponível"}</code>
        </div>

        <!-- Renderiza o HTML pronto enviado pelo servidor via toHTML() -->
        <div class="card-math-render" aria-label="Expressão matemática: ${ex.verbal}">
          ${ex.html}
        </div>

        <p style="font-size: 1.5rem; margin-top: auto;">
          <strong>Total: R$ ${ex.result}</strong>
        </p>
      `;
      grid.appendChild(article);
    });
  } catch (err) {
    grid.innerHTML = `<p class="error" role="alert">Erro: ${err.message}</p>`;
    console.error("Erro no carregamento:", err);
  }
}

// Lógica do formulário interativo (Simulador)
const simulationForm = document.getElementById("f");
if (simulationForm) {
  simulationForm.onsubmit = async (e) => {
    e.preventDefault();
    const resTxt = document.getElementById("res-txt");
    const resMath = document.getElementById("res-math");
    const resBox = document.getElementById("res-box");

    if (!resTxt || !resMath) return;

    resTxt.textContent = "Processando cálculo financeiro auditável...";
    resMath.innerHTML = "";
    resBox.setAttribute("aria-busy", "true");

    const payload = {
      principal: document.getElementById("p").value,
      rate: document.getElementById("r").value,
      time: document.getElementById("t").value,
    };

    try {
      const response = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Erro no cálculo do servidor.");
      const data = await response.json();

      // Atualiza o texto amigável para leitores de tela
      resTxt.textContent = data.verbal;
      resBox.setAttribute("aria-busy", "false");

      // Injeta o HTML pronto (KaTeX SSR) enviado pelo servidor
      // Note que NÃO usamos mais data.latex aqui.
      resMath.innerHTML = data.html;

    } catch (err) {
      resTxt.textContent = "Erro: " + err.message;
      resBox.setAttribute("aria-busy", "false");
      console.error("Erro no cálculo:", err);
    }
  };
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadExamples);
} else {
  loadExamples();
}
