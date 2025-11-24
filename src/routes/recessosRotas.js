const express = require('express');
const router = express.Router();
const controller = require('../controllers/recessosController');
const upController = require('../controllers/uploadController');

router.post("/:id/upload", upController.upload.array("anexos"), upController.tratarErroUpload, upController.uploadAnexoRecesso);

router.post("/", upController.upload.none(), controller.criarRecesso);
router.get("/funcionario/:id", controller.listarPorFuncionario);

router.get('/pendentes', controller.listarPendentes);
router.get('/aprovados', controller.buscarAprovados);
router.get('/estatisticas', controller.estatisticas);

// Listar todas as licenças (para RH)
router.get('/', controller.listarTodosRecessos);

router.put('/:id/aprovar', controller.aprovarRecesso);
router.put('/:id/rejeitar', controller.rejeitarRecesso);

module.exports = router;
