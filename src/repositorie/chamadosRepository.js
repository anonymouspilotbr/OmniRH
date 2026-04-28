const pool = require("../model/db.js");

async function criarChamado(data, id_solicitante, desc) {
    const query = `
        INSERT INTO chamados (data_hora, solicitante, empresa, descricao)
        SELECT $1, $2, f.id_empresa, $3
        FROM funcionario f
        WHERE f.id = $2
        RETURNING id
    `;
    const result = await pool.query(query, [data, id_solicitante, desc]);
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
        (
            SELECT json_agg(serv)
            FROM servicos serv
            WHERE serv.chamado_id = c.id
        ) AS servicos,

        (
            SELECT json_agg(com)
            FROM comentarios com
            WHERE com.chamado_id = c.id
        ) AS comentarios

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

async function buscarTecnicos() {
    const query = `
        SELECT *
        FROM funcionario
        WHERE tipo = 'ADMIN'
    `;
    const result = await pool.query(query)
    return result.rows;
}

async function atribuirTecnico(idChamado, idTecnico) {
    const query = `
        UPDATE chamados
        SET id_tecnico = $1, 
        status = 'À disposição do técnico'
        WHERE id = $2
        RETURNING *
    `;
    const result = await pool.query(query, [idTecnico, idChamado]);
    return result.rows[0];
}

async function adicionarServico(idChamado, servico) {
    const query = `
        UPDATE chamados
        SET servicos = array_append(COALESCE(servicos, '{}'), $1),
        status = 'Em andamento'
        WHERE id = $2
        RETURNING *
    `;
    const result = await pool.query(query, [servico, idChamado]);
    return result.rows[0];
}

async function adicionarComentario(idChamado, comentario) {
    const query = `
        UPDATE chamados
        SET comentarios = array_append(COALESCE(comentarios, '{}'), $1)
        WHERE id = $2
        RETURNING *
    `;
    const result = await pool.query(query, [comentario, idChamado]);
    return result.rows[0];
}

async function removerTecnico(idChamado) {
    const query = `
        UPDATE chamados
        SET id_tecnico = NULL,
        status = 'Aguardando triagem'
        WHERE id = $1
        RETURNING *
    `;
    const result = await pool.query(query, [idChamado]);
    return result.rows[0];
}

async function concluirOS(idChamado) {
    const query = `
        UPDATE chamados
        SET status = 'Concluído'
        WHERE id = $1
        AND status = 'Em andamento'
        AND array_length(servicos, 1) > 0
        RETURNING *
    `;
    const result = await pool.query(query, [idChamado]);
    return result.rows[0];
}

module.exports = {
    criarChamado,
    listarChamados,
    listarPorSolicitante,
    buscarTecnicos,
    atribuirTecnico,
    adicionarServico,
    adicionarComentario,
    removerTecnico,
    concluirOS,
}
