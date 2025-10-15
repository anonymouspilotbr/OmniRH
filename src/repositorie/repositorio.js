const pool = require('../model/db.js');

async function inserirFuncionario({ nome, cpf, email, cargo, senha }) {
    const query = `
        INSERT INTO funcionario (nome, cpf, email, cargo, senha)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;
    const values = [nome, cpf, email, cargo, senha];
    const result = await pool.query(query, values);
    return result.rows[0];
}

module.exports = { inserirFuncionario };
