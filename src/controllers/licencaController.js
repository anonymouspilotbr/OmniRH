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

module.exports = {
  registrarLicenca,
  listarLicencasPorFuncionario,
  listarTodasLicencas,
  aprovarLicenca,
  rejeitarLicenca,
  buscarLicencaPorId,
};
