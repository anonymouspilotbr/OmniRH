const pool = require('../model/db');

async function listarPorFuncionario(id_funcionario) {
    const query = `
        SELECT id, tipo, data_inicio, data_termino, motivo, anexos, status
        FROM recessos
        WHERE id_funcionario = $1
        ORDER BY created_at DESC
    `;
    const result = await pool.query(sql, [idFuncionario]);
    return result.rows;
}

async function criarRecesso({ id_funcionario, tipoRecesso, data_inicio, data_termino, motivo, anexos }) {
    const query = `
        INSERT INTO recessos 
            (id_funcionario, tipo, data_inicio, data_termino, motivo, anexos)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
    `;
    const anexosDB = anexos ? JSON.stringify(anexos) : null;
    const values = [
        id_funcionario,
        tipoRecesso,
        data_inicio,
        data_termino,
        motivo,
        anexosDB
    ];
    const result = await pool.query(sql, values);
    return result.rows[0];
}

module.exports = {
    listarPorFuncionario,
    criarRecesso,
}