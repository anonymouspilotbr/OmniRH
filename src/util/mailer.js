const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function enviarEmail(para, assunto, texto) {
    await transporter.sendMail({
        from: `"OmniRH" <${process.env.EMAIL_USER}>`,
        para,
        assunto,
        texto,
    });
};

module.exports = {
    enviarEmail,
}