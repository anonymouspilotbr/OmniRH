document.addEventListener("DOMContentLoaded", () => {
    const tabelaRH = document.getElementById("tabelaLicencasRH");
    const modal = document.getElementById("modalLicenca");
    const detalhes = document.getElementById("detalhesLicenca");

    async function carregarEstatisticas() {
        const res = await fetch("/licencas/estatisticas");
        const stats = await res.json();

        document.getElementById("totalLicencas").textContent = stats.total;
        document.getElementById("licencasPendentes").textContent = stats.pendentes;
        document.getElementById("licencasAprovadas").textContent = stats.aprovadas;
    }

    async function carregarTodas() {
        tabelaRH.innerHTML = `<tr><td colspan="5" class="text-center p-4 text-gray-500">Carregando...</td></tr>`;

        const res = await fetch("/licencas");
        const lista = await res.json();

        renderizarTabela(lista);
    }

    async function carregarAprovadas() {
        tabelaRH.innerHTML = `<tr><td colspan="5" class="text-center p-4 text-gray-500">Carregando...</td></tr>`;

        const res = await fetch("/licencas/aprovadas");
        const lista = await res.json();

        renderizarTabela(lista);
    }

    document.getElementById("btnFiltroTotal").addEventListener("click", () => {
        carregarTodas();
    });

    document.getElementById("btnFiltroPendentes").addEventListener("click", () => {
        carregarPendentes();
    });

    document.getElementById("btnFiltroAprovadas").addEventListener("click", () => {
        carregarAprovadas();
    });

    function renderizarTabela(lista) {
        tabelaRH.innerHTML = "";

        lista.forEach(l => {
            const tr = document.createElement("tr");
            tr.classList.add("border-b");

            tr.innerHTML = `
                <td class="p-3">${l.nome_funcionario}</td>
                <td class="p-3">${l.tipo_licenca}</td>
                <td class="p-3">${formatarPeriodo(l.data_inicio, l.data_fim)}</td>
                <td class="p-3">${badgeStatus(l.status)}</td>
                <td class="p-3">
                    <button class="text-blue-600 underline" onclick="verDetalhes(${l.id})">
                        Ver detalhes
                    </button>
                </td>
            `;

            tabelaRH.appendChild(tr);
        });
    }

    let licencaSelecionada = null;

    carregarPendentes();
    carregarEstatisticas();

    function badgeStatus(status) {
        const map = {
            "pendente": "bg-yellow-100 text-yellow-700 border border-yellow-300",
            "aprovada": "bg-green-100 text-green-700 border border-green-300",
            "rejeitada": "bg-red-100 text-red-700 border border-red-300"
        };

        return `<span class="px-3 py-1 rounded-lg text-sm font-medium ${map[status]}">
                    ${status.charAt(0).toUpperCase() + status.slice(1)}
                </span>`;
    }

    async function carregarPendentes() {
        tabelaRH.innerHTML = `
            <tr><td colspan="5" class="text-center p-4 text-gray-500">Carregando...</td></tr>
        `;

        const res = await fetch("/licencas/pendentes");
        const lista = await res.json();

        tabelaRH.innerHTML = "";

        lista.forEach(l => {
            const tr = document.createElement("tr");
            tr.classList.add("border-b");

            tr.innerHTML = `
                <td class="p-3">${l.nome_funcionario}</td>
                <td class="p-3">${l.tipo_licenca}</td>
                <td class="p-3">${formatarPeriodo(l.data_inicio, l.data_fim)}</td>
                <td class="p-3">${badgeStatus(l.status)}</td>
                <td class="p-3">
                    <button class="text-blue-600 underline" onclick="verDetalhes(${l.id})">
                        Ver detalhes
                    </button>
                </td>
            `;

            tabelaRH.appendChild(tr);
        });
    }

    window.verDetalhes = async (id) => {
        const res = await fetch(`/licencas/${id}`);
        const licenca = await res.json();

        licencaSelecionada = licenca.id;

        const anexosContainer = document.createElement("div");
        anexosContainer.className = "mt-2 flex flex-col gap-2";

        if (licenca.anexos && licenca.anexos.length > 0) {
            licenca.anexos.forEach(url => {
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
            <p><strong>Funcionário:</strong> ${licenca.nome_funcionario}</p>
            <p><strong>Tipo:</strong> ${licenca.tipo_licenca}</p>
            <p><strong>Período:</strong> ${formatarPeriodo(licenca.data_inicio, licenca.data_fim)}</p>
            <p><strong>Observações:</strong> ${licenca.observacoes || "-"}</p>

            <h4 class="font-semibold mt-4">Anexos:</h4>
        `;
        detalhes.appendChild(anexosContainer);

        modal.classList.remove("hidden");
    };

    document.getElementById("btnAprovar").addEventListener("click", async () => {
        await fetch(`/licencas/${licencaSelecionada}/aprovar`, { method: "PUT" });
        fecharModal();
        carregarPendentes();
        carregarEstatisticas();
    });

    document.getElementById("btnRejeitar").addEventListener("click", async () => {
        await fetch(`/licencas/${licencaSelecionada}/rejeitar`, { method: "PUT" });
        fecharModal();
        carregarPendentes();
        carregarEstatisticas();
    });

    window.fecharModal = () => {
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
});