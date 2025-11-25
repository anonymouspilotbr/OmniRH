const express = require('express');
const router = express.Router();
const licencaController = require('../controllers/licencaController');
const uploadController = require('../controllers/uploadController');

// Registrar nova licença
router.post('/', licencaController.registrarLicenca);

// Listar licenças de um funcionário
router.get('/funcionario/:id_funcionario', licencaController.listarLicencasPorFuncionario);

router.get('/pendentes', licencaController.listarLicencasPendentes);
router.get("/aprovadas", licencaController.buscarAprovadas);
router.get('/estatisticas', licencaController.estatisticas);

router.put('/:id/aprovar', licencaController.aprovarLicenca);
router.put('/:id/rejeitar', licencaController.rejeitarLicenca);

router.post('/:id/upload', uploadController.upload.array('anexos'), uploadController.tratarErroUpload, uploadController.uploadAnexoLicenca);

router.get('/:id', licencaController.buscarLicencaPorId);
router.get('/', licencaController.listarTodasLicencas);

module.exports = router;
