const chamadosRepository = require('../repositorie/chamadosRepository');

async function criarChamado(data, id_solicitante, id_empresa, desc) {
    return await chamadosRepository.criarChamado(data, id_solicitante, id_empresa, desc);
}
async function listarChamados() {
    return await chamadosRepository.listarChamados();
}

async function listarPorSolicitante(id_solicitante) {
    return await chamadosRepository.listarPorSolicitante(id_solicitante);
}

async function atualizarStatus(id, status) {
    return await chamadosRepository.atualizarStatus(id, status);
}

module.exports = {
    criarChamado,
    listarChamados,
    listarPorSolicitante,
    atualizarStatus,
}