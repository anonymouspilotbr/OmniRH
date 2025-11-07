const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const pool = require('../model/db.js');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'sua_chave_secreta_aqui'; // Mude para uma chave

// Middleware
app.use(cors()); // Permite requisições do frontend
app.use(bodyParser.json());

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

  try {
    // Verifica se usuário já existe
    const existingUser = await pool.query('SELECT * FROM funcionario WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Inserir no banco de dados (usando campos mínimos)
    const query = `
      INSERT INTO funcionario (nome, email, senha)
      VALUES ($1, $2, $3)
      RETURNING id, nome, email;
    `;
    const values = [username, email, hashedPassword];
    const result = await pool.query(query, values);
    const newUser = result.rows[0];
    res.status(201).json({ message: 'Usuário registrado com sucesso', user: newUser });
  } catch (error) {
    console.error(error);
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

  try {
    const result = await pool.query('SELECT * FROM funcionario WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Credenciais inválidas' });
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.senha);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Credenciais inválidas' });
    }

    // Gera JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, username: user.nome, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
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
