const pool = require('../model/db.js');

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

module.exports = { inserirFuncionario, atualizarFoto };
