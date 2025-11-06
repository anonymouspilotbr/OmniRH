const Brevo = require("@getbrevo/brevo");
require("dotenv").config();

const apiInstance = new Brevo.TransactionalEmailsApi();

apiInstance.setApiKey(
    Brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
);

async function enviarEmail({ para, assunto, texto, html }) {
    try {
        const email = new Brevo.SendSmtpEmail({
            sender: { name: "OmniRH", email: process.env.EMAIL_FROM },
            to: [{ email: para }],
            subject: assunto,
            textContent: texto,
            htmlContent: html || texto
        });

        console.log("📨 Enviando email com payload:", email);
        const result = await apiInstance.sendTransacEmail(email);
        console.log("✅ Email enviado via Brevo API:", result);
        return result;
    } catch (error) {
        console.error("❌ Erro ao enviar email:", error.response?.body || error);
        throw error;
    }
}

module.exports = {
    enviarEmail,
}