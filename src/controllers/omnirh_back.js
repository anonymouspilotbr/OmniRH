const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET = 'omniRH_secret_key';
const users = [];

function loginView(req, res){
    res.render('login.html');
}

function homeView(req,res){
    res.render('index.html');
}

function chamadosView(req,res){
    res.render('chamados.html');
}

function cadFuncionariosView(req,res){
    res.render('novos_funcionarios.html');
}

function perfilView(req,res){
    res.render('pagina_perfil.html');
}

function licencasView(req,res){
    res.render('TelaLicencasAfast.html');
}

function recessosView(req,res){
    res.render('Omni-RH.Recessos.html');
}

function recessosRHView(req,res){
    res.render('Omni-RH.RH-Recessos.html');
}

function bancoHorasView(req,res){
    res.render('bancohoras.html');
}

function ocorrenciasView(req,res){
    res.render('Painel_ControleRH.html');
}

function ocorrenciasFuncView(req,res){
    res.render('ocorrenciasv2.html');
}

function esqueciSenhaView(req,res){
    res.render('esqueci_senha.html');
}

function resetarSenhaView(req, res){
    res.render('resetar_senha.html');
}

exports.register = (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha)
        return res.status(400).json({ msg: 'Preencha todos os campos' });

    const userExists = users.find(u => u.email === email);
    if (userExists)
        return res.status(400).json({ msg: 'Usuário já cadastrado' });

    const hashedPassword = bcrypt.hashSync(senha, 8);
    users.push({ email, senha: hashedPassword });

    res.json({ msg: 'Usuário registrado com sucesso!' });
};

exports.login = (req, res) => {
    const { email, senha } = req.body;

    const user = users.find(u => u.email === email);
    if (!user) return res.status(404).json({ msg: 'Usuário não encontrado' });

    const senhaValida = bcrypt.compareSync(senha, user.senha);
    if (!senhaValida) return res.status(401).json({ msg: 'Senha incorreta' });

    const token = jwt.sign({ email: user.email }, SECRET, { expiresIn: '1h' });
    res.json({ msg: 'Login realizado com sucesso', token });
};

module.exports = {
    loginView,
    homeView,
    chamadosView,
    cadFuncionariosView,
    perfilView,
    licencasView,
    recessosRHView,
    recessosView,
    bancoHorasView,
    ocorrenciasView,
    ocorrenciasFuncView,
    esqueciSenhaView,
    resetarSenhaView,
}