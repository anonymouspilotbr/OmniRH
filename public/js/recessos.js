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
            const previewContainer = document.getElementById("previewContainer");
            let arquivosSelecionados = [];
            const hoje = new Date().toISOString().split("T")[0];
            document.getElementById("dataInicio").setAttribute("min", hoje);
            document.getElementById("dataFim").setAttribute("min", hoje);

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

            fileInput.addEventListener("change", () => {
                const files = Array.from(fileInput.files);

                const tiposPermitidos = [
                    "image/jpeg",
                    "image/png",
                    "image/jpg",
                    "application/pdf",
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                ];

                const arquivosValidos = [];
                const arquivosInvalidos = Array.from(files).filter(file => !tiposPermitidos.includes(file.type));

                files.forEach(file => {
                    if (tiposPermitidos.includes(file.type)) {
                        if (!arquivosSelecionados.some(a => a.name === file.name && a.size === file.size)) {
                            arquivosValidos.push(file);
                        }
                    } else {
                        arquivosInvalidos.push(file);
                    }
                });

                if (arquivosInvalidos.length > 0) {
                    alert(`⚠️ Arquivo(s) não permitido(s): ${arquivosInvalidos.map(f => f.name).join(", ")}.
                Tipos aceitos: JPG, PNG, PDF, DOC e DOCX.`);
                }

                arquivosSelecionados = [...arquivosSelecionados, ...arquivosValidos];

                const dataTransfer = new DataTransfer();
                arquivosSelecionados.forEach(f => dataTransfer.items.add(f));
                fileInput.files = dataTransfer.files;

                atualizarPreview();
            });

            function atualizarPreview() {
                previewContainer.innerHTML = "";

                if (arquivosSelecionados.length === 0) {
                    previewContainer.innerHTML = "<p class='text-gray-400 italic'>Nenhum arquivo selecionado</p>";
                    return;
                }

                arquivosSelecionados.forEach((file, index) => {
                    const fileReader = new FileReader();
                    const fileItem = document.createElement("div");
                    fileItem.classList.add(
                        "p-2", "rounded", "border", "border-gray-200",
                        "flex", "items-center", "justify-between", "gap-2", "mb-2"
                    );

                    const infoContainer = document.createElement("div");
                    infoContainer.classList.add("flex", "items-center", "gap-2");

                    const fileName = document.createElement("span");
                    fileName.textContent = file.name;
                    fileName.classList.add("text-sm", "text-gray-700", "truncate", "max-w-xs");

                    if (file.type.startsWith("image/")) {
                        fileReader.onload = (e) => {
                            const img = document.createElement("img");
                            img.src = e.target.result;
                            img.classList.add("w-12", "h-12", "object-cover", "rounded");
                            infoContainer.prepend(img);
                        };
                        fileReader.readAsDataURL(file);
                    } else {
                        const icon = document.createElement("i");
                        icon.classList.add("fa", "fa-file", "text-gray-500", "text-lg");
                        infoContainer.prepend(icon);
                    }

                    infoContainer.appendChild(fileName);
                    fileItem.appendChild(infoContainer);

                    const removeBtn = document.createElement("button");
                    removeBtn.innerHTML = `<i class="fa fa-trash text-red-500 hover:text-red-700"></i>`;
                    removeBtn.classList.add("p-1", "rounded", "hover:bg-red-50", "transition");
                    removeBtn.title = "Remover arquivo";

                    removeBtn.addEventListener("click", () => {
                        arquivosSelecionados.splice(index, 1);
                        atualizarPreview();
                    });

                    fileItem.appendChild(removeBtn);
                    previewContainer.appendChild(fileItem);
                });
            }

            recessoForm.addEventListener("submit", (e) => {
                e.preventDefault();

                const tipoRecesso = document.getElementById("tipoRecesso").value;
                const dataInicio = document.getElementById("dataInicio").value;
                const dataFim = document.getElementById("dataFim").value;
                const motivo = document.getElementById("motivo").value;

                const anoAtual = new Date().getFullYear();
                const anoInicio = new Date(dataInicio).getFullYear();
                const anoFim = new Date(dataFim).getFullYear();

                if (
                    isNaN(anoInicio) || 
                    isNaN(anoFim) || 
                    anoInicio < anoAtual || 
                    anoInicio > 2099 || 
                    anoFim < anoAtual || 
                    anoFim > 2099
                ) {
                    alert(`⚠️ O ano das datas deve estar entre ${anoAtual} e 2099.`);
                    return;
                }

                if (new Date(dataFim) < new Date(dataInicio)) {
                    alert("⚠️ A data de término não pode ser anterior à data de início.");
                    return;
                }

                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);
                const inicio = new Date(dataInicio);
                const fim = new Date(dataFim);

                if (inicio < hoje || fim < hoje) {
                    alert("⚠️ As datas não podem ser anteriores à data atual.");
                    return;
                }

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