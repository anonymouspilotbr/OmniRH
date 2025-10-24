const multer = require('multer');
const path = require('path');
const fs = require('fs');
const userService = require('../service/userService');

const uploadDir = path.join(__dirname, '../../public/uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

const uploadImagem = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ erro: 'Nenhum arquivo enviado.' });
    }

    const caminho = `/uploads/${req.file.filename}`;
    const userId = req.body.userID; 

    await userService.atualizarFoto(userId, caminho);

    res.json({ sucesso: true, caminho });
  } catch (err) {
    console.error('Erro ao salvar imagem:', err);
    res.status(500).json({ erro: 'Erro ao salvar imagem no banco.' });
  }
};

module.exports = { upload, uploadImagem };

