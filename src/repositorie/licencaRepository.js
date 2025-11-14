const pool = require('../model/db.js');

// Funções para gerenciar licenças no banco de dados

async function inserirLicenca(id_funcionario, tipo_licenca, data_inicio, data_fim, observacoes, anexos) {
  const query = `
    INSERT INTO licencas (id_funcionario, tipo_licenca, data_inicio, data_fim, observacoes, anexos, status)
    VALUES ($1, $2, $3, $4, $5, $6, 'pendente')
    RETURNING id
  `;
  const result = await pool.query(query, [id_funcionario, tipo_licenca, data_inicio, data_fim, observacoes, anexos]);
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

async function listarLicencasPorFuncionario(id_funcionario) {
  const query = `
    SELECT id, tipo_licenca, to_char(data_inicio, 'YYYY-MM-DD') as data_inicio,
           to_char(data_fim, 'YYYY-MM-DD') as data_fim, observacoes, anexos, status
    FROM licencas
    WHERE id_funcionario = $1
    ORDER BY data_inicio DESC
  `;
  const result = await pool.query(query, [id_funcionario]);
  
  return result.rows.map(tratarLinha);
}

async function listarTodasLicencas() {
  const query = `
    SELECT l.id, l.tipo_licenca, to_char(l.data_inicio, 'YYYY-MM-DD') as data_inicio,
           to_char(l.data_fim, 'YYYY-MM-DD') as data_fim, l.observacoes, l.anexos, l.status,
           f.nome as nome_funcionario
    FROM licencas l
    JOIN funcionario f ON l.id_funcionario = f.id
    ORDER BY l.data_inicio DESC
  `;
  const result = await pool.query(query);
  
  return result.rows.map(tratarLinha);
}

async function atualizarStatusLicenca(id, status) {
  const query = `
    UPDATE licencas
    SET status = $1
    WHERE id = $2
  `;
  await pool.query(query, [status, id]);
}

async function buscarLicencaPorId(id) {
  const query = `
    SELECT l.*, f.nome AS nome_funcionario
    FROM licencas l
    JOIN funcionario f ON l.id_funcionario = f.id
    WHERE l.id = $1
  `;
  const result = await pool.query(query, [id]);
  
  return tratarLinha(result.rows[0]);
}

async function atualizarAnexo(idLicenca, urls) {
  const query = `
    UPDATE licencas
    SET anexos = $2
    WHERE id = $1
    RETURNING *;
  `;
  const values = [idLicenca, JSON.stringify(urls)];
  const result = await pool.query(query, values);
  return result.rows[0];
}

async function buscarPendentes() {
    const query = `
        SELECT l.*, f.nome AS funcionario_nome
        FROM licencas l
        JOIN funcionario f ON f.id = l.id_funcionario
        WHERE l.status = 'pendente'
        ORDER BY l.data_inicio DESC
    `;

    const { rows } = await pool.query(query);
    return rows;
}

module.exports = {
  inserirLicenca,
  listarLicencasPorFuncionario,
  listarTodasLicencas,
  atualizarStatusLicenca,
  buscarLicencaPorId,
  atualizarAnexo,
  buscarPendentes,
};
