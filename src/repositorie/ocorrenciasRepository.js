const pool = require('../model/db.js');

async function criarOcorrencia(data) {
    const query = `
        INSERT INTO ocorrencias 
        (id_funcionario, tipo_ocorrencia, motivo, data, detalhes, anexos, gravidade, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
    `
    const values = [
        data.id_funcionario, 
        data.tipo_ocorrencia, 
        data.motivo, 
        data.data, 
        data.detalhes, 
        data.anexos, 
        data.gravidade,
        data.status || "Em análise"
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
}

async function listarOcorrencias() {
    const result = await pool.query(`SELECT * FROM ocorrencias ORDER BY id DESC`);
    return result.rows;
}

async function listarPorFuncionario(id_funcionario) {
    const result = await pool.query(
        `SELECT * FROM ocorrencias WHERE id_funcionario = $1 ORDER BY id DESC`,
        [id_funcionario]
    );
    return result.rows;
}

async function buscarPorId(id) {
    const result = await pool.query(
        `SELECT * FROM ocorrencias WHERE id = $1`,
        [id]
    );
    return result.rows[0];
}

async function atualizarOcorrencia(id, campos) {
    const colunas = [];
    const valores = [];
    let index = 1;

    for (const key in campos) {
        if (campos[key] !== undefined) {
            colunas.push(`${key} = $${index}`);
            valores.push(campos[key]);
            index++;
        }
    }

    valores.push(id);

    const query = `
        UPDATE ocorrencias 
        SET ${colunas.join(', ')}, updated_at = now()
        WHERE id = $${index}
        RETURNING *;
    `;

    const result = await pool.query(query, valores);
    return result.rows[0];
}

async function deletarOcorrencia(id) {
    await pool.query(`DELETE FROM ocorrencias WHERE id = $1`, [id]);
    return true;
}

async function atualizarAnexo(id, anexos) {
        const query = `
        UPDATE ocorrencias 
        SET anexos = $1
        WHERE id = $2
        RETURNING *;
    `;
    const resultado = await pool.query(query, [anexos, id]);
    return resultado.rows[0];
}



module.exports = {
    criarOcorrencia,
    listarOcorrencias,
    listarPorFuncionario,
    buscarPorId,
    atualizarOcorrencia,
    deletarOcorrencia,
    atualizarAnexo,
}