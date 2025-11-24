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
            const corpoTabela = document.getElementById("corpoTabelaRecessos");
            const novoRecessoBtn = document.getElementById("novoRecessoBtn");
            const listaRecessos = document.getElementById("listaRecessos");
            const formRecessos = document.getElementById("formRecessos");
            const recessoForm = document.getElementById("recessoForm");
            const fileInput = document.getElementById("fileInput");

            function formatarDataSemFuso(iso) {
                if (!iso) return "-";
                const [ano, mes, dia] = iso.split("T")[0].split("-");
                return `${dia}/${mes}/${ano}`;
            }

            function carregarRecessos() {
                if (!id_funcionario) return;

                corpoTabela.innerHTML = `
                    <tr><td colspan="4" class="p-4 text-gray-500">Carregando...</td></tr>
                `;

                fetch(`https://omnirh.onrender.com/recessos/funcionario/${id_funcionario}`)
                .then(res => res.json())
                .then(lista => {
                    console.log("Retorno do backend:", lista);
                    if (!Array.isArray(lista)) {
                        lista = lista.data || [];
                    }

                    if (lista.length === 0) {
                        corpoTabela.innerHTML = `
                            <tr><td colspan="4" class="p-4 text-gray-500">Nenhuma solicitação encontrada.</td></tr>
                        `;
                        return;
                    }

                    corpoTabela.innerHTML = "";
                    lista.forEach(item => {
                        const tr = document.createElement("tr");
                        tr.innerHTML = `
                            <td class="p-3">${item.tipo || "-"}</td>
                            <td class="p-3">${formatarDataSemFuso(item.data_inicio)}</td>
                            <td class="p-3">${formatarDataSemFuso(item.data_termino)}</td>
                            <td class="p-3 font-semibold">${item.status}</td>
                        `;

                        corpoTabela.appendChild(tr);
                    });
                })
                .catch(err => {
                    console.error("Erro ao carregar recessos", err);
                    corpoTabela.innerHTML = `
                        <tr><td colspan="4" class="p-4 text-red-500">Erro ao carregar dados.</td></tr>
                    `;
                });
            }

            novoRecessoBtn.addEventListener("click", () => {
                listaRecessos.classList.add("hidden");
                formRecessos.classList.remove("hidden");
            });

            recessoForm.addEventListener("submit", (e) => {
                e.preventDefault();

                const tipoRecesso = document.getElementById("tipoRecesso").value;
                const dataInicio = document.getElementById("dataInicio").value;
                const dataFim = document.getElementById("dataFim").value;
                const motivo = document.getElementById("motivo").value;

                const formData = new FormData();
                formData.append("id_funcionario", id_funcionario);
                formData.append("tipo", tipoRecesso);
                formData.append("data_inicio", dataInicio);
                formData.append("data_termino", dataFim);
                formData.append("motivo", motivo);

                fetch("https://omnirh.onrender.com/recessos", {
                    method: "POST",
                    body: formData
                })
                .then(res => res.json())
                .then(async (resp) => {
                    console.log("Resposta do POST:", resp);
                    if (fileInput.files.length > 0 && resp.id) {
                        const formDataUpload = new FormData();
                        for (let file of fileInput.files) {
                            formDataUpload.append("anexos", file);
                        }

                        await fetch(`https://omnirh.onrender.com/recessos/${resp.id}/upload`, {
                            method: "POST",
                            body: formDataUpload
                        });
                    }

                    alert("Solicitação enviada com sucesso!");

                    recessoForm.reset();
                    fileInput.value = "";

                    formRecessos.classList.add("hidden");
                    listaRecessos.classList.remove("hidden");

                    carregarRecessos();
                })
                .catch(err => {
                    console.error("Erro ao enviar solicitação", err);
                    alert("Erro ao enviar solicitação.");
                });
            });
            carregarRecessos();
        })
    }
})