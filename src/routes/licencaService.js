const licencaRepository = require('../repositorie/licencaRepository');

async function registrarLicenca(id_funcionario, tipo_licenca, data_inicio, data_fim, observacoes, anexos) {
  // Validações básicas
  if (!id_funcionario || !tipo_licenca || !data_inicio || !data_fim) {
    throw new Error('Dados obrigatórios não fornecidos');
  }

  // Verificar se data_fim é posterior à data_inicio
  const inicio = new Date(data_inicio);
  const fim = new Date(data_fim);
  if (fim <= inicio) {
    throw new Error('Data de término deve ser posterior à data de início');
  }

  // Inserir licença no banco
  const licenca = await licencaRepository.inserirLicenca(
    id_funcionario,
    tipo_licenca,
    data_inicio,
    data_fim,
    observacoes || '',
    anexos || null
  );

  return licenca;
}

async function listarLicencasPorFuncionario(id_funcionario) {
  return await licencaRepository.listarLicencasPorFuncionario(id_funcionario);
}

async function listarTodasLicencas() {
  return await licencaRepository.listarTodasLicencas();
}

async function aprovarLicenca(id) {
  await licencaRepository.atualizarStatusLicenca(id, 'aprovada');
}

async function rejeitarLicenca(id) {
  await licencaRepository.atualizarStatusLicenca(id, 'rejeitada');
}

async function buscarLicencaPorId(id) {
  const licenca = await licencaRepository.buscarLicencaPorId(id);
  if (!licenca) {
    throw new Error('Licença não encontrada');
  }
  return licenca;
}

module.exports = {
  registrarLicenca,
  listarLicencasPorFuncionario,
  listarTodasLicencas,
  aprovarLicenca,
  rejeitarLicenca,
  buscarLicencaPorId,
};
