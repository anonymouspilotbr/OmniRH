async function retornarID(){
    const token = localStorage.getItem("token");

    if (!token) return null;

    const res = await fetch("https://omnirh.onrender.com/me", {
        headers: { "Authorization": `Bearer ${token}` }
    });

    const data = await res.json();

    if (!data || !data.nome) {
        console.warn("Usuário não encontrado.");
        return null;
    }

    return data.id;
}

const id_funcionario = await retornarID();

function mostrarDetalhes(id){
    const dados = listaChamados.find(c => c.id == id);

    if (!dados) return;
    window.chamadoAtual = dados.id;

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

    document.getElementById("listaChamados").classList.add("hidden");
    document.getElementById("detalhes-os").classList.remove("hidden");

    carregarMeusChamados(id_funcionario);
    atualizarBotoes(id);
    carregarHistorico(id);
}

window.onload = carregarMeusChamados(id_funcionario);


let listaChamados = [];
async function carregarMeusChamados(id_funcionario) {
    try {
        const res = await fetch(`/chamados/solicitante/${id}`);
        const chamados = await res.json();
        listaChamados = chamados;

        const tbody = document.getElementById("corpoTabelaChamados");
        tbody.innerHTML = "";

        if (chamados.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="p-4 text-gray-500">
                        Você ainda não abriu nenhum chamado
                    </td>
                </tr>
            `;
            return;
        }

        chamados.forEach(c => {
            tbody.innerHTML += `
                <tr class="text-center border-t">
                    <td class="px-4 py-2">
                        <span onclick="mostrarDetalhes(${c.id})" class="text-blue-600 hover:underline cursor-pointer">
                            ${c.id}
                        </span>
                    </td>
                    <td class="px-4 py-2">${formatarData(c.data_hora)}</td>
                    <td class="px-4 py-2 align-top">
                        <div class="multiline-truncate text-left">
                            ${c.descricao}
                        </div>
                    </td>
                    <td class="px-4 py-2">${c.tecnico || '-'}</td>
                    <td class="px-4 py-2">${formatarStatus(c.status)}</td>
                </tr>
            `;
        });

    } catch (err) {
        console.error("Erro ao carregar chamados:", err);
    }
}

function formatarData(dataISO) {
    if (!dataISO) return "-";

    const d = new Date(dataISO);

    const data = d.toLocaleDateString("pt-BR");
    const hora = d.toLocaleTimeString("pt-BR", {
        hour: '2-digit',
        minute: '2-digit'
    });

    return `${data} ${hora}`;
}

function formatarStatus(status) {
    if (!status) return "-";

    switch (status) {
        case "Em andamento":
            return `<span class="text-gray-500"><i class="fa-solid fa-clock"></i> ${status}</span>`;
        case "Concluído":
            return `<span class="text-green-600"><i class="fa-solid fa-check"></i> ${status}</span>`;
        case "Aguardando triagem":
            return `<span class="text-yellow-600"><i class="fa-solid fa-hourglass"></i> ${status}</span>`;
        case "À disposição do técnico":
            return `<span class="text-black"><i class="fa-solid fa-user-clock"></i> ${status}</span>`
        default:
            return status;
    }
}

document.getElementById("chamadoForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const descricao = document.getElementById("descricao").value;

    if (!descricao) {
        alert("Preencha a descrição");
        return;
    }

    try {
        const res = await fetch("/chamados", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                data: new Date(),
                id_solicitante: id_funcionario,
                desc: descricao
            })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error);
            return;
        }

        alert("Chamado criado com sucesso!");
        document.getElementById("chamadoForm").reset();
        carregarMeusChamados(id_funcionario);
        formChamados.classList.add("hidden");
        telaChamados.classList.remove("hidden");

    } catch (err) {
        console.error(err);
        alert("Erro ao criar chamado");
    }
});

const btnNovoChamado = document.getElementById("novoChamadoBtn");
const telaChamados = document.getElementById("listaChamados");
const formChamados = document.getElementById("formChamados");

function voltarLista(){
    document.getElementById("lista-chamados").classList.remove("hidden");
    document.getElementById("detalhes-os").classList.add("hidden");
}

btnNovoChamado.addEventListener("click", () => {
    telaChamados.classList.add("hidden");
    formChamados.classList.remove("hidden");
});

function atualizarBotoes(id){
    const dados = listaChamados.find(c => c.id == id);
    //BOTOES + CONDICIONAIS
}

function addComment(){
    document.getElementById("modalComentarios").classList.remove("hidden");
}

function fecharModalComentarios(){
    document.getElementById("modalComentarios").classList.add("hidden");
}

async function confirmarComentario() {
    const comment = document.getElementById("areaComentario").value;
    const token = localStorage.getItem('token');

    if(!comment){
        alert("Digite um comentário");
        return;
    }

    try{
        const response = await fetch(`/chamados/${window.chamadoAtual}/addComentario`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ comment })
        });

        if (!response.ok) throw new Error();

        alert("Comentário adicionado!");
        fecharModalComentarios();
        document.getElementById("areaComentario").value = "";
        await carregarMeusChamados(id_funcionario);
        mostrarDetalhes(window.chamadoAtual);
        atualizarBotoes(window.chamadoAtual);
    } catch (err) {
        console.error(err);
        alert("Erro ao adicionar comentário");
    }
}

async function carregarHistorico(id) {
    const res = await fetch(`/chamados/${id}/historico`);
    const historico = await res.json();

    if(!res.ok){
        console.error(historico);
        return;
    }

    const container = document.getElementById("log_eventos");
    container.innerHTML = "";

    const dados = listaChamados.find(c => c.id == id);
    const dataHora = dados.data_hora;
    container.innerHTML = `
        <p>
            ${formatarData(dataHora)} Chamado criado
        </p>
    `;

    historico.forEach(h => {
        container.innerHTML += `
            <p>
                ${formatarData(h.data_hora)} ${h.descricao}
            </p>
        `;
    });
}


