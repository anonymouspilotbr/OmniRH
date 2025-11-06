const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const userService = require('../service/userService');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, '/tmp'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

const uploadImagem = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ erro: 'Nenhuma imagem enviada.' });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'omnirh_perfis'
    });

    await userService.atualizarFoto(req.body.userID, result.secure_url);

    res.json({ sucesso: true, url: result.secure_url });
  } catch (err) {
    console.error('Erro ao salvar imagem:', err);
    res.status(500).json({ erro: 'Erro ao salvar imagem no banco.' });
  }
};

module.exports = { upload, uploadImagem };

