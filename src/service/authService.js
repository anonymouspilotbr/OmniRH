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

    const link = `http://localhost:8080/reset-senha?token=${token}`;
    await mailer.enviarEmail({
        para: email,
        assunto: 'Redefinição de Senha - OmniRH',
        texto: `Você solicitou uma redefinição de senha. Clique no link para continuar: ${link}`,
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