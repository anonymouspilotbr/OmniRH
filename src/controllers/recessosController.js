const recessosService = require('../service/recessosService');

async function listarPorFuncionario(req, res) {
    try {
        const idFuncionario = req.params.id;
        const lista = await recessosService.listarPorFuncionario(idFuncionario);
        return res.json(lista);
    } catch (err) {
        console.error("Erro ao listar recessos:", err);
        return res.status(500).json({ erro: "Erro ao listar recessos" });
    }
}

async function criarRecesso(req, res) {
    try {
        const dados = req.body;
        let anexos = null;
        if (req.files && req.files.length > 0) {
            anexos = req.files.map(f => f.filename);
        }

        const novo = await recessosService.criarRecesso({
            ...dados,
            anexos
        });

        return res.json(novo);
    } catch (err) {
        console.error("Erro ao criar recesso:", err);
        return res.status(500).json({ erro: "Erro ao criar recesso" });
    }
}

module.exports = {
    listarPorFuncionario,
    criarRecesso,
}