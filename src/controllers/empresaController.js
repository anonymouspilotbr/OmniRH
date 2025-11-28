const empresaService = require("../service/empresaService");

module.exports = {
  async cadastrar(req, res) {
    try {
      const dados = req.body;
      const resultado = await empresaService.cadastrar(dados);
      return res.status(201).json({ sucesso: true, empresa: resultado });
    } catch (err) {
      console.error("Erro cadastrar empresa:", err);
      return res.status(400).json({ sucesso: false, erro: err.message || "Erro" });
    }
  },

  async listar(req, res) {
    try {
      const lista = await empresaService.listar();
      return res.status(200).json(lista);
    } catch (err) {
      console.error("Erro listar empresas:", err);
      return res.status(500).json({ sucesso: false, erro: err.message || "Erro" });
    }
  },

  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const empresa = await empresaService.buscarPorId(id);
      if (!empresa) return res.status(404).json({ sucesso: false, erro: "Empresa não encontrada" });
      return res.status(200).json(empresa);
    } catch (err) {
      console.error("Erro buscarPorId:", err);
      return res.status(500).json({ erro: err.message || "Erro" });
    }
  },

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const dados = req.body;
      const atualizado = await empresaService.atualizar(id, dados);
      return res.status(200).json({ sucesso: true, empresa: atualizado });
    } catch (err) {
      console.error("Erro atualizar:", err);
      return res.status(400).json({ sucesso: false, erro: err.message || "Erro" });
    }
  },

  async remover(req, res) {
    try {
      const { id } = req.params;
      await empresaService.remover(id);
      return res.status(200).json({ sucesso: true, mensagem: "Removido" });
    } catch (err) {
      console.error("Erro remover:", err);
      return res.status(500).json({ sucesso: false, erro: err.message || "Erro" });
    }
  }
};
