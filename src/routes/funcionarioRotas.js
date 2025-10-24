const express = require('express')
const router = express.Router();

const funcionario = require('../controllers/funcionarioController.js');
const auth = require('../controllers/authController.js');

router.post('/funcionarios', funcionario.criarFuncionario);
router.get('/me', auth.autenticarToken, funcionario.getMe);
router.put('/me/contato', auth.autenticarToken, funcionario.editarContato);

module.exports = router;