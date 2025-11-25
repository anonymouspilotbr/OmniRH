const pool = require('../model/db');

async function listarPorFuncionario(id_funcionario) {
    const query = `
        SELECT id, tipo, data_inicio, data_termino, motivo, anexos, status
        FROM recessos
        WHERE id_funcionario = $1
        ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [id_funcionario]);
    return result.rows;
}

async function criarRecesso({ id_funcionario, tipo, data_inicio, data_termino, motivo, anexos }) {
    const query = `
        INSERT INTO recessos 
            (id_funcionario, tipo, data_inicio, data_termino, motivo, anexos)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
    `;
    const anexosDB = anexos ? JSON.stringify(anexos) : null;
    const values = [
        id_funcionario,
        tipo,
        data_inicio,
        data_termino,
        motivo,
        anexosDB
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
}

function tratarLinha(linha) {
  if (!linha) return linha;

  if (linha.anexos) {
    try {
      linha.anexos = JSON.parse(linha.anexos);
    } catch (e) {
      linha.anexos = []; 
    }
  }

  return linha;
}

async function listarTodosRecessos() {
  const query = `
    SELECT r.id, r.tipo, to_char(r.data_inicio, 'YYYY-MM-DD') as data_inicio,
           to_char(r.data_termino, 'YYYY-MM-DD') as data_termino, r.motivo, r.anexos, r.status,
           f.nome as nome_funcionario
    FROM recessos r
    JOIN funcionario f ON r.id_funcionario = f.id
    ORDER BY r.data_inicio DESC
  `;
  const result = await pool.query(query);
  
  return result.rows.map(tratarLinha);
}

async function atualizarStatusRecesso(id, status) {
  const query = `
    UPDATE recessos
    SET status = $1
    WHERE id = $2
  `;
  await pool.query(query, [status, id]);
}

async function atualizarAnexo(id, anexos) {
        const query = `
        UPDATE recessos 
        SET anexos = $1
        WHERE id = $2
        RETURNING *;
    `;
    const resultado = await pool.query(query, [anexos, id]);
    return resultado.rows[0];
}

async function buscarPorId(id) {
  const query = `
    SELECT r.*, f.nome AS nome_funcionario
    FROM recessos r
    JOIN funcionario f ON r.id_funcionario = f.id
    WHERE r.id = $1
  `;
  const result = await pool.query(query, [id]);
  
  return tratarLinha(result.rows[0]);
}

async function buscarPendentes() {
    const query = `
        SELECT r.*, f.nome AS nome_funcionario
        FROM recessos r
        JOIN funcionario f ON f.id = r.id_funcionario
        WHERE r.status = 'em análise'
        ORDER BY r.data_inicio DESC
    `;

    const { rows } = await pool.query(query);
    return rows;
}

async function obterEstatisticas() {
    const query = `
        SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN status = 'em análise' THEN 1 ELSE 0 END) AS pendentes,
            SUM(CASE WHEN status = 'aprovado' THEN 1 ELSE 0 END) AS aprovados
        FROM recessos;
    `;

    const { rows } = await pool.query(query);
    return rows[0];
}

async function buscarAprovados() {
    const query = `
        SELECT r.*, f.nome AS nome_funcionario
        FROM recessos r
        JOIN funcionario f ON f.id = r.id_funcionario
        WHERE r.status = 'aprovado'
        ORDER BY r.data_inicio DESC
    `;

    const result = await pool.query(query);
    return result.rows;
}

module.exports = {
    listarPorFuncionario,
    criarRecesso,
    listarTodosRecessos,
    atualizarStatusRecesso,
    atualizarAnexo,
    buscarPorId,
    buscarPendentes,
    obterEstatisticas,
    buscarAprovados,
}
