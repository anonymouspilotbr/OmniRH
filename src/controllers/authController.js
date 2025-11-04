const pool = require('../model/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const authService = require('../service/authService');

const JWT_SECRET = 'omniRH_secret_key';

exports.configurarCors = (app) => {
    app.use(cors({
        origin: 'http://localhost:8080', 
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));
};

exports.register = (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha)
        return res.status(400).json({ msg: 'Preencha todos os campos' });

    const userExists = users.find(u => u.email === email);
    if (userExists)
        return res.status(400).json({ msg: 'Usuário já cadastrado' });

    const hashedPassword = bcrypt.hashSync(senha, 8);
    users.push({ email, senha: hashedPassword });

    res.json({ msg: 'Usuário registrado com sucesso!' });
};

exports.login = async (req, res) => {
    const { email, senha } = req.body;

    try{
        const result = await pool.query("SELECT * FROM funcionario WHERE email = $1", [email]);

        if (result.rows.length === 0) {
        return res.status(401).json({ msg: "Usuário não encontrado." });
        }

        const user = result.rows[0];

        const senhaCorreta = await bcrypt.compare(senha, user.senha);
        if (!senhaCorreta) {
        return res.status(401).json({ msg: "Senha incorreta." });
        }

        const token = jwt.sign({ id: user.id, email: user.email, nome: user.nome, cargo: user.cargo, departamento: user.departamento, telefone: user.telefone }, JWT_SECRET, { expiresIn: "2h" });

        return res.json({ msg: "Login realizado com sucesso!", token});
    } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ msg: "Erro interno do servidor." });
  }
};

function autenticarToken(req, res, next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ msg: 'Token não fornecido.' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ msg: 'Token inválido.' });
        req.user = user;
        next();
    });
}

async function forgotPassword(req, res) {
    try{
        const { email } = req.body;
        const link = await authService.solicitarResetDeSenha(email);
        res.json({ message: 'E-mail de recuperação enviado.', link });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function resetPassword(req, res) {
    console.log("CHEGOU NO CONTROLLER!", req.body);
    try{
        const { token, novaSenha } = req.body;
        const msg = await authService.redefinirSenha(token, novaSenha);
        res.json({ message: msg });
    } catch (error) {
    res.status(400).json({ error: error.message });
    }
}

module.exports = { 
    autenticarToken,
    configurarCors: exports.configurarCors,
    register: exports.register,
    login: exports.login,
    forgotPassword,
    resetPassword,
};