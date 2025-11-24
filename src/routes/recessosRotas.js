const express = require('express');
const router = express.Router();
const controller = require('../controllers/recessosController');
const upController = require('../controllers/uploadController');

router.get("/funcionario/:id", controller.listarPorFuncionario);
router.post("/", upController.upload.array("anexos"), upController.tratarErroUpload, upController.uploadAnexoRecesso);
