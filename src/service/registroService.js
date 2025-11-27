const repositorio_registro = require('../repositorie/registroRepository');
const repositorio_banco = require('../repositorie/bancoRepository');
const repositorio_funcionario = require('../repositorie/repositorio');
const repositorio_ocorrencias = require('../repositorie/ocorrenciasRepository');

const JORNADA_DIARIA = 8;
const MAX_HORAS_EXTRAS_MES = 40;

function compararJornada(entradaEsperada, saidaEsperada, entradaReal, saidaReal) {
  const EntEsperada = new Date(`2000-01-01T${entradaEsperada}`);
  const SaiEsperada = new Date(`2000-01-01T${saidaEsperada}`);
  const EntReal = new Date(`2000-01-01T${entradaReal}`);
  const SaiReal = new Date(`2000-01-01T${saidaReal}`);

  const atrasoEntradaMs = EntReal - EntEsperada;
  const atrasoEntrada = atrasoEntradaMs > 0 ? atrasoEntradaMs : 0; 
  const adiantadoEntrada = atrasoEntradaMs < 0 ? Math.abs(atrasoEntradaMs) : 0;

  const diferencaSaidaMs = SaiReal - SaiEsperada;
  const saidaAntes = diferencaSaidaMs < 0 ? Math.abs(diferencaSaidaMs) : 0;
  const horaExtra = diferencaSaidaMs > 0 ? diferencaSaidaMs : 0;

  const jornadaReal = SaiReal - EntReal;
  const jornadaEsperada = SaiEsperada - EntEsperada;

  return {
    atrasoEntrada: msParaHorasMinutos(atrasoEntrada),
    adiantadoEntrada: msParaHorasMinutos(adiantadoEntrada),
    saidaAntes: msParaHorasMinutos(saidaAntes),
    horaExtra: msParaHorasMinutos(horaExtra),
    jornadaReal: msParaHorasMinutos(jornadaReal),
    jornadaEsperada: msParaHorasMinutos(jornadaEsperada)
  };
}

function msParaHorasMinutos(ms) {
  const h = Math.floor(ms / 1000 / 60 / 60);
  const m = Math.floor((ms / 1000 / 60) % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function calcularHoras(entrada, saida) {
  if (!saida) return { horas: 0.0, extras: 0.0 };

  const [hE, mE, sE] = entrada.split(":").map(Number);
  const [hS, mS, sS] = saida.split(":").map(Number);

  const entradaSeg = hE * 3600 + mE * 60 + sE;
  const saidaSeg = hS * 3600 + mS * 60 + sS;

  let diffHoras = (saidaSeg - entradaSeg) / 3600;
  if (diffHoras < 0) diffHoras += 24; 

  const extras = Math.max(0, diffHoras - JORNADA_DIARIA);
  return { horas: diffHoras, extras };
}

function agoraBrasil() {
  const dataLocal = new Date().toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo"
  });

  const [dia, mes, anoHora] = dataLocal.split("/");
  const [ano, hora] = anoHora.split(", ");

  return {
    data: `${ano}-${mes}-${dia}`,
    hora: hora // HH:MM:SS
  };
}

async function registrarPonto(id_funcionario) {
  const { data: hoje } = agoraBrasil();
  const registroHoje = await repositorio_registro.buscarRegistroPorData(id_funcionario, hoje);

  if (!registroHoje) {
    const { hora } = agoraBrasil();
    const idRegistro = await repositorio_registro.criarRegistro(id_funcionario, hora);
    return { mensagem: "Entrada registrada", entrada: hora, id: idRegistro };
  }

  if (registroHoje.saida == null) {
    const { hora: horaSaida } = agoraBrasil();

    const entradaFormatada = String(registroHoje.entrada).substring(0, 8);
    const { horas, extras } = calcularHoras(entradaFormatada, horaSaida);

    const funcionario = await repositorio_funcionario.buscarFuncionario(id_funcionario);
    const EntEsperada = funcionario.horario_entrada;
    const SaiEsperada = funcionario.horario_saida;

    const compara = compararJornada(EntEsperada, SaiEsperada, entradaFormatada, horaSaida);
    
    await repositorio_registro.registrarSaida(registroHoje.id, horaSaida, horas, extras);

    const data = new Date(registroHoje.data);
    const mes = data.getMonth() + 1;
    const ano = data.getFullYear();
    await repositorio_banco.atualizarSaldo(id_funcionario, mes, ano, extras);

    const atrasoMin = tempoParaMinutos(compara.atrasoEntrada);
    if(atrasoMin > 5){
      const dadosOcorrencia = {
        id_funcionario: id_funcionario,
        tipo_ocorrencia: "Atraso",
        motivo: "Automático (Sistema)",
        data: hoje,
        detalhes: `Entrada esperada: ${EntEsperada}. Entrada registrada: ${entradaFormatada}. Atraso: ${compara.atrasoEntrada}.`,
        anexos: null,
        gravidade: "Média",
        status: "Em análise"
      };

      await repositorio_ocorrencias.criarOcorrencia(dadosOcorrencia);
    }

    return { mensagem: "Saída registrada", saida: horaSaida, comparacao: compara };
  }

  return {
    mensagem: "O ponto de hoje já está completo",
    registro: registroHoje
  };
}

function tempoParaMinutos(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

async function listarRegistros(usuarioId) {
  return await repositorio_registro.listarPorUsuario(usuarioId);
}

async function listarSemana(id_funcionario, dataInicioISO) {
  const dataAdmissaoISO = await repositorio_registro.buscarDataAdmissao(id_funcionario);
  if (!dataAdmissaoISO) return [];

  const inicio = new Date(dataInicioISO + 'T00:00:00');
  const fimDate = new Date(inicio);
  fimDate.setDate(inicio.getDate() + 6);
  const fimISO = fimDate.toISOString().split('T')[0];

  const [aY, aM, aD] = dataAdmissaoISO.split('-').map(Number);
  const admDate = new Date(aY, aM - 1, aD);

  const inicioDate = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate());
  const realInicioDate = admDate > inicioDate ? admDate : inicioDate;
  const realInicioISO = realInicioDate.toISOString().split('T')[0];

  const registros = await repositorio_registro.buscarPorPeriodo(id_funcionario, realInicioISO, fimISO);
  return registros;
}

module.exports = { 
registrarPonto,
listarRegistros,
listarSemana,
};
