const express = require("express");
const router = express.Router();
const chamadosController = require('../controllers/chamadosController');

router.post('/', chamadosController.registrarChamado);

router.get('/solicitante/:id_solicitante', chamadosController.listarChamadosPorSolicitante);

router.put('/:id/atribuir', chamadosController.atribuirTecnico);
router.put('/:id/addServico', chamadosController.adicionarServico);
router.put('/:id/addComentario', chamadosController.adicionarComentario);
router.put('/:id/removerTech', chamadosController.removerTecnico);

router.get('/', chamadosController.listarChamados);
router.get('/tecnicos', chamadosController.listarTecnicos);

module.exports = router;
