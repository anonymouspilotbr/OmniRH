const db = require("../model/db");
const util = require("util");

// Torna db.query utilizável como Promise
const query = util.promisify(db.query).bind(db);

module.exports = {
  async cadastrar(dados) {
    const sql = `
      INSERT INTO empresas 
      (nome, cnpj, setor, endereco, email, telefone, funcionarios, status, logo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      dados.nome,
      dados.cnpj,
      dados.setor || null,
      dados.endereco || null,
      dados.email || null,
      dados.telefone || null,
      dados.funcionarios || 0,
      dados.status || "Ativa",
      dados.logo || null
    ];

    const result = await query(sql, params);

    return { id: result.insertId, ...dados };
  },

  async listar() {
    const sql = `
      SELECT id, nome, cnpj, setor, endereco, email, telefone, funcionarios, status, logo
      FROM empresas
      ORDER BY id DESC
    `;
    return await query(sql);
  },

  async buscarPorId(id) {
    const sql = `
      SELECT id, nome, cnpj, setor, endereco, email, telefone, funcionarios, status, logo
      FROM empresas 
      WHERE id = ?
      LIMIT 1
    `;
    const rows = await query(sql, [id]);
    return rows[0] || null;
  },

  async buscarPorCNPJ(cnpj) {
    const sql = `SELECT id FROM empresas WHERE cnpj = ? LIMIT 1`;
    const rows = await query(sql, [cnpj]);
    return rows[0] || null;
  },

  async atualizar(id, dados) {
    const sql = `
      UPDATE empresas 
      SET nome=?, cnpj=?, setor=?, endereco=?, email=?, telefone=?, funcionarios=?, status=?, logo=?
      WHERE id = ?
    `;

    const params = [
      dados.nome,
      dados.cnpj,
      dados.setor || null,
      dados.endereco || null,
      dados.email || null,
      dados.telefone || null,
      dados.funcionarios || 0,
      dados.status || "Ativa",
      dados.logo || null,
      id
    ];

    await query(sql, params);

    return this.buscarPorId(id);
  },

  async remover(id) {
    const sql = `DELETE FROM empresas WHERE id = ?`;
    await query(sql, [id]);
    return true;
  }
};
