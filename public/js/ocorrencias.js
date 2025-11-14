/*let ocorrencias = JSON.parse(localStorage.getItem('ocorrenciasRH')) || [];

const container = document.getElementById('ocorrenciasContainer');

// Função para formatar a data para exibição
function formatDate(dateString) {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
}

// Função para formatar hora
function formatTime(timeString) {
    return timeString || 'Não informada';
}

// Função para atualizar estatísticas
function updateStats() {
    const total = ocorrencias.length;
    const emAnalise = ocorrencias.filter(o => o.status === 'EmAnálise').length;
    const graves = ocorrencias.filter(o => o.status === 'Grave' || o.severidade === 'Alta').length;

    document.getElementById('totalOcorrencias').textContent = total;
    document.getElementById('emAnalise').textContent = emAnalise;
    document.getElementById('ocorrenciasGraves').textContent = graves;
}

function renderOcorrencias() {
    container.innerHTML = '';
    updateStats();

    if (ocorrencias.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 py-6 italic">
                Nenhuma ocorrência registrada no momento.
            </div>`;
        return;
    }

    ocorrencias.forEach((o, index) => {
        
        const descricaoCurta = o.detalhes.length > 100 
            ? o.detalhes.substring(0, 100) + "..." 
            : o.detalhes;

        const statusColors = {
            Registrada: "bg-gray-200 text-gray-700",
            EmAnálise: "bg-yellow-100 text-yellow-700",
            Resolvida: "bg-green-100 text-green-700",
            Grave: "bg-red-100 text-red-700"
        };

        const severidadeColors = {
            Baixa: "bg-blue-100 text-blue-700",
            Média: "bg-yellow-100 text-yellow-700",
            Alta: "bg-red-100 text-red-700"
        };

        let acoesHtml = `
            <div class="flex gap-2 mt-4 text-sm">
                -
            </div>
        `;

        if (o.status === "Registrada") {
            acoesHtml = `
            <div class="flex gap-2 mt-4">
                <button class="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    onclick="iniciarAnalise(${index})">Iniciar Análise</button>

                <button class="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    onclick="resolver(${index})">Resolver</button>

                <button class="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    onclick="marcarGrave(${index})">Marcar Grave</button>
            </div>`;
        }
        else if (o.status === "EmAnálise") {
            acoesHtml = `
            <div class="flex gap-2 mt-4">
                <button class="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    onclick="resolver(${index})">Resolver</button>
            </div>`;
        }

        const card = document.createElement("div");
        card.className =
            "bg-white shadow rounded-xl p-5 border border-gray-200 flex flex-col gap-3 mb-4";

        card.innerHTML = `
            <div class="flex items-center justify-between">
                <h3 class="text-lg font-bold text-gray-800">
                    ${o.tipoOcorrencia} - ${o.funcionario}
                </h3>

                <div class="flex gap-2">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold ${statusColors[o.status]}">
                        ${o.status}
                    </span>

                    <span class="px-3 py-1 rounded-full text-xs font-semibold ${severidadeColors[o.severidade]}">
                        ${o.severidade}
                    </span>
                </div>
            </div>

            <p class="text-sm text-gray-600">
                <strong>Data:</strong> ${formatDate(o.dataOcorrencia)} —
                <strong>Hora:</strong> ${formatTime(o.horaInicio)}
            </p>

            <p class="text-gray-700 text-sm">${descricaoCurta}</p>

            <p class="text-xs text-gray-500">
                Registrado em: ${formatDate(o.dataRegistro || o.dataOcorrencia)}
            </p>

            ${acoesHtml}
        `;

        container.appendChild(card);
    });
}

function iniciarAnalise(index) {
    ocorrencias[index].status = 'EmAnálise';
    localStorage.setItem('ocorrenciasRH', JSON.stringify(ocorrencias));
    renderOcorrencias();
    alert(`Análise iniciada para a ocorrência de ${ocorrencias[index].funcionario}.`);
}

function resolver(index) {
    ocorrencias[index].status = 'Resolvida';
    localStorage.setItem('ocorrenciasRH', JSON.stringify(ocorrencias));
    renderOcorrencias();
    alert(`Ocorrência de ${ocorrencias[index].funcionario} resolvida com sucesso.`);
}

function marcarGrave(index) {
    ocorrencias[index].status = 'Grave';
    ocorrencias[index].severidade = 'Alta';
    localStorage.setItem('ocorrenciasRH', JSON.stringify(ocorrencias));
    renderOcorrencias();
    alert(`Ocorrência de ${ocorrencias[index].funcionario} marcada como grave. Ação prioritária recomendada.`);
}

// Inicializa a renderização
renderOcorrencias();*/

/*const lista = document.getElementById("listaOcorrencias");
    const formSecao = document.getElementById("formOcorrenciaSecao");
    const novaBtn = document.getElementById("novaOcorrenciaBtn");
    const voltarBtn = document.getElementById("voltarListaBtn");
    const previewContainer = document.getElementById("previewContainer");
    const fileInput = document.getElementById("fileInput");

    let arquivosSelecionados = [];

    novaBtn.onclick = () => {
        lista.classList.add("hidden");
        formSecao.classList.remove("hidden");
    };

    voltarBtn.onclick = () => {
        formSecao.classList.add("hidden");
        lista.classList.remove("hidden");
    };

    // ******************** PRÉVIA DOS ANEXOS ********************
    fileInput.addEventListener("change", () => {
        arquivosSelecionados = Array.from(fileInput.files);
        previewContainer.innerHTML = "";

        if (arquivosSelecionados.length === 0) {
            previewContainer.textContent = "Nenhum arquivo selecionado";
            return;
        }

        arquivosSelecionados.forEach(f => {
            const div = document.createElement("div");
            div.classList.add("p-2", "border", "rounded", "mb-2", "flex", "justify-between", "items-center");

            div.innerHTML = `
                <span>${f.name}</span>
                <span class="text-gray-400 text-xs">${(f.size / 1024).toFixed(1)} KB</span>
            `;
            previewContainer.appendChild(div);
        });
    });

    // ******************** SUBMIT ********************
    document.getElementById("formOcorrencia").addEventListener("submit", (e) => {
        e.preventDefault();
        alert("⚠️ Backend ainda vai ser implementado.");
    });*/

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