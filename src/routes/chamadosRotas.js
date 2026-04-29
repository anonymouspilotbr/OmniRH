const express = require("express");
const router = express.Router();
const chamadosController = require('../controllers/chamadosController');
const authController = require('../controllers/authController');

router.post('/', chamadosController.registrarChamado);

router.get('/solicitante/:id_solicitante', chamadosController.listarChamadosPorSolicitante);

router.put('/:id/atribuir', chamadosController.atribuirTecnico);
router.put('/:id/addServico', chamadosController.adicionarServico);
router.put('/:id/addComentario', authController.autenticarToken, chamadosController.adicionarComentario);
router.put('/:id/removerTech', chamadosController.removerTecnico);
router.put('/:id/concluirOS', chamadosController.concluirChamado);

router.get('/', chamadosController.listarChamados);
router.get('/tecnicos', chamadosController.listarTecnicos);
router.get('/:id/historico', chamadosController.carregarHistorico);

module.exports = router;
