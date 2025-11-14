const express = require('express');
const mustacheExpress = require('mustache-express');
const fs = require('fs');
const path = require('path');
require("dotenv").config();

const auth = require('./src/controllers/authController');
const configurarCors = auth.configurarCors;

const registroRoutes = require('./src/routes/registroRotas');
const bancoRoutes = require('./src/routes/bancoRotas');
const uploadRoutes = require('./src/routes/uploadRotas');
const licencaRoutes = require('./src/routes/licencaRotas');
const ocorrenciasRoutes = require('./src/routes/ocorrenciasRotas');
const app = express();

const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Pasta "uploads" criada automaticamente.');
}

app.engine('html', mustacheExpress())
app.set('view engine', 'html')
app.set('views', __dirname + '/src/views')

app.use(express.urlencoded({extended: true}))
app.use(express.json())

configurarCors(app);

app.use('/auth', require('./src/routes/authRotas'));
app.use('/registro', registroRoutes);
app.use('/banco-horas', bancoRoutes);
app.use('/licencas', licencaRoutes);
app.use('/ocorrencias', ocorrenciasRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use(uploadRoutes);

app.use('/', require('./src/routes/omnirh_rotas'));
app.use('/', require('./src/routes/funcionarioRotas'));

app.use(express.static(__dirname + '/public'));

const PORT = process.env.PORT || 8080;
app.listen(PORT, function () {
    console.log('app rodando na porta ' + PORT)
})
