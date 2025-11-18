const service = require('../service/ocorrenciasService');


async function criar(req, res) {
    
    try {
        console.log(">>> REQ.HEADERS:", req.headers);
        console.log(">>> REQ.BODY:", req.body);
        console.log(">>> REQ.FILES:", req.files);
        
        const data = {
            id_funcionario: req.body.id_funcionario,
            tipo_ocorrencia: req.body.tipo_ocorrencia,
            motivo: req.body.motivo,
            data: req.body.data,
            detalhes: req.body.detalhes,
            anexos: req.body.anexos,       
            gravidade: req.body.gravidade || "Em análise"
        };
        
        if (req.files && req.files.length > 0) {
            data.anexos = JSON.stringify(req.files);
        }

        const ocorrencia = await service.criar(data);
        res.status(201).json({ message: 'Ocorrência registrada com sucesso', id: ocorrencia.id });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

async function listar(req, res) {
    try {
        const lista = await service.listar();
        res.json(lista);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function listarPorFuncionario(req, res) {
    try {
        const { id_funcionario } = req.params;
        const lista = await service.listarPorFuncionario(id_funcionario);
        res.json(lista);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function buscarPorId(req, res) {
    try {
        const ocorrencia = await service.buscarPorId(req.params.id);
        res.json(ocorrencia);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
}

async function atualizar(req, res) {
    try {
        const ocorrencia = await service.atualizar(req.params.id, req.body);
        res.json(ocorrencia);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

async function deletar(req, res) {
    try {
        await service.deletar(req.params.id);
        res.json({ message: "Ocorrência removida com sucesso" });
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
}

module.exports = {
    criar,
    listar,
    listarPorFuncionario,
    buscarPorId,
    atualizar,
    deletar,
};