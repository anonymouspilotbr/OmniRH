function mostrarDetalhes(id) {
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

    document.getElementById("lista-chamados").classList.add("hidden");
    document.getElementById("detalhes-os").classList.remove("hidden");
}

function atualizarBotoes(id){
    const dados = listaChamados.find(c => c.id == id);
    const isConcluido = dados.status === "Concluído";
    const emAndamento = dados.status === "Em andamento";
    const temServicos = dados.servicos && dados.servicos.length > 0;
    const podeConcluir = emAndamento && temServicos;

    const btnAtribuirTech = document.getElementById("btnAtribuirTech");
    const btnAdicionarServ = document.getElementById("btnAdicionarServico");
    const btnRemoverTech = document.getElementById("btnRemoverTech");
    const btnConcluirOS = document.getElementById("btnConcluirOS");

    btnAtribuirTech.disabled = isConcluido;
    btnAtribuirTech.classList.toggle("opacity-50", isConcluido);
    btnAtribuirTech.classList.toggle("cursor-not-allowed", isConcluido);

    btnAdicionarServ.disabled = isConcluido;
    btnAdicionarServ.classList.toggle("opacity-50", isConcluido);
    btnAdicionarServ.classList.toggle("cursor-not-allowed", isConcluido);

    btnRemoverTech.disabled = isConcluido;
    btnRemoverTech.classList.toggle("opacity-50", isConcluido);
    btnRemoverTech.classList.toggle("cursor-not-allowed", isConcluido);

    btnConcluirOS.disabled = !podeConcluir;
    btnConcluirOS.classList.toggle("opacity-50", !podeConcluir);
    btnConcluirOS.classList.toggle("cursor-not-allowed", !podeConcluir);
}

function voltarLista(){
    document.getElementById("lista-chamados").classList.remove("hidden");
    document.getElementById("detalhes-os").classList.add("hidden");
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
        return chamados;

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
        return [];
    }
}

function formatarData(dataISO) {
    const d = new Date(dataISO);

    const data = d.toLocaleDateString("pt-BR");
    const hora = d.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });

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

async function atribuirTech() {
    try{
        const res = await fetch('/chamados/tecnicos');
        const tecnicos = await res.json();

        const select = document.getElementById("tecnicoSelect");
        select.innerHTML = `<option value="">Selecione...</option>`;
        tecnicos.forEach(t => {
            select.innerHTML += `<option value="${t.id}">${t.nome}</option>`;
        });
        document.getElementById("modalTecnico").classList.remove("hidden");
    } catch (err){
        console.error(err);
        alert("Erro ao carregar técnicos");
    }
}

function fecharModalTecnico() {
    document.getElementById("modalTecnico").classList.add("hidden");
}

async function confirmarAtribuicao() {
    const select = document.getElementById("tecnicoSelect");
    const id_tecnico = select.value;

    if (!id_tecnico) {
        alert("Selecione um técnico");
        return;
    }

    try {
        const response = await fetch(`/chamados/${window.chamadoAtual}/atribuir`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id_tecnico })
        });

        if (!response.ok) throw new Error();

        alert("Técnico atribuído!");
        fecharModalTecnico();
        await carregarChamados();
        atualizarBotoes(window.chamadoAtual);
    } catch (err) {
        console.error(err);
        alert("Erro ao atribuir técnico");
    }
}

function adicionarServ() {
    document.getElementById("modalServico").classList.remove("hidden");
}

function fecharModalServico(){
    document.getElementById("modalServico").classList.add("hidden");
}

async function confirmarServico(){
    const select = document.getElementById("servicoSelect");
    const servico = select.value;

    if(!servico){
        alert("Selecione um serviço");
        return;
    }

    try{
        const response = await fetch(`/chamados/${window.chamadoAtual}/addServico`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ servico })
        });

        if (!response.ok) throw new Error();

        alert("Serviço cadastrado!");
        fecharModalServico();
        await carregarChamados();
        atualizarBotoes(window.chamadoAtual);
    } catch (err) {
        console.error(err);
        alert("Erro ao atribuir serviço");
    }
}

function addComment(){
    document.getElementById("modalComentarios").classList.remove("hidden");
}

function fecharModalComentarios(){
    document.getElementById("modalComentarios").classList.add("hidden");
}

async function confirmarComentario() {
    const comment = document.getElementById("areaComentario").value;

    if(!comment){
        alert("Digite um comentário");
        return;
    }

    try{
        const response = await fetch(`/chamados/${window.chamadoAtual}/addComentario`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ comment })
        });

        if (!response.ok) throw new Error();

        alert("Comentário adicionado!");
        fecharModalComentarios();
        document.getElementById("areaComentario").value = "";
        await carregarChamados();
        atualizarBotoes(window.chamadoAtual);
    } catch (err) {
        console.error(err);
        alert("Erro ao adicionar comentário");
    }
}

function removerTech(){
    document.getElementById("modalRemoverTech").classList.remove("hidden");
}

function fecharModalRemoverTech(){
    document.getElementById("modalRemoverTech").classList.add("hidden");
}

async function confirmarRemoverTech() {
    try{
        const response = await fetch(`/chamados/${window.chamadoAtual}/removerTech`, {
            method: 'PUT'
        });

        if (!response.ok) throw new Error();

        alert("Técnico removido com sucesso!");
        fecharModalRemoverTech();
        await carregarChamados();
        atualizarBotoes(window.chamadoAtual);
    } catch (err) {
        console.error(err);
        alert("Erro ao remover o técnico");
    }
}

function concluirOS(){
    document.getElementById("modalConcluirOS").classList.remove("hidden");
}

function fecharModalConcluirOS(){
    document.getElementById("modalConcluirOS").classList.add("hidden");
}

async function confirmarConcluirOS() {
    try{
        const response = await fetch(`/chamados/${window.chamadoAtual}/concluirOS`, {
            method: 'PUT'
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || "Não foi possível concluir");
            return;
        }

        alert("Chamado concluído com sucesso!");

        fecharModalConcluirOS();
        await carregarChamados();
        atualizarBotoes(window.chamadoAtual);
        voltarLista();
    } catch (err) {
        console.error(err);
        alert("Erro ao concluir o chamado");
    }
}


window.onload = carregarChamados;