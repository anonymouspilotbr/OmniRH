const pool = require('../model/db.js');

//Funcionários
async function buscarFuncionario(id) {
  const query = `
        SELECT id, nome, cargo, email, telefone, departamento, gestor, data_admissao, foto_perfil, regime, salario, horario_entrada, horario_saida 
        FROM funcionario 
        WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
}

async function inserirFuncionario({ nome, cpf, email, cargo, senha, telefone, departamento, gestor, data_admissao, regime, salario, horario_entrada, horario_saida }) {
    const query = `
        INSERT INTO funcionario (nome, cpf, email, cargo, senha, telefone, departamento, gestor, data_admissao, regime, salario, horario_entrada, horario_saida)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *;
    `;
    const values = [nome, cpf, email, cargo, senha, telefone, departamento, gestor, data_admissao, regime, salario, horario_entrada, horario_saida];
    const result = await pool.query(query, values);
    return result.rows[0];
}

async function buscarFuncionarioPorEmail(email){
  const query = `
    SELECT * FROM funcionario WHERE email = $1
  `
  const result = await pool.query(query, [email]);
    return result.rows[0];
}

async function criarToken(id_funcionario, token, expires) {
  const query = `INSERT INTO reset_tokens (id_funcionario, token, expires_at) VALUES ($1, $2, $3)`
  const values = [id_funcionario, token, expires]
  await pool.query(query, values);
}

async function buscarPorToken(token) {
  const query = `SELECT * FROM reset_tokens WHERE token = $1 AND used = false`
  const result = await pool.query(query, [token]);
  return result.rows[0];
}

async function marcarComoUsado(IDtoken) {
  const query = `UPDATE reset_tokens SET used = true WHERE id = $1`
  await pool.query(query, [IDtoken]);
}

async function atualizarSenha(id, senhaHash) {
  const query = `UPDATE funcionario SET senha = $1 WHERE id = $2  RETURNING *`
  await pool.query(query, [senhaHash, id])
}

//Tela de Perfil
async function atualizarFoto(userId, caminho) {
  const query = `
    UPDATE funcionario
    SET foto_perfil = $1
    WHERE id = $2
    RETURNING id, foto_perfil;
  `;
  const result = await pool.query(query, [caminho, userId]);
  return result.rows[0];
}

async function atualizarContato(userId, email, telefone) {
  const query = `
    UPDATE funcionario
    SET email = $1, telefone = $2
    WHERE id = $3
    RETURNING id, email, telefone
  `;
  const result = await pool.query(query, [email, telefone, userId]);
  return result.rows[0];
}

async function buscarJornada(id_funcionario) {
  const sql = `
    SELECT horario_entrada, horario_saida
    FROM funcionario
    WHERE id = $1
  `;
  const result = await pool.query(sql, [id_funcionario]);

  if (result.rows.length === 0) return null;
  return result.rows[0];
}

module.exports = { 
  buscarFuncionario, 
  inserirFuncionario, 
  buscarFuncionarioPorEmail, 
  criarToken,
  buscarPorToken,
  marcarComoUsado,
  atualizarSenha,
  atualizarFoto, 
  atualizarContato,
  buscarJornada,
};
