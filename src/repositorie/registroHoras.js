const pool = require('../model/db.js');

//Registro de Horas e Folha de ponto

async function inserirEntrada(usuarioId, data, entrada) {
  const query = `
    INSERT INTO registros_horas (id_funcionario, data, entrada)
    VALUES ($1, $2, $3)
    RETURNING id
  `;
  const result = await pool.query(query, [usuarioId, data, entrada]);
  return result.rows[0];
}

async function atualizarSaida(id, saida, horas, extras) {
  const query = `
    UPDATE registros_horas
    SET saida = $1, horas_trabalhadas = $2, horas_extras = $3
    WHERE id = $4
  `;
  await pool.query(query, [saida, horas, extras, id]);
}

async function buscarRegistroPorId(id) {
  const result = await pool.query('SELECT * FROM registros_horas WHERE id = $1', [id]);
  return result.rows[0];
}

async function listarPorUsuario(usuarioId) {
  const result = await pool.query('SELECT * FROM registros_horas WHERE id_funcionario = $1', [usuarioId]);
  return result.rows;
}

module.exports = {
    inserirEntrada,
    atualizarSaida,
    buscarRegistroPorId,
    listarPorUsuario,
}