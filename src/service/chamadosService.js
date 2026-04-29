const chamadosRepository = require('../repositorie/chamadosRepository');

async function criarChamado(data, id_solicitante, desc) {
    await chamadosRepository.criarChamado(data, id_solicitante, desc);
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
    await chamadosRepository.atribuirTecnico(idChamado, idTecnico);

    const tecnico = await chamadosRepository.buscarTecnicoPorID(idTecnico);

    await chamadosRepository.registrarHistorico(idChamado, `Chamado atribuido a ${tecnico.nome}`);
}

async function adicionarServico(idChamado, servico) {
    return await chamadosRepository.adicionarServico(idChamado, servico);
}

async function adicionarComentario(idChamado, comentario) {
    return await chamadosRepository.adicionarComentario(idChamado, comentario);
}

async function removerTecnico(idChamado) {
    await chamadosRepository.removerTecnico(idChamado);
    await chamadosRepository.registrarHistorico(idChamado, `Técnico removido`);
}

async function concluirChamado(idChamado) {
    await chamadosRepository.concluirOS(idChamado);
    await chamadosRepository.registrarHistorico(idChamado, `Chamado concluído`);
}

async function carregarHistorico(idChamado) {
    return await chamadosRepository.listarHistorico(idChamado);
}

module.exports = {
    criarChamado,
    listarChamados,
    listarPorSolicitante,
    buscarTecnicos,
    atribuirTecnico,
    adicionarServico,
    adicionarComentario,
    removerTecnico,
    concluirChamado,
    carregarHistorico,
}