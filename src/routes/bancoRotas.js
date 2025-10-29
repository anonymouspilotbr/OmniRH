const express = require('express');
const router = express.Router();
const bancoHorasController = require('../controllers/banco_de_horas');

router.get('/:usuario_id', bancoHorasController.consultar);
router.post('/ajuste', bancoHorasController.ajustar);

module.exports = router;