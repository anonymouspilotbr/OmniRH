const registroService = require('../service/registroService');

async function registrarEntrada(req, res) {
  const { usuario_id, entrada } = req.body;
  if (!usuario_id || !entrada) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  try {
    const registro = await registroService.registrarEntrada(usuario_id, entrada);
    res.status(201).json({ message: 'Entrada registrada', id: registro.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao registrar entrada' });
  }
}

async function registrarSaida(req, res) {
  const { registro_id } = req.params;
  const { saida } = req.body;
  if (!saida) {
    return res.status(400).json({ error: 'Horário de saída obrigatório' });
  }

  try {
    const { horas, extras } = await registroService.registrarSaida(registro_id, saida);
    res.json({ message: 'Saída registrada', horas, extras });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao registrar saída' });
  }
}

async function listar(req, res) {
  const { usuario_id } = req.params;
  try {
    const registros = await registroService.listarRegistros(usuario_id);
    res.json(registros);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar registros' });
  }
}

module.exports = { registrarEntrada, registrarSaida, listar };