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
            const listaLicencas = document.getElementById("listaLicencas");
            const formLicenca = document.getElementById("formLicenca");
            const novaLicencaBtn = document.getElementById("novaLicencaBtn");
            const voltarListaBtn = document.getElementById("voltarListaBtn");
            const corpoTabela = document.getElementById("corpoTabelaLicencas");
            const form = document.getElementById("licenca_form");
            const fileInput = document.getElementById("fileInput");
            const previewContainer = document.getElementById("previewContainer");
            let arquivosSelecionados = [];

            fileInput.addEventListener("change", () => {
                const files = Array.from(fileInput.files);

                files.forEach(f => {
                    if (!arquivosSelecionados.some(a => a.name === f.name && a.size === f.size)) {
                        arquivosSelecionados.push(f);
                    }
                });

                const tiposPermitidos = [
                    "image/jpeg",
                    "image/png",
                    "image/jpg",
                    "application/pdf",
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                ];

                const arquivosInvalidos = Array.from(files).filter(file => !tiposPermitidos.includes(file.type));
                if (arquivosInvalidos.length > 0) {
                    alert(`⚠️ Arquivo(s) não permitido(s): ${arquivosInvalidos.map(f => f.name).join(", ")}.
                Tipos aceitos: JPG, PNG, PDF, DOC e DOCX.`);
                    fileInput.value = ""; 
                    previewContainer.innerHTML = "<p class='text-gray-400 italic'>Nenhum arquivo selecionado</p>";
                    return;
                }

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
            function formatarDataLocal(isoDate) {
                if (!isoDate) return "-";
                const [ano, mes, dia] = isoDate.split("-");
                return `${dia}/${mes}/${ano}`;
            }

            function mostrarLista() {
                listaLicencas.classList.remove("hidden");
                formLicenca.classList.add("hidden");
                carregarLicencas();
            }

            function mostrarFormulario() {
                formLicenca.classList.remove("hidden");
                listaLicencas.classList.add("hidden");
            }

            novaLicencaBtn.addEventListener("click", mostrarFormulario);
            voltarListaBtn.addEventListener("click", mostrarLista);

            async function carregarLicencas() {
                corpoTabela.innerHTML = `<tr><td colspan="4" class="text-center p-4 text-gray-500">Carregando...</td></tr>`;

                try {
                    const response = await fetch(`/licencas/funcionario/${id_funcionario}`);
                    if (!response.ok) throw new Error("Erro ao buscar licenças");

                    const licencas = await response.json();

                    if (!licencas || licencas.length === 0) {
                        corpoTabela.innerHTML = `
                            <tr>
                            <td colspan="4" class="text-center p-6 text-gray-400 italic">
                                Nenhuma licença registrada até o momento.
                            </td>
                            </tr>`;
                        return;
                    }

                    corpoTabela.innerHTML = "";

                    licencas.forEach(l => {
                        const tr = document.createElement("tr");
                        const statusClass =
                        l.status === "Aprovada"
                            ? "bg-green-500"
                            : l.status === "Rejeitada"
                            ? "bg-red-500"
                            : "bg-yellow-500";

                        tr.innerHTML = `
                        <td class="p-3 border-b">${l.tipo_licenca || "-"}</td>
                        <td class="p-3 border-b">${formatarDataLocal(l.data_inicio)}</td>
                        <td class="p-3 border-b">${formatarDataLocal(l.data_fim)}</td>
                        <td class="p-3 border-b">
                            <span class="px-3 py-1 rounded-full text-white ${statusClass}">
                            ${l.status || "Pendente"}
                            </span>
                        </td>`;
                        corpoTabela.appendChild(tr);
                    });
                } catch (err) {
                    console.error(err);
                    corpoTabela.innerHTML = `<tr><td colspan="4" class="text-center p-4 text-red-500">Erro ao carregar licenças</td></tr>`;
                }
            }

            form.addEventListener("submit", async (e) => {
                e.preventDefault();

                const tipo_licenca = document.getElementById("tipoLicenca").value;
                const data_inicio = document.getElementById("dataInicio").value;
                const data_fim = document.getElementById("dataFim").value;
                const observacoes = document.getElementById("desc").value;

                const anoAtual = new Date().getFullYear();
                const anoInicio = new Date(data_inicio).getFullYear();
                const anoFim = new Date(data_fim).getFullYear();

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

                if (new Date(data_fim) < new Date(data_inicio)) {
                    alert("⚠️ A data de término não pode ser anterior à data de início.");
                    return;
                }

                const payload = {
                    id_funcionario,
                    tipo_licenca,
                    data_inicio,
                    data_fim,
                    observacoes,
                };

                try {
                    const response = await fetch("/licencas", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                    });

                    const data = await response.json();
                    if (!response.ok) throw new Error(data.error || "Erro ao registrar licença");

                    const idLicenca = data.id;

                    if(arquivosSelecionados.length > 0){
                        const formData = new FormData();

                        console.log('Arquivos enviados:', arquivosSelecionados);
                        for(const file of arquivosSelecionados){
                            console.log("📤 Enviando arquivo:", file.name);
                            formData.append('anexos', file);
                        }
                        
                        const uploadRes = await fetch(`/licencas/${idLicenca}/upload`, {
                            method: "POST",
                            body: formData,
                        });

                        if(!uploadRes.ok) throw new Error("Falha ao enviar anexo");
                    }

                    alert("Licença registrada com sucesso!");
                    form.reset();
                    mostrarLista();
                } catch (err) {
                    console.error(err);
                    alert("Erro ao registrar licença. Verifique e tente novamente.");
                }
            });

            mostrarLista();

        })
    }
})

