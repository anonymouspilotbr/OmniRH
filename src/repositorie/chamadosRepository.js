const pool = require("../model/db.js");

async function criarChamado(data, id_solicitante, desc) {
    const query = `
        INSERT INTO chamados (data_hora, solicitante, empresa, descricao)
        SELECT $1, $2, f.id_empresa, $3
        FROM funcionario f
        WHERE f.id = $2
        RETURNING id
    `;
    const result = await pool.query(query, [data, id_solicitante, id_empresa, desc]);
    return result.rows[0];
}

async function listarChamados() {
    const query = `
        SELECT c.id,
        c.data_hora,
        s.nome AS solicitante,
        e.nome AS empresa,
        c.descricao,
        t.nome AS tecnico,
        c.status
        FROM chamados c
        LEFT JOIN empresas e ON e.id = c.empresa
        LEFT JOIN funcionario s ON s.id = c.solicitante
        LEFT JOIN funcionario t ON t.id = c.id_tecnico
        ORDER BY c.data_hora DESC
    `;
    const result = await pool.query(query);
    return result.rows;
}

async function listarPorSolicitante(id_solicitante) { 
    //talvez precise de revisões
    const query = `
        SELECT *
        FROM chamados
        WHERE solicitante = $1
        ORDER BY data_hora DESC
    `;
    const result = await pool.query(query, [id_solicitante]);
    return result.rows;
}

async function atualizarStatus(id, status) {
    //atualizar status
}

module.exports = {
    criarChamado,
    listarChamados,
    listarPorSolicitante,
    atualizarStatus,
}
