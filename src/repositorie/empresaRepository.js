const db = require("../model/db");
const util = require("util");

// Torna db.query utilizável como Promise
const query = util.promisify(db.query).bind(db);

module.exports = {
  async cadastrar(dados) {
    const sql = `
      INSERT INTO empresas 
      (nome, cnpj, setor, endereco, email, telefone, funcionarios, status, logo)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
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
    return { id: result.rows[0].id, ...dados };
  },

  async listar() {
    const sql = `
      SELECT id, nome, cnpj, setor, endereco, email, telefone, funcionarios, status, logo
      FROM empresas
      ORDER BY id DESC
    `;

    const res = await query(sql);
    return res.rows;
  },

  async buscarPorId(id) {
    const sql = `
      SELECT id, nome, cnpj, setor, endereco, email, telefone, funcionarios, status, logo
      FROM empresas 
      WHERE id = $1
      LIMIT 1
    `;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  },

  async buscarPorCNPJ(cnpj) {
    const sql = `SELECT id FROM empresas WHERE cnpj = $1 LIMIT 1`;
    const res = await query(sql, [cnpj]);
    return res.rows[0] || null;
  },

  async atualizar(id, dados) {
    const sql = `
      UPDATE empresas 
      SET nome=$1, cnpj=$2, setor=$3, endereco=$4, email=$5, telefone=$6, funcionarios=$7, status=$8, logo=$9
      WHERE id = $10
      RETURNING *
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

    const res = await query(sql, params);
    return res.rows[0];
  },

  async remover(id) {
    const sql = `DELETE FROM empresas WHERE id = $1`;
    await query(sql, [id]);
    return true;
  }
};
