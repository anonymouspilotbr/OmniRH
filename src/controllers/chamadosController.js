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

async function listarTecnicos(req, res) {
    try{
        const tecnicos = await chamadosService.buscarTecnicos();
        res.json(tecnicos);
    } catch (error) {
        console.error("Erro ao buscar técnicos:", error);
        res.status(500).json({ error: "Erro ao buscar técnicos" });
    }
}

async function atribuirTecnico(req, res) {
    try{
        const { id } = req.params;
        const { id_tecnico } = req.body;

        const chamado = await chamadosService.atribuirTecnico(id, id_tecnico);
        res.json(chamado);
    } catch (error) {
        console.error("Erro ao atribuir técnico: ", error);
        res.status(500).json({ error: "Erro ao atribuir técnico" });
    }
}

async function adicionarServico(req, res) {
    try{
        const { id } = req.params;
        const { servico } = req.body;

        const chamado = await chamadosService.adicionarServico(id, servico);
        res.json(chamado);
    } catch (error) {
        console.error("Erro ao adicionar serviço: ", error);
        res.status(500).json({ error: "Erro ao adicionar serviço" });
    }
}

async function adicionarComentario(req, res) {
    try{
        const { id } = req.params;
        const { comment } = req.body;

        const chamado = await chamadosService.adicionarComentario(id, comment);
        res.json(chamado);
    } catch (error) {
        console.error("Erro ao adicionar comentário: ", error);
        res.status(500).json({ error: "Erro ao adicionar comentário" });
    }
}

module.exports = {
    registrarChamado,
    listarChamados,
    listarChamadosPorSolicitante,
    listarTecnicos,
    atribuirTecnico,
    adicionarServico,
    adicionarComentario,
}