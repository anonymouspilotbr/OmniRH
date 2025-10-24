const bcrypt = require('bcryptjs');
const { inserirFuncionario } = require('../repositorie/repositorio.js');

async function registrarFuncionario(dados) {
    const senhaCriptografada = await bcrypt.hash(dados.senha, 10);
    return await inserirFuncionario({ ...dados, senha: senhaCriptografada });
}

async function atualizarFoto(userId, caminho) {
  return await userRepository.atualizarFoto(userId, caminho);
}

module.exports = { registrarFuncionario, atualizarFoto };