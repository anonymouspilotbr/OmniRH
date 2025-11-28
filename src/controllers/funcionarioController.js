const service = require('../service/userService.js');

async function getMe(req, res) {
    try {
        const funcionario = await service.getFuncionario(req.user.id);
        if (!funcionario) {
            return res.status(404).json({ msg: 'Usuário não encontrado.' });
        }
        res.json(funcionario);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Erro ao obter dados do usuário.' });
    }
}

async function listar(req, res) {
    try {
        const funcionarios = await service.listarFuncionarios();
        res.json(funcionarios);
    } catch (err) {
        console.error("Erro ao listar funcionários:", err);
        res.status(500).json({ erro: "Erro ao listar funcionários" });
    }
}

async function criarFuncionario(req, res) {
    try {
        const usuarioLogado = req.user;

        if (!usuarioLogado) {
            return res.status(401).json({ error: "Usuário não autenticado" });
        }
        req.body.id_empresa = usuarioLogado.id_empresa;
        const funcionario = await service.registrarFuncionario(req.body);
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
        const novosDados = await service.atualizarContato(userId, { email, telefone });
        res.json({ msg: 'Contato atualizado com sucesso', usuario: novosDados });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Erro ao atualizar contato' });
    }
}

module.exports = { criarFuncionario, getMe, listar, editarContato };