const multer = require('multer');
const path = require('path');
const userService = require('../service/userService');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

const uploadImagem = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ erro: 'Nenhum arquivo enviado.' });
    }

    const caminho = `/uploads/${req.file.filename}`;
    const userId = req.body.userId; 

    await userService.atualizarFoto(userId, caminho);

    res.json({ sucesso: true, caminho });
  } catch (err) {
    console.error('Erro ao salvar imagem:', err);
    res.status(500).json({ erro: 'Erro ao salvar imagem no banco.' });
  }
};

module.exports = { upload, uploadImagem };

