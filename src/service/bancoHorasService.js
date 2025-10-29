const BHREP = require('../repositorie/bancoHoras');

const MAX_HORAS_EXTRAS_MES = 40;

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

module.exports = {
  consultarSaldo,
  ajustarSaldo,
};