const Brevo = require("@getbrevo/brevo");
require("dotenv").config();

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
    Brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
);

async function enviarEmail({ para, assunto, texto, html }) {
    try {
        await apiInstance.sendTransacEmail({
            sender: { email: process.env.EMAIL_FROM, name: "OmniRH" },
            to: [{ email: para }],
            subject: assunto,
            textContent: texto || undefined,
            htmlContent: html || undefined
        });

        console.log("✅ Email enviado via Brevo API");
    } catch (error) {
        console.error("❌ Erro ao enviar email:", error.response?.body || error);
        throw new Error("Falha ao enviar e-mail.");
    }
}

module.exports = {
    enviarEmail,
}