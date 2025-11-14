const licencaService = require('../service/licencaService');

async function registrarLicenca(req, res) {
  const { id_funcionario, tipo_licenca, data_inicio, data_fim, observacoes, anexos } = req.body;

  if (!id_funcionario || !tipo_licenca || !data_inicio || !data_fim) {
    return res.status(400).json({ error: 'Dados obrigatórios não fornecidos' });
  }

  try {
    const licenca = await licencaService.registrarLicenca(
      id_funcionario,
      tipo_licenca,
      data_inicio,
      data_fim,
      observacoes,
      anexos
    );
    res.status(201).json({ message: 'Licença registrada com sucesso', id: licenca.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Erro ao registrar licença' });
  }
}

async function listarLicencasPorFuncionario(req, res) {
  const { id_funcionario } = req.params;

  try {
    const licencas = await licencaService.listarLicencasPorFuncionario(id_funcionario);
    res.json(licencas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar licenças' });
  }
}

async function listarTodasLicencas(req, res) {
  try {
    const licencas = await licencaService.listarTodasLicencas();
    res.json(licencas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar licenças' });
  }
}

async function aprovarLicenca(req, res) {
  const { id } = req.params;

  try {
    await licencaService.aprovarLicenca(id);
    res.json({ message: 'Licença aprovada com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao aprovar licença' });
  }
}

async function rejeitarLicenca(req, res) {
  const { id } = req.params;

  try {
    await licencaService.rejeitarLicenca(id);
    res.json({ message: 'Licença rejeitada com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao rejeitar licença' });
  }
}

async function buscarLicencaPorId(req, res) {
  const { id } = req.params;

  try {
    const licenca = await licencaService.buscarLicencaPorId(id);
    res.json(licenca);
  } catch (err) {
    console.error(err);
    if (err.message === 'Licença não encontrada') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Erro ao buscar licença' });
  }
}

async function listarLicencasPendentes(req, res) {
    try {
        const lista = await licencaService.listarLicencasPendentes();
        res.json(lista);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao listar licenças pendentes" });
    }
}

async function estatisticas(req, res) {
    try {
        const dados = await licencaService.obterEstatisticas();
        res.json(dados);
    } catch (error) {
        console.error("Erro ao obter estatísticas:", error);
        res.status(500).json({ error: "Erro ao obter estatísticas" });
    }
}

async function buscarAprovadas(req, res) {
    try {
        const lista = await licencaService.buscarAprovadas();
        res.json(lista);
    } catch (err) {
        console.error("Erro ao buscar aprovadas:", err);
        res.status(500).json({ erro: "Erro ao buscar aprovadas" });
    }
}

module.exports = {
  registrarLicenca,
  listarLicencasPorFuncionario,
  listarTodasLicencas,
  aprovarLicenca,
  rejeitarLicenca,
  buscarLicencaPorId,
  listarLicencasPendentes,
  estatisticas,
  buscarAprovadas,
};
