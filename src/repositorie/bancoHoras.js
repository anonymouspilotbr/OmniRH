const pool = require('../model/db.js');

//Banco de Horas

async function buscarSaldo(usuarioId, mes, ano) {
  const result = await pool.query(
    `SELECT * FROM banco_horas WHERE id_funcionario = $1 AND mes = $2 AND ano = $3`,
    [usuarioId, mes, ano]
  );
  return result.rows[0];
}

async function criarSaldo(usuarioId, mes, ano, saldo) {
  await pool.query(
    `INSERT INTO banco_horas (id_funcionario, mes, ano, saldo) VALUES ($1, $2, $3, $4)`,
    [usuarioId, mes, ano, saldo]
  );
}

async function atualizarSaldo(usuarioId, mes, ano, extras) {
  const saldoAtual = await buscarSaldo(usuarioId, mes, ano);
  if (!saldoAtual) {
    await criarSaldo(usuarioId, mes, ano, extras);
  } else {
    await pool.query(
      `UPDATE banco_horas SET saldo = saldo + $1 WHERE id = $2`,
      [extras, saldoAtual.id]
    );
  }
}

async function ajustarSaldo(usuarioId, mes, ano, ajuste) {
  const saldoAtual = await buscarSaldo(usuarioId, mes, ano);
  if (!saldoAtual) {
    await criarSaldo(usuarioId, mes, ano, ajuste);
  } else {
    const novoSaldo = saldoAtual.saldo + ajuste;
    await pool.query(`UPDATE banco_horas SET saldo = $1 WHERE id = $2`, [
      novoSaldo,
      saldoAtual.id,
    ]);
  }
}

module.exports = {
  buscarSaldo,
  criarSaldo,
  atualizarSaldo,
  ajustarSaldo,
};