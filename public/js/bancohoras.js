document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('Nenhum token encontrado');
    return;
  }

  try {
    // Buscar dados do usuário
    const userRes = await fetch('https://omnirh.onrender.com/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!userRes.ok) {
      throw new Error(`Erro ao buscar usuário: ${userRes.status}`);
    }
    const user = await userRes.json();
    if (!user || !user.id) {
      console.warn('Usuário não encontrado');
      return;
    }

    const userId = user.id;
    const horarioEntrada = user.horario_entrada; // e.g. "08:00:00"
    const horarioSaida = user.horario_saida;

    // Mês e ano atuais
    const now = new Date();
    const mes = now.getMonth() + 1;
    const ano = now.getFullYear();

    // Buscar saldo
    const saldoRes = await fetch(`https://omnirh.onrender.com/banco-horas/${userId}?mes=${mes}&ano=${ano}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!saldoRes.ok) {
      throw new Error(`Erro ao buscar saldo: ${saldoRes.status}`);
    }
    const saldoData = await saldoRes.json();
    const saldo = saldoData.saldo || 0;

    // Formatar saldo como hh:mm
    const saldoFormatted = formatHorasMinutos(saldo);

    // Atualizar saldo no DOM
    const saldoElement = document.querySelector('.bg-white.text-center.shadow-lg.px-4.py-2.rounded-lg.shadow-md.w-fit.mx-auto h3');
    if (saldoElement) {
      saldoElement.textContent = saldoFormatted;
    }

    // Buscar registros
    const registrosRes = await fetch(`https://omnirh.onrender.com/registro/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const registros = await registrosRes.json();

    // Filtrar registros do mês atual
    const registrosMes = registros.filter(r => {
      const data = new Date(r.data);
      return data.getMonth() + 1 === mes && data.getFullYear() === ano;
    });

    // Calcular tempo total (soma de horas trabalhadas)
    const tempoTotal = registrosMes.reduce((sum, r) => sum + (r.horas_trabalhadas || 0), 0);
    const tempoTotalFormatted = formatHorasMinutos(tempoTotal);

    // Atualizar tempo total
    const tempoTotalElement = document.querySelector('.bg-white.text-center.shadow-lg.px-4.py-2.rounded-lg.shadow-md.w-fit.mx-auto p:last-child');
    if (tempoTotalElement) {
      tempoTotalElement.textContent = `Tempo total: ${tempoTotalFormatted}`;
    }

    // Calcular semana atual (domingo a sábado)
    const hoje = new Date();
    const diaSemana = hoje.getDay(); // 0=dom, 6=sab
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - diaSemana);
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(inicioSemana.getDate() + 6);

    // Atualizar período da semana
    const mesNome = inicioSemana.toLocaleDateString('pt-BR', { month: 'long' });
    const anoSemana = inicioSemana.getFullYear();
    const diaInicio = inicioSemana.getDate();
    const diaFim = fimSemana.getDate();
    const periodoSemana = `${diaInicio} a ${diaFim} de ${mesNome} de ${anoSemana}`;
    const periodoElement = document.querySelector('.bg-indigo-50.text-gray-900.px-4.py-2.rounded-md.font-bold');
    if (periodoElement) {
      periodoElement.textContent = periodoSemana;
    }

    // Gerar dias da semana
    const diasSemana = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
    const containerHistorico = document.querySelector('.space-y-2');
    if (containerHistorico) {
      containerHistorico.innerHTML = ''; // Limpar histórico estático

      for (let i = 0; i < 7; i++) {
        const data = new Date(inicioSemana);
        data.setDate(inicioSemana.getDate() + i);
        const dataStr = data.toISOString().split('T')[0];
        const diaNome = diasSemana[i];
        const diaMes = data.getDate();

        // Encontrar registro para essa data
        const registro = registrosMes.find(r => r.data === dataStr);

        let entrada = '--:--:--';
        let saida = '--:--:--';
        let tempoServico = '--:--:--';
        let tempoArmazenado = '--:--:--';
        let ocorrencias = 'Sem ocorrências';
        let ocorrenciasClass = 'text-green-500';
        let entradaClass = '';
        let saidaClass = '';
        let tempoServicoClass = 'text-green-500';
        let tempoArmazenadoClass = 'text-green-500';

        if (registro) {
          entrada = registro.entrada || '--:--:--';
          saida = registro.saida || '--:--:--';
          if (registro.horas_trabalhadas) {
            tempoServico = formatHorasMinutosSegundos(registro.horas_trabalhadas);
            tempoServicoClass = 'text-green-500';
          }
          if (registro.horas_extras) {
            tempoArmazenado = formatHorasMinutos(registro.horas_extras);
            tempoArmazenadoClass = registro.horas_extras > 0 ? 'text-green-500' : '';
          }

          // Verificar atraso
          if (registro.entrada && horarioEntrada) {
            const entradaTime = new Date(`2000-01-01T${registro.entrada}`);
            const esperadoTime = new Date(`2000-01-01T${horarioEntrada}`);
            const diffMs = entradaTime - esperadoTime;
            if (diffMs > 5 * 60 * 1000) { // 5 minutos
              ocorrencias = '<p class="text-red-500"><i class="fa-solid fa-circle-exclamation"></i> Atraso - Não Resolvida</p>';
              entradaClass = 'text-red-500';
            }
          }

          // Verificar saída antecipada ou extra
          if (registro.saida && horarioSaida) {
            const saidaTime = new Date(`2000-01-01T${registro.saida}`);
            const esperadoSaidaTime = new Date(`2000-01-01T${horarioSaida}`);
            const diffMs = saidaTime - esperadoSaidaTime;
            if (Math.abs(diffMs) > 5 * 60 * 1000) {
              if (!ocorrencias.includes('Atraso')) {
                ocorrencias = '<p class="text-yellow-500">Horário Alternativo</p>';
              }
              saidaClass = 'text-yellow-500';
            }
          }
        }

        // HTML para o dia (div-based table)
        const diaHtml = `
          <div class="bg-gray-50 rounded-2xl shadow-lg p-6 w-full mx-auto">
            <div class="flex items-center justify-between grid grid-cols-7 gap-4 w-full">
              <div>
                <p><span class="font-bold ${diaNome === 'DOM' || diaNome === 'SÁB' ? 'text-red-500' : ''}">${diaNome}</span></p>
              </div>
              <div class="text-center">
                <p><span class="font-bold">Data</span></p>
                <p>${diaMes.toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}/${ano}</p>
              </div>
              <div class="text-center">
                <p><span class="font-bold">Entrada</span></p>
                <p class="${entradaClass}">${entrada}</p>
              </div>
              <div class="text-center">
                <p><span class="font-bold">Saída</span></p>
                <p class="${saidaClass}">${saida}</p>
              </div>
              <div class="text-center">
                <p><span class="font-bold">Tempo de Serviço</span></p>
                <p class="${tempoServicoClass}">${tempoServico}</p>
              </div>
              <div class="text-center">
                <p><span class="font-bold">Tempo armazenado</span></p>
                <p class="${tempoArmazenadoClass}">${tempoArmazenado}</p>
              </div>
              <div class="text-center">
                <p><span class="font-bold">Ocorrências</span></p>
                <p class="${ocorrenciasClass}">${ocorrencias}</p>
              </div>
            </div>
          </div>
        `;
        containerHistorico.insertAdjacentHTML('beforeend', diaHtml);
      }
    }

  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  }
});

function formatHorasMinutos(horas) {
  const h = Math.floor(horas);
  const m = Math.floor((horas - h) * 60);
  return `${h.toString().padStart(2, '0')}h${m.toString().padStart(2, '0')}m`;
}

function formatHorasMinutosSegundos(horas) {
  const h = Math.floor(horas);
  const m = Math.floor((horas - h) * 60);
  const s = Math.floor(((horas - h) * 60 - m) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
