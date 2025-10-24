const pool = require('../model/db.js');

async function buscarFuncionario(id) {
  const query = `
        SELECT id, nome, cargo, email, telefone, departamento, gestor, data_admissao, foto_perfil 
        FROM funcionario 
        WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
}

async function inserirFuncionario({ nome, cpf, email, cargo, senha, telefone, departamento, gestor, data_admissao }) {
    const query = `
        INSERT INTO funcionario (nome, cpf, email, cargo, senha, telefone, departamento, gestor, data_admissao)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *;
    `;
    const values = [nome, cpf, email, cargo, senha, telefone, departamento, gestor, data_admissao];
    const result = await pool.query(query, values);
    return result.rows[0];
}

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

module.exports = { buscarFuncionario, inserirFuncionario, atualizarFoto, atualizarContato };
