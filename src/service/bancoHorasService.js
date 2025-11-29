const BHREP = require('../repositorie/bancoRepository');

const MAX_HORAS_EXTRAS_MES = 40;
const JORNADA_DIARIA = 8; // Horas por dia

async function consultarSaldo(usuarioId, mes, ano) {
  const saldo = await BHREP.buscarSaldo(usuarioId, mes, ano);
  return {
    saldo: saldo ? saldo.saldo : 0.0,
    maximo: MAX_HORAS_EXTRAS_MES,
  };
}

async function ajustarSaldo(usuarioId, ajuste, mes, ano) {
  const saldoAtual = await BHREP.buscarSaldo(usuarioId, mes, ano);
  const saldoNovo = (saldoAtual ? saldoAtual.saldo : 0) + ajuste;

  if (saldoNovo > MAX_HORAS_EXTRAS_MES) {
    throw new Error('Ajuste excede o máximo permitido');
  }

  await BHREP.ajustarSaldo(usuarioId, mes, ano, ajuste);
  return { novo_saldo: saldoNovo };
}

// Função auxiliar: Calcular horas trabalhadas e extras
function calcularHoras(entrada, saida) {
  if (!saida) return { horas: 0.0, extras: 0.0 };
  const entradaTime = new Date(`1970-01-01T${entrada}:00`);
  const saidaTime = new Date(`1970-01-01T${saida}:00`);
  const diffMs = saidaTime - entradaTime;
  const horas = diffMs / (1000 * 60 * 60);
  const extras = Math.max(0, horas - JORNADA_DIARIA);
  return { horas, extras };
}

// Função auxiliar: Verificar se o máximo mensal foi atingido
async function verificarMaximoMensal(usuarioId, mes, ano) {
  const saldoAtual = await BHREP.buscarSaldo(usuarioId, mes, ano);
  const saldo = saldoAtual ? saldoAtual.saldo : 0.0;
  return saldo >= MAX_HORAS_EXTRAS_MES;
}

// Atualizar saldo do banco de horas
async function atualizarSaldo(usuarioId, mes, ano, extras) {
  await BHREP.atualizarSaldo(usuarioId, mes, ano, extras);
}

module.exports = {
  consultarSaldo,
  ajustarSaldo,
  calcularHoras,
  verificarMaximoMensal,
  atualizarSaldo,
};
