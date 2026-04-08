/**
 * CalcAUY Demo - Frontend Script (Forense & Lab)
 */

async function init() {
    const categoriesContainer = document.getElementById("categories-container");
    const btnExecutar = document.getElementById("btn-executar");
    const iframe = document.getElementById("editor-iframe");

    // Load Examples
    try {
        const response = await fetch("/api/examples");
        const examples = await response.json();
        renderExamples(examples);
    } catch (err) {
        categoriesContainer.innerHTML = `<p class="error">Erro ao carregar exemplos: ${err.message}</p>`;
    }

    // Interactivity
    btnExecutar.addEventListener("click", async () => {
        const originalText = btnExecutar.textContent;
        btnExecutar.disabled = true;
        btnExecutar.textContent = "Auditoria em Processo...";

        try {
            const expression = await getCodeFromIframe(iframe);

            if (!expression) {
                alert("O editor não respondeu.");
                return;
            }

            const response = await fetch("/api/calculate", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "X-Requested-With": "CalcAUY-Demo"
                },
                body: JSON.stringify({ expression })
            });

            const data = await response.json();
            if (data.error) {
                alert("Erro: " + data.error);
            } else {
                updateInteractiveDisplay(data);
            }
        } catch (err) {
            alert("Erro de conexão.");
        } finally {
            btnExecutar.disabled = false;
            btnExecutar.textContent = originalText;
        }
    });

    // Theme Toggle
    document.getElementById("modo-tema").addEventListener("click", (e) => {
        e.preventDefault();
        const theme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", theme);
    });

    document.getElementById("alto-contraste").addEventListener("click", (e) => {
        e.preventDefault();
        document.body.classList.toggle("alto-contraste");
    });
}

async function getCodeFromIframe(iframe) {
    return new Promise((resolve) => {
        const handler = (event) => {
            if (event.data.type === "CODE_RESPONSE") {
                window.removeEventListener("message", handler);
                resolve(event.data.code);
            }
        };
        window.addEventListener("message", handler);
        iframe.contentWindow.postMessage({ type: "GET_CODE" }, "*");
        
        setTimeout(() => {
            window.removeEventListener("message", handler);
            resolve(null);
        }, 2000);
    });
}

function renderExamples(categories) {
    const container = document.getElementById("categories-container");
    container.innerHTML = "";

    for (const [groupName, groups] of Object.entries(categories)) {
        const section = document.createElement("div");
        section.className = "full-width";
        section.innerHTML = `<h3 style="border-bottom: 2px solid var(--accent); padding-bottom: 0.5rem; margin-top: 2rem;">${groupName}</h3>`;
        container.appendChild(section);

        for (const [method, list] of Object.entries(groups)) {
            list.forEach(ex => {
                const card = document.createElement("article");
                card.className = "example-card";
                card.innerHTML = `
                    <h4>${ex.title}</h4>
                    <p class="text-dim">${ex.context}</p>
                    <div class="code-block"><code>${ex.code}</code></div>
                    <div class="card-result">
                        <strong>Resultado Consolidado:</strong> ${ex.outputs.toStringNumber}
                    </div>
                `;
                container.appendChild(card);
            });
        }
    }
}

function updateInteractiveDisplay(data) {
    const container = document.getElementById("interactive-outputs");
    
    const mapping = {
        toStringNumber: data.toStringNumber,
        toMonetary: data.toMonetary,
        toLaTeX: data.toLaTeX,
        toUnicode: data.toUnicode,
        toVerbalA11y: data.toVerbalA11y,
    };

    for (const [key, val] of Object.entries(mapping)) {
        const item = container.querySelector(`[data-type="${key}"] .val`);
        if (item) {
            item.textContent = val;
            // Efeito visual de atualização
            item.parentElement.style.borderColor = "var(--primary)";
            setTimeout(() => item.parentElement.style.borderColor = "var(--border)", 500);
        }
    }

    const htmlBox = container.querySelector(`[data-type="toHTML"] .val-html`);
    if (htmlBox) htmlBox.innerHTML = data.toHTML;

    const jsonBox = container.querySelector(`[data-type="toAuditTrace"] .val-json`);
    if (jsonBox) jsonBox.textContent = JSON.stringify(data.toAuditTrace, null, 2);
}

init();
