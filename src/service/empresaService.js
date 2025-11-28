const empresaRepository = require("../repositorie/empresaRepository");

// Função simples para validar CNPJ
function validarCNPJ(cnpj) {
  if (!cnpj) return false;

  cnpj = cnpj.replace(/\D/g, ""); // remove tudo que não for número

  if (cnpj.length !== 14) return false;

  // CNPJs repetidos não são válidos
  if (/^(.)\1+$/.test(cnpj)) return false;

  // Validação dos dígitos verificadores
  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  let digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado != digitos.charAt(0)) return false;

  tamanho += 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado != digitos.charAt(1)) return false;

  return true;
}

module.exports = {
  async cadastrar(dados) {
    if (!dados.nome || !dados.cnpj)
      throw new Error("Nome e CNPJ obrigatórios.");

    // 🔍 Validação de CNPJ
    if (!validarCNPJ(dados.cnpj))
      throw new Error("CNPJ inválido.");

    const existente = await empresaRepository.buscarPorCNPJ(dados.cnpj);
    if (existente) throw new Error("CNPJ já cadastrado.");

    return await empresaRepository.cadastrar(dados);
  },

  async listar() {
    return await empresaRepository.listar();
  },

  async buscarPorId(id) {
    return await empresaRepository.buscarPorId(id);
  },

  async atualizar(id, dados) {
    if (dados.cnpj && !validarCNPJ(dados.cnpj))
      throw new Error("CNPJ inválido.");

    return await empresaRepository.atualizar(id, dados);
  },

  async remover(id) {
    return await empresaRepository.remover(id);
  }
};
