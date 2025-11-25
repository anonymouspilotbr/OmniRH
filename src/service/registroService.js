const repositorio_registro = require('../repositorie/registroRepository');
const repositorio_banco = require('../repositorie/bancoRepository');

const JORNADA_DIARIA = 8;
const MAX_HORAS_EXTRAS_MES = 40;

function calcularHoras(entrada, saida) {
  if (!saida) return { horas: 0.0, extras: 0.0 };
  const entradaTime = new Date(`1970-01-01T${entrada}:00`);
  const saidaTime = new Date(`1970-01-01T${saida}:00`);
  const diffMs = saidaTime - entradaTime;
  const horas = diffMs / (1000 * 60 * 60);
  const extras = Math.max(0, horas - JORNADA_DIARIA);
  return { horas, extras };
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
  const hoje = new Date().toISOString().split('T')[0];
  const registroHoje = await repositorio_registro.buscarRegistroPorData(id_funcionario, hoje);

  if (!registroHoje) {
    const { hora } = agoraBrasil();
    await repositorio_registro.criarRegistro(id_funcionario, hora);
    return { mensagem: "Entrada registrada", entrada: hora };
  }

  if (registroHoje.saida == null) {
    const { hora: horaSaida } = agoraBrasil();
    await repositorio_registro.registrarSaida(registroHoje.id, horaSaida);

    const { horas, extras } = calcularHoras(registroHoje.entrada, horaSaida);

    const data = new Date(registroHoje.data);
    const mes = data.getMonth() + 1;
    const ano = data.getFullYear();
    await repositorio_banco.atualizarSaldo(id_funcionario, mes, ano, extras);

    return { mensagem: "Saída registrada", saida: horaSaida };
  }

  return {
    mensagem: "O ponto de hoje já está completo",
    registro: registroHoje
  };
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