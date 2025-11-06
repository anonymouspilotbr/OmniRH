const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const repository = require('../repositorie/repositorio');
const mailer = require('../util/mailer');

async function solicitarResetDeSenha(email){
    const funcionario = await repository.buscarFuncionarioPorEmail(email);
    if(!funcionario) throw new Error('E-mail não encontrado');

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); //1h

    await repository.criarToken(funcionario.id, token, expiresAt)

    const link = `https://omnirh.onrender.com/reset-senha?token=${token}`;

    await mailer.enviarEmail({
        para: email,
        assunto: 'Redefinição de Senha - OmniRH',
        texto: `Você solicitou uma redefinição de senha. Acesse o link para continuar: ${link}`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #1e88e5; text-align: center;">Redefinição de Senha</h2>
            <p>Olá <strong>${funcionario.nome}</strong>,</p>
            <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>OmniRH</strong>.</p>
            <p>Caso tenha sido você, clique no botão abaixo:</p>

            <p style="text-align: center; margin: 30px 0;">
                <a href="${link}" style="background: #1e88e5; color: #fff; padding: 14px 22px; text-decoration: none; border-radius: 6px; font-size: 16px;">
                    Redefinir Senha
                </a>
            </p>

            <p>Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</p>
            <p style="word-break: break-all; color: #555;">${link}</p>

            <p style="margin-top: 25px; font-size: 13px; color: #888;">
                Caso você não tenha solicitado esta ação, apenas ignore este e-mail.
            </p>

            <p style="margin-top: 10px; font-size: 13px; color: #999; text-align: center;">
                Este link expira em 1 hora.
            </p>
        </div>
        `
    });

    return link;
}

async function redefinirSenha(token, novaSenha) {
    const tokenData = await repository.buscarPorToken(token);
    if (!tokenData) throw new Error('Token inválido ou expirado');

    const senhaHash = await bcrypt.hash(novaSenha, 10);
    await repository.atualizarSenha(tokenData.id_funcionario, senhaHash);
    await repository.marcarComoUsado(tokenData.id);

    return 'Senha alterada com sucesso!';
}

module.exports = {
    solicitarResetDeSenha,
    redefinirSenha,
}