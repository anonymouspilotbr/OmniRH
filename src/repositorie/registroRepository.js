const pool = require('../model/db.js');

async function buscarRegistroPorId(id) {
  const result = await pool.query('SELECT * FROM registros_horas WHERE id = $1', [id]);
  return result.rows[0];
}

async function buscarPorPeriodo(id_funcionario, inicioISO, fimISO) {
  const query = `
    SELECT
      to_char(data, 'YYYY-MM-DD') as data,
      to_char(entrada, 'HH24:MI:SS') as entrada,
      to_char(saida, 'HH24:MI:SS') as saida
    FROM registros_horas
    WHERE id_funcionario = $1
      AND data BETWEEN $2::date AND $3::date
    ORDER BY data ASC
  `;
  const res = await pool.query(query, [id_funcionario, inicioISO, fimISO]);
  return res.rows;
}

async function buscarRegistroPorData(id_funcionario, data) {
    const sql = `
        SELECT *
        FROM registros_horas
        WHERE id_funcionario = $1
          AND data = $2
        LIMIT 1
    `;
    const { rows } = await pool.query(sql, [id_funcionario, data]);
    return rows[0];
}

async function criarRegistro(id_funcionario, entrada) {
    const sql = `
        INSERT INTO registros_horas (id_funcionario, data, entrada)
        VALUES ($1, CURRENT_DATE, $2)
    `;
    await pool.query(sql, [id_funcionario, entrada]);
}

async function registrarSaida(id, saida, horas, extras) {
    const sql = `
        UPDATE registros_horas
        SET saida = $1
            horas_trabalhadas = $2,
            horas_extras = $3
        WHERE id = $4
    `;
    await pool.query(sql, [saida, horas, extras, id]);
}

async function listarPorUsuario(usuarioId) {
  const result = await pool.query('SELECT * FROM registros_horas WHERE id_funcionario = $1', [usuarioId]);
  return result.rows;
}

async function buscarDataAdmissao(id_funcionario) {
  const q = `SELECT to_char(data_admissao, 'YYYY-MM-DD') as data_admissao FROM funcionario WHERE id = $1`;
  const res = await pool.query(q, [id_funcionario]);
  return res.rows[0] ? res.rows[0].data_admissao : null;
}

module.exports = {
    //inserirEntrada,
    //atualizarSaida,
    buscarRegistroPorId,
    buscarRegistroPorData,
    criarRegistro,
    registrarSaida,
    buscarPorPeriodo,
    listarPorUsuario,
    buscarDataAdmissao,
}
