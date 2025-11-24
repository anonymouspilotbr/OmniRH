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

module.exports = {
    listarPorFuncionario,
    criarRecesso,
    atualizarAnexos,
}