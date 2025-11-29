const express = require('express');
const router = express.Router();
const bancoHorasController = require('../controllers/banco_de_horas');

router.get('/:usuario_id', bancoHorasController.consultar);
router.post('/ajuste', bancoHorasController.ajustar);
router.post('/entrada', bancoHorasController.registrarEntrada);
router.put('/saida', bancoHorasController.registrarSaida);
router.get('/registros/:usuario_id', bancoHorasController.listarRegistros);

module.exports = router;
