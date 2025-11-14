const express = require('express')
const router = express.Router();

const OmniRH_Controllers = require('../controllers/generalController');

router.get('/', OmniRH_Controllers.loginView);
router.get('/horas', OmniRH_Controllers.bancoHorasView);
router.get('/home', OmniRH_Controllers.homeView);
router.get('/perfil', OmniRH_Controllers.perfilView);
router.get('/registro-licencas', OmniRH_Controllers.licencasView);
router.get('/chamados', OmniRH_Controllers.chamadosView);
router.get('/cadastro', OmniRH_Controllers.cadFuncionariosView);
router.get('/controle-rh', OmniRH_Controllers.ocorrenciasView);
router.get('/registro-ocorrencias', OmniRH_Controllers.ocorrenciasFuncView);
router.get('/recessos-funcionario', OmniRH_Controllers.recessosView);
router.get('/recessos-RH', OmniRH_Controllers.recessosRHView);
router.get('/esqueci-senha', OmniRH_Controllers.esqueciSenhaView);
router.get('/reset-senha', OmniRH_Controllers.resetarSenhaView);

module.exports = router;