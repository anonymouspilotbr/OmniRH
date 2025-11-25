document.addEventListener("DOMContentLoaded", () => {
    const tabelaRH = document.getElementById("tabelaRecessosRH");
    const modal = document.getElementById("modalRecesso");
    const detalhes = document.getElementById("detalhesRecesso");

    async function carregarEstatisticas() {
        const res = await fetch("/recessos/estatisticas");
        const stats = await res.json();

        document.getElementById("totalRecessos").textContent = stats.total;
        document.getElementById("recessosPendentes").textContent = stats.pendentes;
        document.getElementById("recessosAprovados").textContent = stats.aprovados;
    
    }

    async function carregarTodos() {
        tabelaRH.innerHTML = `<tr><td colspan="5" class="text-center p-4 text-gray-500">Carregando...</td></tr>`;

        const res = await fetch("/recessos");
        const lista = await res.json();

        renderizarTabela(lista);
    }

    async function carregarAprovados() {
        tabelaRH.innerHTML = `<tr><td colspan="5" class="text-center p-4 text-gray-500">Carregando...</td></tr>`;

        const res = await fetch("/recessos/aprovados");
        const lista = await res.json();

        renderizarTabela(lista);
    }

    document.getElementById("btnTotalRecessos").addEventListener("click", () => {
        carregarTodos();
    });

    document.getElementById("btnRecessosPendentes").addEventListener("click", () => {
        carregarPendentes();
    });

    document.getElementById("btnRecessosAprovados").addEventListener("click", () => {
        carregarAprovados();
    });

    function renderizarTabela(lista) {
        tabelaRH.innerHTML = "";

        lista.forEach(r => {
            const tr = document.createElement("tr");
            tr.classList.add("border-b");

            tr.innerHTML = `
                <td class="p-3 text-center">${r.nome_funcionario}</td>
                <td class="p-3 text-center">${r.tipo}</td>
                <td class="p-3 whitespace-nowrap">${formatarPeriodo(r.data_inicio, r.data_termino)}</td>
                <td class="p-3 whitespace-nowrap">${badgeStatus(r.status)}</td>
                <td class="p-3 whitespace-nowrap">
                    <button class="text-blue-600 underline" onclick="verDetalhesRecesso(${r.id})">
                        Ver detalhes
                    </button>
                </td>
            `;

            tabelaRH.appendChild(tr);
        });
    }

    let recessoSelecionado = null;

    carregarPendentes();
    carregarEstatisticas();

    function badgeStatus(status) {
        const map = {
            "em análise": "bg-yellow-100 text-yellow-700 border border-yellow-300",
            "aprovado": "bg-green-100 text-green-700 border border-green-300",
            "rejeitado": "bg-red-100 text-red-700 border border-red-300"
        };

        return `<span class="px-3 py-1 rounded-lg text-sm font-medium ${map[status]}">
                    ${status.charAt(0).toUpperCase() + status.slice(1)}
                </span>`;
    }

    async function carregarPendentes() {
        tabelaRH.innerHTML = `
            <tr><td colspan="5" class="text-center p-4 text-gray-500">Carregando...</td></tr>
        `;

        const res = await fetch("/recessos/pendentes");
        const lista = await res.json();

        tabelaRH.innerHTML = "";

        lista.forEach(r => {
            const tr = document.createElement("tr");
            tr.classList.add("border-b");

            tr.innerHTML = `
                <td class="p-3 text-center">${r.nome_funcionario}</td>
                <td class="p-3 text-center">${r.tipo}</td>
                <td class="p-3 whitespace-nowrap">${formatarPeriodo(r.data_inicio, r.data_termino)}</td>
                <td class="p-3 whitespace-nowrap">${badgeStatus(r.status)}</td>
                <td class="p-3 whitespace-nowrap">
                    <button class="text-blue-600 underline" onclick="verDetalhesRecesso(${r.id})">
                        Ver detalhes
                    </button>
                </td>
            `;

            tabelaRH.appendChild(tr);
        });
    }

    window.verDetalhesRecesso = async (id) => {
        const res = await fetch(`/recessos/${id}`);
        const recesso = await res.json();

        recessoSelecionado = recesso.id;

        const anexosContainer = document.createElement("div");
        anexosContainer.className = "mt-2 flex flex-col gap-2";

        if (recesso.anexos && recesso.anexos.length > 0) {
            recesso.anexos.forEach(url => {
                const link = document.createElement("a");
                link.href = url;
                link.target = "_blank";
                link.className = "text-blue-600 underline";
                link.textContent = url.split("/").pop();
                anexosContainer.appendChild(link);
            });
        } else {
            const p = document.createElement("p");
            p.className = "text-gray-500";
            p.textContent = "Nenhum anexo enviado.";
            anexosContainer.appendChild(p);
        }

        detalhes.innerHTML = `
            <p><strong>Funcionário:</strong> ${recesso.nome_funcionario}</p>
            <p><strong>Tipo:</strong> ${recesso.tipo}</p>
            <p><strong>Período:</strong> ${formatarPeriodo(recesso.data_inicio, recesso.data_termino)}</p>
            <p><strong>Observações:</strong> ${recesso.motivo || "-"}</p>

            <h4 class="font-semibold mt-4">Anexos:</h4>
        `;
        detalhes.appendChild(anexosContainer);

        modal.classList.remove("hidden");
    };

     document.getElementById("btnAprovarRecesso").addEventListener("click", async () => {
        await fetch(`/recessos/${recessoSelecionado}/aprovar`, { method: "PUT" });
        fecharModalRecesso();
        carregarPendentes();
        carregarEstatisticas();
    });

    document.getElementById("btnRejeitarRecesso").addEventListener("click", async () => {
        await fetch(`/recessos/${recessoSelecionado}/rejeitar`, { method: "PUT" });
        fecharModalRecesso();
        carregarPendentes();
        carregarEstatisticas();
    });

    window.fecharModalRecesso = () => {
        modal.classList.add("hidden");
    };

    function formatarDataLocal(dataISO) {
        if (!dataISO) return "-";
        const d = new Date(dataISO);
        return d.toLocaleDateString("pt-BR", { timeZone: "UTC" });
    }

    function formatarPeriodo(i, f) {
        const di = formatarDataLocal(i);
        const df = formatarDataLocal(f);
        return `${di} até ${df}`;
    }

    const filtrosRecessos = document.querySelectorAll('#painel-recessos aside div[id^="btnRecessos"]');

    filtrosRecessos.forEach(f => {
        f.addEventListener("click", () => {
            filtrosRecessos.forEach(x => x.classList.remove("filtro-selecionado"));
            f.classList.add("filtro-selecionado");
        });
    });

    document.getElementById("btnTotalRecessos").classList.add("filtro-selecionado");
});

