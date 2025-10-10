const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'sua_chave_secreta_aqui'; // Mude para uma chave

// Middleware
app.use(cors()); // Permite requisições do frontend
app.use(bodyParser.json());

// Simulação de banco de dados (array em memória - substitua por DB real)
let users = [];

// Middleware para verificar JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Acesso negado: Token não fornecido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Rota de Registro
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Validações básicas
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  // Verifica se usuário já existe
  if (users.find(user => user.email === email)) {
    return res.status(400).json({ error: 'Email já cadastrado' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: Date.now(), username, email, password: hashedPassword };
    users.push(newUser);
    res.status(201).json({ message: 'Usuário registrado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Rota de Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validações
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(400).json({ error: 'Credenciais inválidas' });
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(400).json({ error: 'Credenciais inválidas' });
  }

  // Gera JWT
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
});

// Rota Protegida (exemplo: dashboard)
app.get('/dashboard', authenticateToken, (req, res) => {
  res.json({ message: `Bem-vindo, ${req.user.email}! Acesso autorizado.` });
});

// Servir frontend estático (opcional, se quiser rodar tudo no backend)
app.use(express.static('public')); // Coloque HTML/JS em uma pasta 'public'

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
