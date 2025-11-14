document.addEventListener("DOMContentLoaded", () => {
    const tabelaRH = document.getElementById("tabelaLicencasRH");
    const modal = document.getElementById("modalLicenca");
    const detalhes = document.getElementById("detalhesLicenca");

    let licencaSelecionada = null;

    carregarPendentes();

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
                <td class="p-3">${l.funcionario_nome}</td>
                <td class="p-3">${l.tipo_licenca}</td>
                <td class="p-3">${formatarPeriodo(l.data_inicio, l.data_fim)}</td>
                <td class="p-3">${l.status}</td>
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
            <p><strong>Funcionário:</strong> ${licenca.funcionario_nome}</p>
            <p><strong>Tipo:</strong> ${licenca.tipo_licenca}</p>
            <p><strong>Período:</strong> ${formatarPeriodo(licenca.data_inicio, licenca.data_fim)}</p>
            <p><strong>Observações:</strong> ${licenca.observacoes || "-"}</p>

            <h4 class="font-semibold mt-4">Anexos:</h4>
        `;
        detalhes.appendChild(anexosContainer);

        modal.classList.remove("hidden");
    };

    document.getElementById("btnAprovar").addEventListener("click", async () => {
        await fetch(`/licencas/${licencaSelecionada}/aprovar`, { method: "PATCH" });
        fecharModal();
        carregarPendentes();
    });

    document.getElementById("btnRejeitar").addEventListener("click", async () => {
        await fetch(`/licencas/${licencaSelecionada}/rejeitar`, { method: "PATCH" });
        fecharModal();
        carregarPendentes();
    });

    window.fecharModal = () => {
        modal.classList.add("hidden");
    };

    function formatarPeriodo(i, f) {
        const di = new Date(i).toLocaleDateString("pt-BR");
        const df = new Date(f).toLocaleDateString("pt-BR");
        return `${di} até ${df}`;
    }
});