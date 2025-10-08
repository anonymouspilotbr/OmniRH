const express = require('express')
const router = express.Router();

const OmniRH_Controllers = require('../controllers/omnirh_back');

router.get('/', OmniRH_Controllers.loginView);
router.get('/horas', OmniRH_Controllers.bancoHorasView);
router.get('/home', OmniRH_Controllers.homeView);
router.get('/perfil', OmniRH_Controllers.perfilView);
router.get('/licencas', OmniRH_Controllers.licencasView);
router.get('/chamados', OmniRH_Controllers.chamadosView);
router.get('/cadastro', OmniRH_Controllers.cadFuncionariosView);
router.get('/ocorrencias-RH', OmniRH_Controllers.ocorrenciasView);
router.get('/ocorrencias', OmniRH_Controllers.ocorrenciasFuncView);
router.get('/recessos-funcionario', OmniRH_Controllers.recessosView);
router.get('/recessos-RH', OmniRH_Controllers.recessosRHView);

module.exports = router;