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
    await chamadosRepository.atribuirTecnico(idChamado, idTecnico);

    const tecnico = await chamadosRepository.buscarTecnicoPorID(idTecnico);

    await chamadosRepository.registrarHistorico(idChamado, `Chamado atribuido a ${tecnico.nome}`);
}

async function adicionarServico(idChamado, servico) {
    await chamadosRepository.adicionarServico(idChamado, servico);
    const tecnico = await chamadosRepository.buscarTecnicoPorChamado(idChamado);
    const nomeTecnico = await chamadosRepository.buscarTecnicoPorID(tecnico.id_tecnico);

    let regServico = "";
    if(servico === "PlatformConfig"){
        regServico = "Configuração da Plataforma";
    } else if(servico === "ProfileConfig"){
        regServico = "Configuração de Perfil do Usuário";
    } else if(servico === "UserPCConfig"){
        regServico = "Configuração na Máquina do Usuário";
    } else if(servico === "Maintenance"){
        regServico = "Manutenção de Infraestrutura"
    }
        
    await chamadosRepository.registrarHistorico(idChamado, `${nomeTecnico.nome} realizou o serviço ${regServico}`);
}

async function adicionarComentario(idChamado, comentario, idUsuario) {
    await chamadosRepository.adicionarComentario(idChamado, comentario);

    const usuario = await chamadosRepository.buscarUsuarioPorID(idUsuario);
    if (!usuario) {
        throw new Error("Usuário não encontrado");
    }

    await chamadosRepository.registrarHistorico(idChamado, `${usuario.nome} adicionou um comentário: ${comentario}`);
}

async function removerTecnico(idChamado) {
    await chamadosRepository.removerTecnico(idChamado);
    await chamadosRepository.registrarHistorico(idChamado, `Técnico removido`);
}

async function concluirChamado(idChamado) {
    const chamado = await chamadosRepository.concluirOS(idChamado);
    if(!chamado){
        return null;
    }

    await chamadosRepository.registrarHistorico(idChamado, `Chamado concluído`);

    return chamado;
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