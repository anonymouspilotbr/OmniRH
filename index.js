const express = require('express');
const mustacheExpress = require('mustache-express');
const cors = require('cors');
const pool = require('./src/model/db');
const fs = require('fs');
const path = require('path');

const auth = require('./src/controllers/authController');
const configurarCors = auth.configurarCors;

const uploadRoutes = require('./src/routes/uploadRotas');
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
app.use(express.static(__dirname + '/public'));

configurarCors(app);

app.use('/auth', require('./src/routes/authRotas'));
app.use('/', require('./src/routes/omnirh_rotas'));
app.use('/', require('./src/routes/funcionarioRotas'));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use(uploadRoutes);

const PORT = 8080;
app.listen(PORT, function () {
    console.log('app rodando na porta ' + PORT)
})