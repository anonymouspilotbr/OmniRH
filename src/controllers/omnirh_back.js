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
    res.render('Omni-RH(Ocorrências).html');
}

function ocorrenciasFuncView(req,res){
    res.render('ocorrencias.html');
}

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
}