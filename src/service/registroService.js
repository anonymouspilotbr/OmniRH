const repositorio_registro = require('../repositorie/registroHoras');
const repositorio_banco = require('../repositorie/bancoHoras');

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

async function registrarEntrada(usuarioId, entrada) {
  const hoje = new Date().toISOString().split('T')[0];
  return await registroRepository.inserirEntrada(usuarioId, hoje, entrada);
}

async function registrarSaida(registroId, saida) {
  const registro = await registroRepository.buscarRegistroPorId(registroId);
  if (!registro) throw new Error('Registro não encontrado');

  const { horas, extras } = calcularHoras(registro.entrada, saida);
  await registroRepository.atualizarSaida(registroId, saida, horas, extras);

  const mes = new Date(registro.data).getMonth() + 1;
  const ano = new Date(registro.data).getFullYear();

  await bancoHorasRepository.atualizarSaldo(registro.usuario_id, mes, ano, extras);

  return { horas, extras };
}

async function listarRegistros(usuarioId) {
  return await registroRepository.listarPorUsuario(usuarioId);
}

module.exports = { registrarEntrada, registrarSaida, listarRegistros };