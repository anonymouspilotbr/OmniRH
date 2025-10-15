const pool = require('../model/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const JWT_SECRET = 'omniRH_secret_key';

const users = [
    { email: 'admin@empresa.com', senha: bcrypt.hashSync('123', 8) },
    { email: 'playerdois@backup.net', senha: bcrypt.hashSync('12345', 8)}
];

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

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "2h" });

        return res.json({ msg: "Login realizado com sucesso!", token });
    
    } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ msg: "Erro interno do servidor." });
  }
};

