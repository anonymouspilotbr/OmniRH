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
                previewContainer.innerHTML = "";
                const files = Array.from(fileInput.files);

                arquivosSelecionados = [...arquivosSelecionados, ...files];
                previewContainer.innerHTML = "";

                if (arquivosSelecionados.length === 0) {
                    previewContainer.innerHTML = "<p class='text-gray-400 italic'>Nenhum arquivo selecionado</p>";
                    return;
                }

                arquivosSelecionados.forEach(file => {
                    const fileReader = new FileReader();
                    const fileItem = document.createElement("div");
                    fileItem.classList.add("p-2", "rounded", "border", "border-gray-200", "flex", "items-center", "gap-2", "mb-2");

                    const fileName = document.createElement("span");
                    fileName.textContent = file.name;
                    fileName.classList.add("text-sm", "text-gray-700", "truncate", "max-w-xs");

                    if (file.type.startsWith("image/")) {
                        fileReader.onload = (e) => {
                            const img = document.createElement("img");
                            img.src = e.target.result;
                            img.classList.add("w-16", "h-16", "object-cover", "rounded");
                            fileItem.prepend(img);
                        };
                        fileReader.readAsDataURL(file);
                    } else {
                        const icon = document.createElement("i");
                        icon.classList.add("fa", "fa-file", "text-gray-500", "text-xl");
                        fileItem.prepend(icon);
                    }

                    fileItem.appendChild(fileName);
                    previewContainer.appendChild(fileItem);
                });
            });

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
                        <td class="p-3 border-b">${new Date(l.data_inicio).toLocaleDateString("pt-BR")}</td>
                        <td class="p-3 border-b">${new Date(l.data_fim).toLocaleDateString("pt-BR")}</td>
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

