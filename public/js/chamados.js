function mostrarDetalhes(id) {
    const dados = listaChamados.find(c => c.id == id);

    if (!dados) return;

    document.getElementById("conteudo-detalhes").innerHTML = `
        <div>
            <p><b>Nº OS:</b> ${dados.id}</p>
            <p><b>Data e Hora:</b> ${formatarData(dados.data_hora)}</p>
        </div>
        <div>
            <p><b>Solicitante:</b> ${dados.solicitante}</p>
            <p><b>Empresa:</b> ${dados.empresa}</p>
        </div>
        <div>
            <p><b>Técnico:</b> ${dados.tecnico || '-'}</p>
            <p><b>Status:</b> ${formatarStatus(dados.status)}</p>
        </div>
    `;

    document.getElementById("descricao").innerHTML = `
        <p><b>Descrição:</b> ${dados.descricao}</p>
    `;

    document.getElementById("lista-chamados").classList.add("hidden");
    document.getElementById("detalhes-os").classList.remove("hidden");
}

let listaChamados = [];

async function carregarChamados() {
    try {
        const response = await fetch('/chamados');
        const chamados = await response.json();
        listaChamados = chamados;

        const tbody = document.querySelector("tbody");
        tbody.innerHTML = "";

        if (chamados.length === 0) {
            const tbody = document.querySelector("tbody");
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-4 py-6 text-center text-gray-500">
                        Nenhum chamado encontrado
                    </td>
                </tr>
            `;
            return;
        }

        chamados.forEach(c => {
            const linha = document.createElement("tr");
            linha.className = "bg-white text-center border-t";

            linha.innerHTML = `
                <td class="px-4 py-2">
                    <span onclick="mostrarDetalhes(${c.id})" class="text-blue-600 hover:underline cursor-pointer">
                        ${c.id}
                    </span>
                </td>
                <td class="px-4 py-2">
                    ${formatarData(c.data_hora)}
                </td>
                <td class="px-4 py-2">${c.solicitante}</td>
                <td class="px-4 py-2">${c.empresa}</td>
                <td class="px-4 py-2 align-top">
                    <div class="multiline-truncate text-left">
                        ${c.descricao}
                    </div>
                </td>
                <td class="px-4 py-2">${c.tecnico || '-'}</td>
                <td class="px-4 py-2">
                    ${formatarStatus(c.status)}
                </td>
            `;

            tbody.appendChild(linha);
        });

    } catch (err) {
        const tbody = document.querySelector("tbody");
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-4 py-6 text-center text-red-500">
                    Erro ao carregar chamados
                </td>
            </tr>
        `;
        console.error("Erro ao carregar chamados:", err);
    }
}

function formatarData(dataISO) {
    const d = new Date(dataISO);

    const data = d.toLocaleDateString("pt-BR");
    const hora = d.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });

    return `${data}<br>${hora}`;
}

function formatarStatus(status) {
    if (!status) return "-";

    switch (status) {
        case "Em andamento":
            return `<span class="text-gray-500"><i class="fa-solid fa-clock"></i> ${status}</span>`;
        case "Concluído":
            return `<span class="text-green-600"><i class="fa-solid fa-check"></i> ${status}</span>`;
        case "Aguardando Triagem":
            return `<span class="text-yellow-600"><i class="fa-solid fa-hourglass"></i> ${status}</span>`;
        default:
            return status;
    }
}

window.onload = carregarChamados;