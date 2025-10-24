const bcrypt = require('bcryptjs');
const userRepository = require('../repositorie/repositorio.js');

async function getFuncionario(userId) {
  return await userRepository.buscarFuncionario(userId);
}

async function registrarFuncionario(dados) {
    const senhaCriptografada = await bcrypt.hash(dados.senha, 10);
    return await userRepository.inserirFuncionario({ ...dados, senha: senhaCriptografada });
}

async function atualizarFoto(userId, caminho) {
  return await userRepository.atualizarFoto(userId, caminho);
}

module.exports = { getFuncionario, registrarFuncionario, atualizarFoto };