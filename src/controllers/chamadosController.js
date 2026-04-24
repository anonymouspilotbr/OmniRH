const chamadosService = require('../service/chamadosService');

async function registrarChamado(req, res) {
    const { data, id_solicitante, desc } = req.body;

    if(!data || !id_solicitante){
        return res.status(400).json({ error: 'Dados obrigatórios não fornecidos' });
    }

    try{
        const chamado = await chamadosService.criarChamado(data, id_solicitante, desc);
        res.status(201).json({ message: 'Chamado registrado com sucesso', id: chamado.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message || 'Erro ao registrar chamado' });
    }
}

async function listarChamados(req, res) {
    try{
        const chamados = await chamadosService.listarChamados();
        res.json(chamados);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}

async function listarChamadosPorSolicitante(req, res) {
    const { id_solicitante } = req.params;
    try{
        const chamados = await chamadosService.listarPorSolicitante(id_solicitante);
        res.json(chamados);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}

async function atualizarStatusOS(req, res) {
    //TBD
}

module.exports = {
    registrarChamado,
    listarChamados,
    listarChamadosPorSolicitante,
    atualizarStatusOS,
}