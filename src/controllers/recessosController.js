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

async function listarTodosRecessos(req, res) {
  try {
    const recessos = await recessosService.listarTodosRecessos();
    res.json(recessos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar recessos' });
  }
}

async function buscarRecessoPorId(req, res) {
  const { id } = req.params;

  try {
    const recesso = await recessosService.buscarPorId(id);
    res.json(recesso);
  } catch (err) {
    console.error(err);
    if (err.message === 'Recesso não encontrado') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Erro ao buscar recesso' });
  }
}

async function aprovarRecesso(req, res) {
  const { id } = req.params;

  try {
    await recessosService.aprovarRecesso(id);
    res.json({ message: 'Recesso aprovado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao aprovar recesso' });
  }
}

async function rejeitarRecesso(req, res) {
  const { id } = req.params;

  try {
    await recessosService.rejeitarRecesso(id);
    res.json({ message: 'Recesso rejeitado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao rejeitar recesso' });
  }
}

async function listarPendentes(req, res) {
    try {
        const lista = await recessosService.listarPendentes();
        res.json(lista);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao listar recessos pendentes" });
    }
}

async function estatisticas(req, res) {
    try {
        const dados = await recessosService.obterEstatisticas();
        res.json(dados);
    } catch (error) {
        console.error("Erro ao obter estatísticas:", error);
        res.status(500).json({ error: "Erro ao obter estatísticas" });
    }
}

async function buscarAprovados(req, res) {
    try {
        const lista = await recessosService.buscarAprovados();
        res.json(lista);
    } catch (err) {
        console.error("Erro ao buscar aprovados:", err);
        res.status(500).json({ erro: "Erro ao buscar aprovados" });
    }
}

module.exports = {
    listarPorFuncionario,
    criarRecesso,
    listarTodosRecessos,
    buscarRecessoPorId,
    aprovarRecesso,
    rejeitarRecesso,
    listarPendentes,
    estatisticas,
    buscarAprovados,
}
