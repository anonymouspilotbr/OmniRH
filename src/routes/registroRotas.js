const express = require('express');
const router = express.Router();
const registroController = require('../controllers/registroController');
const authController = require('../controllers/authController');

//router.post('/entrada', registroController.registrarEntrada);
//router.put('/saida/:registro_id', registroController.registrarSaida);
router.post('/', authController.autenticarToken, registroController.registrarPonto);
router.get('/:usuario_id', registroController.listar);
router.get('/:id_funcionario/semana/:data_inicio', registroController.listarSemana);

module.exports = router;