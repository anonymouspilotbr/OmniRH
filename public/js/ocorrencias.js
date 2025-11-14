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
            const formOcorrencia = document.getElementById("formOcorrencia");
            const novaOcorrenciaBtn = document.getElementById("novaOcorrenciaBtn");
            const voltarListaBtn = document.getElementById("voltarListaBtn");
            const corpoTabela = document.getElementById("corpoTabelaOcorrencias");
            const form = document.getElementById("ocorrencia_form");
            const fileInput = document.getElementById("fileInput");
            const previewContainer = document.getElementById("previewContainer");
            let arquivosSelecionados = [];


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

            function mostrarLista() {
                listaOcorrencias.classList.remove("hidden");
                formOcorrencia.classList.add("hidden");
                carregarLicencas();
            }

            function mostrarFormulario() {
                formOcorrencia.classList.remove("hidden");
                listaOcorrencias.classList.add("hidden");
            }

            novaOcorrenciaBtn.addEventListener("click", mostrarFormulario);
            voltarListaBtn.addEventListener("click", mostrarLista);
            
        })
    }
});