const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const SECRET = 'omniRH_secret_key';

const users = [
    { email: 'admin@empresa.com', senha: bcrypt.hashSync('123', 8) } // usuário padrão
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

exports.login = (req, res) => {
    const { email, senha } = req.body;

    const user = users.find(u => u.email === email);
    if (!user) return res.status(404).json({ msg: 'Usuário não encontrado' });

    const senhaValida = bcrypt.compareSync(senha, user.senha);
    if (!senhaValida) return res.status(401).json({ msg: 'Senha incorreta' });

    const token = jwt.sign({ email: user.email }, SECRET, { expiresIn: '1h' });
    res.json({ msg: 'Login realizado com sucesso', token });
};