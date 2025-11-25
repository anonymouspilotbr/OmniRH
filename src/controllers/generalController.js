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

function chamadosFuncionarioView(req,res){
    res.render('chamados_funcionario.html');
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
    res.render('recessosv2.html');
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

module.exports = {
    loginView,
    homeView,
    chamadosView,
    chamadosFuncionarioView,
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