const nodemailer = require('nodemailer');

let transporter;

async function createTransporter() {
    if (!transporter) {
        const testAccount = await nodemailer.createTestAccount();

        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        console.log("ETHEREAL EMAIL LOGIN:");
        console.log("User:", testAccount.user);
        console.log("Pass:", testAccount.pass);
        console.log("Webmail:", "https://ethereal.email/login");
    }
    return transporter;
}

async function enviarEmail({para, assunto, texto}) {
    const mailer = await createTransporter();

    const info = await mailer.sendMail({
        from: '"OmniRH" <no-reply@omnirh.com>',
        to: para,
        subject: assunto,
        text: texto
    });

    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
}

module.exports = {
    enviarEmail,
}