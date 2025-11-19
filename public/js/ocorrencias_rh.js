let ocorrenciasTodas = [];
let filtroAtual = "todas";

async function carregarOcorrenciasRH() {
    try {
        const token = localStorage.getItem("token");
        const resp = await fetch("/ocorrencias", {
            headers: { Authorization: `Bearer ${token}` }
        });

        ocorrenciasTodas = await resp.json();

        aplicarFiltro(filtroAtual); 

    } catch (err) {
        console.error("Erro ao carregar ocorrências (RH):", err);
    }
}

function aplicarFiltro(tipo) {
    filtroAtual = tipo;

    let lista = [...ocorrenciasTodas];

    if (tipo === "analise") {
        lista = lista.filter(o => o.status === "Em análise");
    }

    if (tipo === "grave") {
        lista = lista.filter(o => o.gravidade === "Grave");
    }

    if (tipo === "resolvida") {
        lista = lista.filter(o => o.status === "Resolvida");
    }

    montarEstatisticas(ocorrenciasTodas); 
    montarListaOcorrencias(lista);
}

function montarEstatisticas(lista) {
    document.getElementById("totalOcorrencias").textContent = lista.length;

    const emAnalise = lista.filter(o => o.status === "Em análise").length;
    document.getElementById("emAnalise").textContent = emAnalise;

    const graves = lista.filter(o => o.gravidade === "Grave").length;
    document.getElementById("ocorrenciasGraves").textContent = graves;

    const resolvidas = lista.filter(o => o.status === "Resolvida").length;
    document.getElementById("ocorrenciasResolvidas").textContent = resolvidas;
}

function montarListaOcorrencias(lista) {
    const container = document.getElementById("ocorrenciasContainer");
    container.innerHTML = "";

    if (lista.length === 0) {
        container.innerHTML = `<p class="text-gray-600 text-center">Nenhuma ocorrência registrada.</p>`;
        return;
    }

    lista.forEach(occ => {
        const card = document.createElement("div");

        let cor = "border-blue-600";
        if (occ.gravidade === "Grave") cor = "border-red-600";
        if (occ.status === "Resolvida") cor = "border-green-600";
        card.className = "bg-white rounded-lg shadow p-4 border-l-4 " + cor;

        card.innerHTML = `
            <div class="flex justify-between items-center">
                <div>
                    <p class="font-bold text-lg">${occ.tipo_ocorrencia}</p>
                    <p class="text-gray-700 text-sm">${occ.detalhes || "Sem detalhes"}</p>
                    <p class="text-gray-500 text-xs">Funcionário: ${occ.nome_funcionario || occ.id_funcionario}</p>
                </div>

                <button class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onclick="abrirModalOcorrencia(${occ.id})">
                    Ver
                </button>
            </div>
        `;

        container.appendChild(card);
    });
}

async function abrirModalOcorrencia(id) {
    const token = localStorage.getItem("token");

    const resp = await fetch(`/ocorrencias/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    const occ = await resp.json();
    console.log("DEBUG OCORRÊNCIA COMPLETA:", occ);
    console.log("TIPO DE anexos:", typeof occ.anexos, occ.anexos);

    const modal = construirModal(occ);

    document.body.appendChild(modal.overlay);
    modal.overlay.classList.remove("hidden");
}


function construirModal(occ) {
    const overlay = document.createElement("div");
    overlay.className = "modal-ocorrencia-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50";
    const box = document.createElement("div");
    box.className = "bg-white rounded-lg shadow-lg p-6 w-full max-w-lg";

    let arquivosHtml = "";

    let anexos = [];

    if (occ.anexos) {
        try {
            if (typeof occ.anexos === "string") {
                anexos = JSON.parse(occ.anexos);
            } else if (Array.isArray(occ.anexos)) {
                anexos = occ.anexos; 
            } else {
                anexos = [];
            }

            if (!Array.isArray(anexos)) anexos = [];
        } catch (e) {
            console.error("Erro ao interpretar anexos do banco:", occ.anexos);
            anexos = [];
        }
    }

    if (anexos.length > 0) {
        arquivosHtml = anexos.map(a =>
            `<a href="/uploads/${a.filename}" target="_blank" class="text-blue-600 underline">${a.originalname}</a>`
        ).join("<br>");
    }

    box.innerHTML = `
        <h2 class="text-xl font-bold mb-3">Detalhes da Ocorrência</h2>

        <p><strong>Funcionário:</strong> ${occ.nome_funcionario || occ.id_funcionario}</p>
        <p><strong>Tipo:</strong> ${occ.tipo_ocorrencia}</p>
        <p><strong>Data:</strong> ${occ.data}</p>
        <p><strong>Motivo:</strong> ${occ.motivo || "—"}</p>
        <p><strong>Detalhes:</strong> ${occ.detalhes || "—"}</p>
        <p><strong>Gravidade:</strong> ${occ.gravidade}</p>
        <p><strong>Status:</strong> ${occ.status}</p>

        <h3 class="font-semibold mt-3">Anexos:</h3>
        ${arquivosHtml || "<p class='text-gray-500'>Nenhum arquivo enviado</p>"}

        <div class="flex justify-end gap-3 mt-5">
            <button onclick="alterarStatus(${occ.id}, 'Rejeitada')" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Rejeitar</button>

            <button onclick="alterarStatus(${occ.id}, 'Grave')" class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">Marcar Grave</button>

            <button onclick="alterarStatus(${occ.id}, 'Resolvida')" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Resolver</button>

            <button onclick="fecharModalOcorrencia()" 
                class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                Fechar
            </button>
        </div>
    `;

    overlay.appendChild(box);

    return { overlay };
}

async function alterarStatus(id, acao) {
    const token = localStorage.getItem("token");
    let body = {};

    if (acao === "Rejeitada" || acao === "Resolvida") {
        body.status = acao;
    }

    if (acao === "Grave") {
        body.gravidade = "Grave";
    }

    await fetch(`/ocorrencias/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
    });

    fecharModalOcorrencia();
    carregarOcorrenciasRH();
}

function fecharModalOcorrencia() {
    const overlay = document.querySelector(".modal-ocorrencia-overlay");
    if (overlay) overlay.remove();
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.filtro').forEach(div => {
        div.addEventListener('click', () => {
            aplicarFiltro(div.dataset.filtro);
        });
    });
});

document.addEventListener("click", (e) => {
    if (e.target && e.target.id === "btnOcorrencias") {
        carregarOcorrenciasRH();
    }
});