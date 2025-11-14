const repository = require('../repositorie/ocorrenciasRepository');

async function criar(data) {
    if (!data.id_funcionario) throw new Error("id_funcionario é obrigatório");
    if (!data.tipo_ocorrencia) throw new Error("tipo_ocorrencia é obrigatório");
    if (!data.motivo) throw new Error("motivo é obrigatório");

    return await repository.criarOcorrencia(data);
}

async function listar() {
    return await repository.listarOcorrencias();
}

async function listarPorFuncionario(id_funcionario) {
    return await repository.listarPorFuncionario(id_funcionario);
}

async function buscarPorId(id) {
    const ocorrencia = await repository.buscarPorId(id);
    if (!ocorrencia) throw new Error("Ocorrência não encontrada");
    return ocorrencia;
}

async function atualizar(id, campos) {
    await buscarPorId(id);
    return await repository.atualizarOcorrencia(id, campos);
}

async function deletar(id) {
    await buscarPorId(id); 
    return await repository.deletarOcorrencia(id);
}

module.exports = {
    criar,
    listar,
    listarPorFuncionario,
    buscarPorId,
    atualizar,
    deletar,
};