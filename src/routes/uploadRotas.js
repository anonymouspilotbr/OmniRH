const express = require('express');
const router = express.Router();
const { upload, uploadImagem } = require('../controllers/uploadController');

router.post('/upload', upload.single('fotoPerfil'), uploadImagem);

module.exports = router;