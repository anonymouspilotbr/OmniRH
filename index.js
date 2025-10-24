const express = require('express');
const mustacheExpress = require('mustache-express');
const cors = require('cors');
const pool = require('./src/model/db');

const { configurarCors } = require('./src/controllers/authController');
const { autenticarToken } = require('./src/controllers/authController');
const uploadRoutes = require('./src/routes/uploadRotas');
const app = express();

app.engine('html', mustacheExpress())
app.set('view engine', 'html')
app.set('views', __dirname + '/src/views')

app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(express.static(__dirname + '/public'));

configurarCors(app);

app.use('/auth', require('./src/routes/authRotas'));
app.use('/', require('./src/routes/omnirh_rotas'));
app.use('/api', require('./src/routes/funcionarioRotas'));
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(uploadRoutes);

app.get('/ping', (req, res) => {
  res.json({ success: true, message: 'Servidor ativo!' });
});

app.get('/me', autenticarToken, async (req,res) => {
    try{
        const result = await pool.query(
            "SELECT id, nome, cargo, email, telefone, departamento, gestor, data_admissao, foto_perfil FROM funcionario WHERE id = $1",
            [req.user.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ msg: 'Erro ao obter dados do usuário.' });
    }
});

const PORT = 8080;
app.listen(PORT, function () {
    console.log('app rodando na porta ' + PORT)
})