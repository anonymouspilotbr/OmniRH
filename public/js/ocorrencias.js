// Carrega os dados de ocorrências do localStorage
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
        container.innerHTML = '<div class="no-data">Nenhuma ocorrência registrada no momento.</div>';
        return;
    }

    ocorrencias.forEach((ocorrencia, index) => {
        const card = document.createElement('div');
        card.className = 'occurrence-card';

        // Limita a descrição para legibilidade
        const descricaoCurta = ocorrencia.detalhes.length > 100 ? ocorrencia.detalhes.substring(0, 100) + '...' : ocorrencia.detalhes;

        let acoesHtml = '<div class="actions">-</div>';
        if (ocorrencia.status === 'Registrada') {
            acoesHtml = `
                <div class="actions">
                    <button class="btn-analisar" onclick="iniciarAnalise(${index})">Iniciar Análise</button>
                    <button class="btn-resolver" onclick="resolver(${index})">Resolver</button>
                    <button class="btn-grave" onclick="marcarGrave(${index})">Marcar como Grave</button>
                </div>
            `;
        } else if (ocorrencia.status === 'EmAnálise') {
            acoesHtml = `
                <div class="actions">
                    <button class="btn-resolver" onclick="resolver(${index})">Resolver</button>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="occurrence-header">
                <h3 class="occurrence-title">${ocorrencia.tipoOcorrencia} - ${ocorrencia.funcionario}</h3>
                <div>
                    <span class="status-badge ${ocorrencia.status}">${ocorrencia.status}</span>
                    <span class="severity-badge ${ocorrencia.severidade}">${ocorrencia.severidade}</span>
                </div>
            </div>
            <p class="occurrence-meta">Data: ${formatDate(ocorrencia.dataOcorrencia)} | Hora: ${formatTime(ocorrencia.horaInicio)}</p>
            <p class="occurrence-description">${descricaoCurta}</p>
            <p class="occurrence-meta">Registrado em: ${formatDate(ocorrencia.dataRegistro || ocorrencia.dataOcorrencia)}</p>
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