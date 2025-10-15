const express = require('express')
const router = express.Router();

const { criarFuncionario } = require('../controllers/funcionarioController.js');

router.post('/funcionarios', criarFuncionario);

module.exports = router;