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

async function atualizarContato(userId, dados) {
  const { email, telefone } = dados
  return await userRepository.atualizarContato(userId, email, telefone);
}

module.exports = { getFuncionario, registrarFuncionario, atualizarFoto, atualizarContato };