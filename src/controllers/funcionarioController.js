const { registrarFuncionario } = require('../service/userService.js');
const { getFuncionario } = require('../service/userService.js');
const { atualizarContato } = require('../service/userService.js');

async function getMe(req, res) {
    try {
        const funcionario = await getFuncionario(req.user.id);
        if (!funcionario) {
            return res.status(404).json({ msg: 'Usuário não encontrado.' });
        }
        res.json(funcionario);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Erro ao obter dados do usuário.' });
    }
}

async function criarFuncionario(req, res) {
    try {
        const funcionario = await registrarFuncionario(req.body);
        res.status(201).json({ message: 'Funcionário cadastrado com sucesso', funcionario });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao cadastrar funcionário' });
    }
}

async function editarContato(req, res) {
    const { email, telefone } = req.body;
    const userId = req.user.id; 

    if (!email || !telefone) {
        return res.status(400).json({ msg: 'Email e telefone são obrigatórios.' });
    }

    try{
        const novosDados = await atualizarContato(userId, { email, telefone });
        res.json({ msg: 'Contato atualizado com sucesso', usuario: novosDados });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Erro ao atualizar contato' });
    }
}

module.exports = { criarFuncionario, getMe, editarContato };