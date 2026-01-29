const bh_service = require('../service/bancoHorasService');
const registroRepository = require('../repositorie/registroRepository');
const registroService = require('../service/registroService');

async function consultar(req, res) {
  const { usuario_id } = req.params;
  const mes = parseInt(req.query.mes) || new Date().getMonth() + 1;
  const ano = parseInt(req.query.ano) || new Date().getFullYear();

  try {
    const saldo = await bh_service.consultarSaldo(usuario_id, mes, ano);
    res.json(saldo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao consultar saldo' });
  }
}

async function ajustar(req, res) {
  const { usuario_id, ajuste, mes, ano } = req.body;

  if (!usuario_id || ajuste === undefined) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  try {
    const resultado = await bh_service.ajustarSaldo(
      usuario_id,
      ajuste,
      mes || new Date().getMonth() + 1,
      ano || new Date().getFullYear()
    );
    res.json({ message: 'Ajuste realizado', ...resultado });
  } catch (err) {
    console.error(err);
    res.status(403).json({ error: err.message });
  }
}

// Endpoint: Registrar entrada (início do dia)
async function registrarEntrada(req, res) {
  const { usuario_id, entrada } = req.body;
  if (!usuario_id || !entrada) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  const hoje = new Date();
  const mes = hoje.getMonth() + 1;
  const ano = hoje.getFullYear();

  try {
    // Verificar se o máximo mensal foi atingido
    const maxAtingido = await bh_service.verificarMaximoMensal(usuario_id, mes, ano);
    if (maxAtingido) {
      return res.status(403).json({ error: 'Máximo de horas extras mensais atingido' });
    }

    // Registrar entrada usando o registroRepository
    const resultado = await registroRepository.registrarEntrada(usuario_id, entrada);
    res.status(201).json({ message: 'Entrada registrada', id: resultado.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao registrar entrada' });
  }
}

// Endpoint: Registrar saída (fim do dia) e calcular horas
async function registrarSaida(req, res) {
  const { registro_id, saida } = req.body;
  if (!registro_id || !saida) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  try {
    // Buscar registro
    const registro = await registroRepository.buscarPorId(registro_id);
    if (!registro) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }

    // Calcular horas trabalhadas e extras
    const { horas, extras } = bh_service.calcularHoras(registro.entrada, saida);

    // Atualizar registro com saída e horas calculadas
    await registroRepository.registrarSaida(registro_id, saida, horas, extras);

    // Atualizar banco de horas
    await bh_service.atualizarSaldo(registro.id_funcionario, new Date(registro.data).getMonth() + 1, new Date(registro.data).getFullYear(), extras);

    res.json({ message: 'Saída registrada e horas calculadas' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao registrar saída' });
  }
}

async function listarRegistros(req, res) {
  const { usuario_id } = req.params;
  const dataInicio = req.query.dataInicio || new Date().toISOString().split('T')[0]; // Default to today if not provided

  try {
    const registros = await registroService.listarSemana(usuario_id, dataInicio);
    res.json(registros);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar registros' });
  }
}

module.exports = { consultar, ajustar, registrarEntrada, registrarSaida, listarRegistros };

/*const app = express();
const PORT = 3000;

// Configurações globais
const JORNADA_DIARIA = 8; // Horas por dia
const MAX_HORAS_EXTRAS_MES = 40; // Máximo de horas extras por mês

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Conectar ao banco de dados SQLite
const db = new sqlite3.Database('./banco_horas.db', (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco:', err.message);
  } else {
    console.log('Conectado ao banco SQLite.');
    initDatabase();
  }
});

// Inicializar tabelas
function initDatabase() {
  db.serialize(() => {
    // Tabela: Usuário (Funcionário)
    db.run(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL
      )
    `);

    // Tabela: Registro de Horas (Pontos)
    db.run(`
      CREATE TABLE IF NOT EXISTS registros_horas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        data TEXT NOT NULL,
        entrada TEXT NOT NULL,
        saida TEXT,
        horas_trabalhadas REAL DEFAULT 0.0,
        horas_extras REAL DEFAULT 0.0,
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
      )
    `);

    // Tabela: Banco de Horas (Saldo mensal)
    db.run(`
      CREATE TABLE IF NOT EXISTS banco_horas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        mes INTEGER NOT NULL,
        ano INTEGER NOT NULL,
        saldo REAL DEFAULT 0.0,
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
      )
    `);
  });
}

// Função auxiliar: Calcular horas trabalhadas e extras
function calcularHoras(entrada, saida) {
  if (!saida) return { horas: 0.0, extras: 0.0 };
  const entradaTime = new Date(`1970-01-01T${entrada}:00`);
  const saidaTime = new Date(`1970-01-01T${saida}:00`);
  const diffMs = saidaTime - entradaTime;
  const horas = diffMs / (1000 * 60 * 60);
  const extras = Math.max(0, horas - JORNADA_DIARIA);
  return { horas, extras };
}

// Função auxiliar: Verificar se o máximo mensal foi atingido
function verificarMaximoMensal(usuarioId, mes, ano, callback) {
  db.get(
    'SELECT saldo FROM banco_horas WHERE usuario_id = ? AND mes = ? AND ano = ?',
    [usuarioId, mes, ano],
    (err, row) => {
      if (err) return callback(err);
      const saldo = row ? row.saldo : 0.0;
      callback(null, saldo >= MAX_HORAS_EXTRAS_MES);
    }
  );
}

// Endpoint: Registrar entrada (início do dia)
app.post('/registro/entrada', (req, res) => {
  const { usuario_id, entrada } = req.body;
  if (!usuario_id || !entrada) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  const hoje = new Date();
  const mes = hoje.getMonth() + 1;
  const ano = hoje.getFullYear();

  verificarMaximoMensal(usuario_id, mes, ano, (err, maxAtingido) => {
    if (err) return res.status(500).json({ error: 'Erro interno' });
    if (maxAtingido) {
      return res.status(403).json({ error: 'Máximo de horas extras mensais atingido' });
    }

    db.run(
      'INSERT INTO registros_horas (usuario_id, data, entrada) VALUES (?, ?, ?)',
      [usuario_id, hoje.toISOString().split('T')[0], entrada],
      function (err) {
        if (err) return res.status(500).json({ error: 'Erro ao registrar entrada' });
        res.status(201).json({ message: 'Entrada registrada', id: this.lastID });
      }
    );
  });
});

// Endpoint: Registrar saída (fim do dia) e calcular horas
app.put('/registro/saida/:registro_id', (req, res) => {
  const { registro_id } = req.params;
  const { saida } = req.body;
  if (!saida) {
    return res.status(400).json({ error: 'Horário de saída obrigatório' });
  }

  db.get('SELECT * FROM registros_horas WHERE id = ?', [registro_id], (err, registro) => {
    if (err) return res.status(500).json({ error: 'Erro interno' });
    if (!registro) return res.status(404).json({ error: 'Registro não encontrado' });

    const { horas, extras } = calcularHoras(registro.entrada, saida);
    const mes = new Date(registro.data).getMonth() + 1;
    const ano = new Date(registro.data).getFullYear();

    // Atualizar registro
    db.run(
      'UPDATE registros_horas SET saida = ?, horas_trabalhadas = ?, horas_extras = ? WHERE id = ?',
      [saida, horas, extras, registro_id],
      (err) => {
        if (err) return res.status(500).json({ error: 'Erro ao atualizar registro' });

        // Atualizar banco de horas
        db.get(
          'SELECT * FROM banco_horas WHERE usuario_id = ? AND mes = ? AND ano = ?',
          [registro.usuario_id, mes, ano],
          (err, banco) => {
            if (err) return res.status(500).json({ error: 'Erro interno' });
            if (!banco) {
              db.run(
                'INSERT INTO banco_horas (usuario_id, mes, ano, saldo) VALUES (?, ?, ?, ?)',
                [registro.usuario_id, mes, ano, extras],
                (err) => {
                  if (err) return res.status(500).json({ error: 'Erro ao criar banco de horas' });
                  res.json({ message: 'Saída registrada e horas calculadas' });
                }
              );
            } else {
              db.run(
                'UPDATE banco_horas SET saldo = saldo + ? WHERE id = ?',
                [extras, banco.id],
                (err) => {
                  if (err) return res.status(500).json({ error: 'Erro ao atualizar saldo' });
                  res.json({ message: 'Saída registrada e horas calculadas' });
                }
              );
            }
          }
        );
      }
    );
  });
});

// Endpoint: Consultar saldo do banco de horas
app.get('/banco-horas/:usuario_id', (req, res) => {
  const { usuario_id } = req.params;
  const mes = req.query.mes || new Date().getMonth() + 1;
  const ano = req.query.ano || new Date().getFullYear();

  db.get(
    'SELECT saldo FROM banco_horas WHERE usuario_id = ? AND mes = ? AND ano = ?',
    [usuario_id, mes, ano],
    (err, row) => {
      if (err) return res.status(500).json({ error: 'Erro interno' });
      const saldo = row ? row.saldo : 0.0;
      res.json({ saldo, maximo: MAX_HORAS_EXTRAS_MES });
    }
  );
});

// Endpoint: Registrar ajuste manual (ex.: compensação)
app.post('/banco-horas/ajuste', (req, res) => {
  const { usuario_id, ajuste, mes, ano } = req.body;
  const currentMes = mes || new Date().getMonth() + 1;
  const currentAno = ano || new Date().getFullYear();

  if (!usuario_id || ajuste === undefined) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  db.get(
    'SELECT * FROM banco_horas WHERE usuario_id = ? AND mes = ? AND ano = ?',
    [usuario_id, currentMes, currentAno],
    (err, banco) => {
      if (err) return res.status(500).json({ error: 'Erro interno' });
      const novoSaldo = (banco ? banco.saldo : 0.0) + ajuste;
      if (novoSaldo > MAX_HORAS_EXTRAS_MES) {
        return res.status(403).json({ error: 'Ajuste excede o máximo permitido' });
      }

      if (!banco) {
        db.run(
          'INSERT INTO banco_horas (usuario_id, mes, ano, saldo) VALUES (?, ?, ?, ?)',
          [usuario_id, currentMes, currentAno, novoSaldo],
          (err) => {
            if (err) return res.status(500).json({ error: 'Erro ao criar ajuste' });
            res.json({ message: 'Ajuste realizado', novo_saldo: novoSaldo });
          }
        );
      } else {
        db.run(
          'UPDATE banco_horas SET saldo = ? WHERE id = ?',
          [novoSaldo, banco.id],
          (err) => {
            if (err) return res.status(500).json({ error: 'Erro ao atualizar ajuste' });
            res.json({ message: 'Ajuste realizado', novo_saldo: novoSaldo });
          }
        );
      }
    }
  );
});

// Endpoint: Listar registros de horas de um usuário
app.get('/registros/:usuario_id', (req, res) => {
  const { usuario_id } = req.params;
  db.all('SELECT * FROM registros_horas WHERE usuario_id = ?', [usuario_id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro interno' });
    res.json(rows);
  });
});
*/
