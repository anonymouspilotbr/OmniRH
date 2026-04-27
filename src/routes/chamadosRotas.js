const express = require("express");
const router = express.Router();
const chamadosController = require('../controllers/chamadosController');

router.post('/', chamadosController.registrarChamado);

router.get('/solicitante/:id_solicitante', chamadosController.listarChamadosPorSolicitante);

router.put('/:id/atribuir', chamadosController.atribuirTecnico);

router.get('/', chamadosController.listarChamados);
router.get('/tecnicos', chamadosController.listarTecnicos);

module.exports = router;
