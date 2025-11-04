const nodemailer = require('nodemailer');
require("dotenv").config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false  
    }
});

async function enviarEmail({ para, assunto, texto }) {
    const info = await transporter.sendMail({
        from: `"OmniRH" <${process.env.EMAIL_FROM}>`,
        to: para,
        subject: assunto,
        text: texto,
    });

    console.log("✅ Email enviado:", info.messageId);
}

module.exports = {
    enviarEmail,
}