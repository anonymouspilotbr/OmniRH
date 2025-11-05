const express = require('express');
const router = express.Router();
const registroController = require('../controllers/registroController');

router.post('/entrada', registroController.registrarEntrada);
router.put('/saida/:registro_id', registroController.registrarSaida);
router.get('/:usuario_id', registroController.listar);
router.get('/:id_funcionario/semana/:data_inicio', registroController.listarSemana);

module.exports = router;