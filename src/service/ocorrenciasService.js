const repository = require('../repositorie/ocorrenciasRepository');

async function criar(data) {
    if (!data.id_funcionario) throw new Error("id_funcionario é obrigatório");
    if (!data.tipo_ocorrencia) throw new Error("tipo_ocorrencia é obrigatório");
    if (!data.motivo) throw new Error("motivo é obrigatório");
    if (!data.data) throw new Error("data é obrigatória");

    return await repository.criarOcorrencia(data);
}

function normalizar(ocorrencia) {
    if (!ocorrencia.anexos) {
        ocorrencia.anexos = [];
        return ocorrencia;
    }

    try {
        ocorrencia.anexos = JSON.parse(ocorrencia.anexos);
    } catch {
        ocorrencia.anexos = [];
    }

    return ocorrencia;
}

async function listar() {
    const lista = await repository.listarOcorrencias();
    return lista.map(normalizar);
}

async function listarPorFuncionario(id_funcionario) {
    const lista = await repository.listarPorFuncionario(id);
    return lista.map(normalizar);
}

async function buscarPorId(id) {
    const ocorrencia = await repository.buscarPorId(id);
    if (!ocorrencia) throw new Error("Ocorrência não encontrada");
    return normalizar(ocorrencia);
}

async function atualizar(id, campos) {
    await buscarPorId(id);
    return await repository.atualizarOcorrencia(id, campos);
}

async function deletar(id) {
    await buscarPorId(id); 
    return await repository.deletarOcorrencia(id);
}

async function atualizarAnexos(id, anexos) {
    try {
        const ocorrenciaAtualizada = await repository.atualizarAnexo(id, anexos);
        return ocorrenciaAtualizada;
    } catch (err) {
        console.error('Erro ao atualizar anexo da licença:', err);
        throw err;
    }
}

module.exports = {
    criar,
    listar,
    listarPorFuncionario,
    buscarPorId,
    atualizar,
    deletar,
    atualizarAnexos,
};