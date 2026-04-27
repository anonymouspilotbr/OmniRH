const chamadosRepository = require('../repositorie/chamadosRepository');

async function criarChamado(data, id_solicitante, desc) {
    return await chamadosRepository.criarChamado(data, id_solicitante, desc);
}
async function listarChamados() {
    return await chamadosRepository.listarChamados();
}

async function listarPorSolicitante(id_solicitante) {
    return await chamadosRepository.listarPorSolicitante(id_solicitante);
}

async function buscarTecnicos(){
    return await chamadosRepository.buscarTecnicos();
}

async function atribuirTecnico(idChamado, idTecnico) {
    return await chamadosRepository.atribuirTecnico(idChamado, idTecnico);
}

async function adicionarServico(idChamado, servico) {
    return await chamadosRepository.adicionarServico(idChamado, servico);
}

module.exports = {
    criarChamado,
    listarChamados,
    listarPorSolicitante,
    buscarTecnicos,
    atribuirTecnico,
    adicionarServico,
}