document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");

    if (token) {
        fetch("https://omnirh.onrender.com/me", {
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if (!data || !data.nome) return console.warn("Usuário não encontrado.");

            const id_funcionario = data.id;

            async function carregarMeusChamados(id) {
                try {
                    const res = await fetch(`/chamados/solicitante/${id}`);
                    const chamados = await res.json();

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
                            <tr class="border-t">
                                <td>${c.id}</td>
                                <td>${formatarData(c.data_hora)}</td>
                                <td>${c.descricao}</td>
                                <td>${c.id_tecnico || '-'}</td>
                                <td>${formatarStatus(c.status)}</td>
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
                        return `<span class="text-gray-500">⏳ ${status}</span>`;
                    case "Concluído":
                        return `<span class="text-green-600">✔ ${status}</span>`;
                    case "Aguardando Triagem":
                        return `<span class="text-yellow-600">⌛ ${status}</span>`;
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
                    listaChamados.classList.remove("hidden");

                } catch (err) {
                    console.error(err);
                    alert("Erro ao criar chamado");
                }
            });

            const btnNovoChamado = document.getElementById("novoChamadoBtn");
            const listaChamados = document.getElementById("listaChamados");
            const formChamados = document.getElementById("formChamados");

            btnNovoChamado.addEventListener("click", () => {
                listaChamados.classList.add("hidden");
                formChamados.classList.remove("hidden");
            });

        })
    }
})