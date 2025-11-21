const recessosRepository = require('../repositorie/recessosRepository');

async function listarPorFuncionario(id_funcionario) {
    return recessosRepository.listarPorFuncionario(id_funcionario);
}

async function criarRecesso(dados) {
    return recessosRepository.criarRecesso(dados);
}

module.exports = {
    listarPorFuncionario,
    criarRecesso,
}