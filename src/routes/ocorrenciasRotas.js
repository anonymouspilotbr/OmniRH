const express = require('express');
const router = express.Router();
const controller = require('../controllers/ocorrenciasController');
const upController = require('../controllers/uploadController');

router.post('/', controller.criar);
router.get('/', controller.listar);
router.get('/funcionario/:id_funcionario', controller.listarPorFuncionario);
router.get('/:id', controller.buscarPorId);
router.put('/:id', controller.atualizar);
router.delete('/:id', controller.deletar);

router.post('/:id/upload', upController.upload.array('anexos'), upController.tratarErroUpload, upController.uploadAnexoOcorrencia);

module.exports = router;