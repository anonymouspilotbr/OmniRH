const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const userService = require('../service/userService');
const licencaService = require('../service/licencaService');
const ocorrenciasService = require('../service/ocorrenciasService');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, '/tmp'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

function fileFilter(req, file, cb) {
  const tiposPermitidos = ["image/jpeg", "image/png", "image/jpg", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Tipo de arquivo não permitido! Apenas JPG, PNG, PDF, DOC e DOCX."), false);
  }
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 25 * 1024 * 1024 } });

function tratarErroUpload(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        erro: `Tipo de arquivo não permitido. Apenas JPG, PNG, PDF, DOC e DOCX são aceitos.`
      });
    }
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        erro: 'Arquivo muito grande! O limite é de 25MB por arquivo.'
      });
    }
  }
  // Outros erros genéricos
  if (err) {
    console.error('Erro no upload:', err);
    return res.status(500).json({ erro: 'Erro ao processar o upload.' });
  }
  next();
}

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

const uploadAnexoLicenca = async (req,res) => {
  try {
    const { id } = req.params;
    const urls = [];

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ erro: 'Nenhum arquivo enviado.' });
    }

    const uploads = await Promise.all(
      req.files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'anexos_licencas',
          resource_type: 'auto',
        });
        return result.secure_url;
      })
    );

    console.log("✅ Uploads concluídos:", uploads);
    await licencaService.atualizarAnexo(id, uploads);

    res.json({ sucesso: true, urls: uploads});
  } catch (err) {
    console.error('Erro ao salvar o arquivo:', err);
    res.status(500).json({ erro: 'Erro ao salvar o arquivo no banco.' });
  }
}

const uploadAnexoOcorrencia = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ erro: 'Nenhum arquivo enviado.' });
    }

    const uploads = await Promise.all(
      req.files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'anexos_ocorrencias',
          resource_type: 'auto',
        });
        return result.secure_url;
      })
    );

    console.log("📌 Uploads ocorrências:", uploads);

    await ocorrenciasService.atualizarAnexos(id, JSON.stringify(uploads));

    res.json({ sucesso: true, urls: uploads });
  } catch (err) {
    console.error('Erro ao salvar anexo da ocorrência:', err);
    res.status(500).json({ erro: 'Erro ao salvar o arquivo.' });
  }
};

module.exports = { 
  upload, 
  uploadImagem, 
  uploadAnexoLicenca, 
  uploadAnexoOcorrencia, 
  tratarErroUpload, 
};

