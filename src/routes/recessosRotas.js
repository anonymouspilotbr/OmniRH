const express = require('express');
const router = express.Router();
const controller = require('../controllers/recessosController');
const upController = require('../controllers/uploadController');

router.post("/:id/upload", upController.upload.array("anexos"), upController.tratarErroUpload, upController.uploadAnexoRecesso);

router.post("/", upController.upload.none(), controller.criarRecesso);
router.get("/funcionario/:id", controller.listarPorFuncionario);

module.exports = router;
