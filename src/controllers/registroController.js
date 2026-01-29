const registroService = require('../service/registroService');

async function registrarPonto(req, res) {
    try {
        const idFuncionario = req.user.id; 
        const resultado = await registroService.registrarPonto(idFuncionario);
        res.json(resultado);
    } catch (error) {
        console.error("Erro ao registrar ponto:", error);
        res.status(500).json({ erro: "Erro interno ao registrar ponto" });
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

async function listarSemana(req, res) {
  try{
    const id_funcionario = parseInt(req.params.id_funcionario, 10);
    const dataInicio = req.params.data_inicio;

    if (!id_funcionario || !dataInicio) {
      return res.status(400).json({ error: 'Parâmetros inválidos' });
    }

    const registros = await registroService.listarSemana(id_funcionario, dataInicio);

    return res.json(registros);
  } catch (err) {
    console.error('Erro listarSemana:', err);
    return res.status(500).json({ error: 'Erro interno' });
  }
}

module.exports = { 
  registrarPonto,
  listar,
  listarSemana,
 };