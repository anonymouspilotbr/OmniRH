const express = require('express');
const router = express.Router();
const controller = require('../controllers/ocorrenciasController');

router.post('/', controller.criar);
router.get('/', controller.listar);
router.get('/funcionario/:id_funcionario', controller.listarPorFuncionario);
router.get('/:id', controller.buscarPorId);
router.put('/:id', controller.atualizar);
router.delete('/:id', controller.deletar);

module.exports = router;