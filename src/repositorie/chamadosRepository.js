const res = require("express/lib/response.js");
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
        c.status,
        COALESCE(c.servicos, '{}') AS servicos,
        COALESCE(c.comentarios, '{}') AS comentarios

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

async function buscarTecnicoPorID(idTecnico) {
    const query = `
        SELECT nome
        FROM funcionario
        WHERE id = $1 AND tipo = 'ADMIN'
    `;
    const result = await pool.query(query, [idTecnico]);
    return result.rows[0];
}

async function buscarTecnicoPorChamado(idChamado) {
    const query = `
        SELECT id_tecnico
        FROM chamados
        WHERE id = $1
    `;
    const result = await pool.query(query, [idChamado]);
    return result.rows[0];
}

async function buscarUsuarioPorID(idUsuario) {
    const query = `
        SELECT nome
        FROM funcionario
        WHERE id = $1
    `;
    const result = await pool.query(query, [idUsuario]);
    return result.rows[0];
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

async function registrarHistorico(idChamado, descricao) {
    const query = `
        INSERT INTO historico_chamados (chamado_id, descricao)
        VALUES ($1, $2)
    `;
    const result = await pool.query(query, [idChamado, descricao]);
    return result.rows[0];
}

async function listarHistorico(idChamado) {
    const query = `
        SELECT data_hora, descricao
        FROM historico_chamados
        WHERE chamado_id = $1
        ORDER BY data_hora ASC
    `;
    const result = await pool.query(query, [idChamado]);
    return result.rows;
}

module.exports = {
    criarChamado,
    listarChamados,
    listarPorSolicitante,
    buscarTecnicos,
    buscarTecnicoPorID,
    buscarTecnicoPorChamado,
    buscarUsuarioPorID,
    atribuirTecnico,
    adicionarServico,
    adicionarComentario,
    removerTecnico,
    concluirOS,
    registrarHistorico,
    listarHistorico,
}
