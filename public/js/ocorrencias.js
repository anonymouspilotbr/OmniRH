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
            const listaOcorrencias = document.getElementById("listaOcorrencias");
            const formOcorrencia = document.getElementById("formOcorrencias");
            const novaOcorrenciaBtn = document.getElementById("novaOcorrenciaBtn");
            const voltarListaBtn = document.getElementById("voltarListaBtn");
            const corpoTabela = document.getElementById("corpoTabelaOcorrencias");
            const form = document.getElementById("ocorrencia_form");
            const fileInput = document.getElementById("fileInput");
            const previewContainer = document.getElementById("previewContainer");
            let arquivosSelecionados = [];

            async function carregarOcorrencias() {
                corpoTabela.innerHTML = `
                    <tr><td colspan="4" class="py-4 text-gray-500">Carregando...</td></tr>
                `;

                try {
                    const res = await fetch(`https://omnirh.onrender.com/ocorrencias/funcionario/${id_funcionario}`);
                    const lista = await res.json();

                    if (!Array.isArray(lista) || lista.length === 0) {
                        corpoTabela.innerHTML = `
                            <tr><td colspan="4" class="py-4 text-gray-500">Nenhuma ocorrência encontrada.</td></tr>
                        `;
                        return;
                    }

                    corpoTabela.innerHTML = "";
                    lista.forEach(oc => {
                        const tr = document.createElement("tr");
                        tr.classList.add("border-b");

                        tr.innerHTML = `
                            <td class="py-3">${oc.tipo_ocorrencia || "-"}</td>
                            <td class="py-3">${formatarData(oc.data)}</td>
                            <td class="py-3">${oc.data ? formatarData(oc.data) : "-"}</td>
                            <td class="py-3">${oc.gravidade || "Em análise"}</td>
                        `;
                        corpoTabela.appendChild(tr);
                    });

                } catch (err) {
                    corpoTabela.innerHTML = `
                        <tr><td colspan="4" class="py-4 text-red-500">Erro ao carregar ocorrências.</td></tr>
                    `;
                    console.error(err);
                }
            }

            function formatarData(dataISO) {
                if (!dataISO) return "-";
                const d = new Date(dataISO);
                return d.toLocaleDateString("pt-BR");
            }

            function mostrarLista() {
                listaOcorrencias.classList.remove("hidden");
                formOcorrencia.classList.add("hidden");
                carregarOcorrencias();
            }

            function mostrarFormulario() {
                formOcorrencia.classList.remove("hidden");
                listaOcorrencias.classList.add("hidden");
            }

            novaOcorrenciaBtn.addEventListener("click", mostrarFormulario);
            voltarListaBtn.addEventListener("click", mostrarLista);

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

                    // Ícone ou miniatura
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

                    // Botão de remover arquivo
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

            form.addEventListener("submit", async (e) => {
            e.preventDefault();

            // --- validação local rápida ---
            const tipo = document.getElementById("tipoOcorrencia").value;
            const motivo = document.getElementById("motivoOcorrencia").value;
            const dataVal = document.getElementById("dataOcorrencia").value;
            const detalhesVal = document.getElementById("detalhes").value;

            if (!id_funcionario) return alert("Erro: id do funcionário não encontrado. Faça login novamente.");
            if (!tipo || !motivo || !dataVal) return alert("Preencha Tipo, Motivo e Data antes de enviar.");

            // --- montar FormData ---
            const formData = new FormData();
            formData.append("id_funcionario", id_funcionario);
            formData.append("tipo_ocorrencia", tipo);
            formData.append("motivo", motivo);
            formData.append("data", dataVal);
            formData.append("detalhes", detalhesVal || "");

            arquivosSelecionados.forEach(file => formData.append("anexos", file));

            // --- DEBUG: listar FormData no console ---
            console.log("=== Conteúdo do FormData a ser enviado ===");
            for (const pair of formData.entries()) {
                // arquivos aparecem como File — mostramos seu name para clareza
                if (pair[1] instanceof File) {
                console.log(pair[0], ":", pair[1].name, "(" + pair[1].type + ")");
                } else {
                console.log(pair[0], ":", pair[1]);
                }
            }
            console.log("=========================================");

            // --- pegar token (se houver) e preparar fetch ---
            const token = localStorage.getItem("token");

            try {
                const res = await fetch("https://omnirh.onrender.com/ocorrencias", {
                method: "POST",
                // NÃO definir Content-Type quando enviar FormData
                headers: token ? { "Authorization": `Bearer ${token}` } : {},
                body: formData,
                });

                // tenta parsear JSON, mas aceita texto cru se não for JSON
                let body;
                try {
                body = await res.json();
                } catch (err) {
                body = await res.text();
                }

                if (!res.ok) {
                console.error("ERRO DO SERVIDOR (status " + res.status + "):", body);
                // mostrar mensagem amigável quando possível
                const msg = (body && body.error) ? body.error : (typeof body === "string" ? body : "Erro desconhecido do servidor");
                throw new Error(msg);
                }

                console.log("Resposta do servidor (sucesso):", body);
                alert("Ocorrência registrada com sucesso!");
                arquivosSelecionados = [];
                atualizarPreview();
                form.reset();
                mostrarLista();

            } catch (err) {
                console.error("ERRO NO FETCH:", err);
                alert("Erro ao registrar ocorrência: " + err.message);
            }
            });

            carregarOcorrencias();
        });
    }
});