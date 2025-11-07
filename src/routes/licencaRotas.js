const express = require('express');
const router = express.Router();
const licencaController = require('../controllers/licencaController');

// Registrar nova licença
router.post('/', licencaController.registrarLicenca);

// Listar licenças de um funcionário
router.get('/funcionario/:id_funcionario', licencaController.listarLicencasPorFuncionario);

// Listar todas as licenças (para RH)
router.get('/', licencaController.listarTodasLicencas);

// Buscar licença por ID
router.get('/:id', licencaController.buscarLicencaPorId);

// Aprovar licença
router.put('/:id/aprovar', licencaController.aprovarLicenca);

// Rejeitar licença
router.put('/:id/rejeitar', licencaController.rejeitarLicenca);

module.exports = router;
