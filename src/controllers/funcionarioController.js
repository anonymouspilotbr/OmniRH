const { registrarFuncionario } = require('../service/userService.js');

async function criarFuncionario(req, res) {
    try {
        const funcionario = await registrarFuncionario(req.body);
        res.status(201).json({ message: 'Funcionário cadastrado com sucesso', funcionario });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao cadastrar funcionário' });
    }
}

module.exports = { criarFuncionario };