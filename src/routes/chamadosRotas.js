const express = require("express");
const router = express.Router();
const chamadosController = require('../controllers/chamadosController');

router.post('/', chamadosController.registrarChamado);

router.get('/solicitante/:id_solicitante', chamadosController.listarChamadosPorSolicitante);

//Falta os router.put para mudar o status

router.get('/', chamadosController.listarChamados);

module.exports = router;
