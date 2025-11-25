const recessosRepository = require('../repositorie/recessosRepository');

async function listarPorFuncionario(id_funcionario) {
    return recessosRepository.listarPorFuncionario(id_funcionario);
}

async function criarRecesso(dados) {
    return recessosRepository.criarRecesso(dados);
}

async function atualizarAnexos(id, anexos) {
    try {
        const recessoAtualizado = await recessosRepository.atualizarAnexo(id, anexos);
        return recessoAtualizado;
    } catch (err) {
        console.error('Erro ao atualizar anexo do recesso:', err);
        throw err;
    }
}

async function listarTodosRecessos() {
  return await recessosRepository.listarTodosRecessos();
}

async function buscarPorId(id) {
  const recesso = await recessosRepository.buscarPorId(id);
  if (!recesso) {
    throw new Error('Recesso não encontrado');
  }
  return recesso;
}

async function aprovarRecesso(id) {
  await recessosRepository.atualizarStatusRecesso(id, 'aprovado');
}

async function rejeitarRecesso(id) {
  await recessosRepository.atualizarStatusRecesso(id, 'rejeitado');
}

async function listarPendentes() {
    return await recessosRepository.buscarPendentes();
}

async function obterEstatisticas() {
    return await recessosRepository.obterEstatisticas();
}

async function buscarAprovados() {
    return await recessosRepository.buscarAprovados();
}

module.exports = {
    listarPorFuncionario,
    criarRecesso,
    atualizarAnexos,
    listarTodosRecessos,
    aprovarRecesso,
    rejeitarRecesso,
    listarPendentes,
    obterEstatisticas,
    buscarAprovados,
}
