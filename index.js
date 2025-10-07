const express = require('express')
const mustacheExpress = require('mustache-express')

const app = express()

app.engine('html', mustacheExpress())
app.set('view engine', 'html')
app.set('views', __dirname + '/src/views')

app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(express.static(__dirname + '/public'));

app.use('/', require('./src/routes/omnirh_rotas'));

const PORT = 8080
app.listen(PORT, function () {
    console.log('app rodando na porta ' + PORT)
})