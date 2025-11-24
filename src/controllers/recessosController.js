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

        const novo = await recessosService.criarRecesso({
            id_funcionario: dados.id_funcionario,
            tipo: dados.tipo,
            data_inicio: dados.data_inicio,
            data_termino: dados.data_termino,
            motivo: dados.motivo,
            anexos: null
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