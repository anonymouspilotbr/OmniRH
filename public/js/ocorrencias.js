let ocorrencias = JSON.parse(localStorage.getItem('ocorrenciasRH')) || [];

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
renderOcorrencias();