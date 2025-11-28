function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  sidebar.classList.toggle('-translate-x-full');
  overlay.classList.toggle('hidden');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.add('-translate-x-full');
  document.getElementById('overlay').classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.getElementById('menuButton');
  const closeButton = document.getElementById('closeButton');
  const overlay = document.getElementById('overlay');
  
  if (menuButton) menuButton.addEventListener('click', toggleSidebar);
  if (closeButton) closeButton.addEventListener('click', closeSidebar);
  if (overlay) overlay.addEventListener('click', closeSidebar);
});

//Páginas do Menu:
function paginaMenuHome(){
  window.location.href = "home";
}
function paginaMenuRecessos(){
  window.location.href = "registro-recessos";
}
function paginaMenuLicencas(){
  window.location.href = "registro-licencas";
}
function paginaMenuHoras(){
  window.location.href = "horas";
}
function paginaMenuChamados(){
  window.location.href = "chamados";
}
function paginaMenuControleRH(){
  window.location.href = "controle-rh";
}
function paginaMenuListaF(){
  window.location.href = "lista-funcionarios";
}

document.addEventListener('DOMContentLoaded', () => {
  const menuHome = document.getElementById('menu-home');
  const menuREC = document.getElementById('menu-recesso');
  const menuLIC = document.getElementById('menu-licencas');
  const menuHoras = document.getElementById('menu-horas');
  const menuControle = document.getElementById('menu-painel');
  const menuListaF = document.getElementById('menu-lista');
  const menuChamados = document.getElementById('menu-chamados');

  if (menuHome) menuHome.addEventListener('click', paginaMenuHome);
  if (menuREC) menuREC.addEventListener('click', paginaMenuRecessos);
  if (menuLIC) menuLIC.addEventListener('click', paginaMenuLicencas);
  if (menuHoras) menuHoras.addEventListener('click', paginaMenuHoras);
  if (menuChamados) menuChamados.addEventListener('click', paginaMenuChamados);

  if(data.tipo === "RH"){
    menuControle.classList.remove("hidden");
    menuListaF.classList.remove("hidden");

    menuControle.addEventListener('click', paginaMenuControleRH);
    menuListaF.addEventListener('click', paginaMenuListaF);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const botaoREC = document.getElementById('botao-recesso');
  const botaoLIC = document.getElementById('botao-licenca');

  if (botaoREC) botaoREC.addEventListener('click', paginaMenuRecessos);
  if (botaoLIC) botaoLIC.addEventListener('click', paginaMenuLicencas);
});

//NOME USUARIO
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (token) {
    fetch("https://omnirh.onrender.com/me", {
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (!data || !data.nome) return console.warn("Usuário não encontrado.");

      //CABEÇALHO
      const nomeHeader = document.querySelector("header p.font-semibold");
      const cargoHeader = document.querySelector("header p.text-blue-200");
      if (nomeHeader) nomeHeader.textContent = data.nome;
      if (cargoHeader) cargoHeader.textContent = data.cargo;

      //FOTO PERFIL
      const headerFoto = document.getElementById('headerFoto');
      const headerIcon = document.getElementById('headerIcon');

      if (headerFoto && headerIcon) {
        if (data.foto_perfil) {
          headerFoto.src = data.foto_perfil;
          headerFoto.classList.remove('hidden');
          headerIcon.classList.add('hidden');
        } else {
          headerFoto.classList.add('hidden');
          headerIcon.classList.remove('hidden');
        }
      }

      //MENU LADO DIREITO
      const userIcon = document.getElementById("usericon");
      const userMenu = document.getElementById("usermenu");

      if (userIcon && userMenu) {
        userIcon.addEventListener("click", (e) => {
          e.stopPropagation();
          userMenu.classList.toggle("hidden");
        });

        document.addEventListener("click", (e) => {
          if (!userMenu.classList.contains("hidden") && !userMenu.contains(e.target) && e.target !== userIcon) {
            userMenu.classList.add("hidden");
          }
        });
      }

      //CABEÇALHO FOLHA DE PONTO
      const nomeFolha = document.querySelector(".folha-nome");
      const gestorFolha = document.querySelector(".folha-gestor");
      const departFolha = document.querySelector(".folha-departamento");
      const horarioEntradaFolha = document.querySelector(".folha-horario-entrada");
      const horarioSaidaFolha = document.querySelector(".folha-horario-saida");
      const regimeFolha = document.querySelector(".folha-regime");
      const codFolha = document.querySelector(".folha-codigo");
      if (nomeFolha) nomeFolha.textContent = data.nome;
      if (gestorFolha) gestorFolha.textContent = data.gestor || "-";
      if (departFolha) departFolha.textContent = data.departamento;
      if (horarioEntradaFolha) horarioEntradaFolha.textContent = data.horario_entrada;
      if (horarioSaidaFolha) horarioSaidaFolha.textContent = data.horario_saida;
      if (regimeFolha) regimeFolha.textContent = data.regime;
      if (codFolha) codFolha.textContent = data.id;

      //PERFIL USUÁRIO
      const nomePerfil = document.querySelector(".view-mode.text-2xl");
      const cargoPerfil = document.querySelector(".text-blue-600.font-medium");
      const emailPerfil = document.querySelector(".fa-envelope + span");
      const telefonePerfil = document.querySelector(".fa-phone + span");
      const infoCargo = document.querySelector('.info-cargo');
      const infoDepartamento = document.querySelector('.info-departamento');
      const infoDepartamento2 = document.querySelector('.info-departamento2');
      const infoGestor = document.querySelector('.info-gestor');
      const dataAdmissao = document.querySelector('.data-admissao');
      const tempoServico = document.querySelector('.tempo-servico');
      const regimePerfil = document.querySelector('.info-regime');
      const salarioPerfil = document.querySelector('.info-salario');
      const horarioEntradaPerfil = document.querySelector('.info-horario-entrada');
      const horarioSaidaPerfil = document.querySelector('.info-horario-saida');

      //FUNÇÕES DE DATA
      const dataSelect = new Date(data.data_admissao);
      const dataFormat = dataSelect.toLocaleDateString('pt-BR');
      function diferencaData(data) {
        const dataAtual = new Date();
        const dataAlvo = data;

        let anos = dataAtual.getFullYear() - dataAlvo.getFullYear();
        let meses = dataAtual.getMonth() - dataAlvo.getMonth();

        if (meses < 0) {
            anos--;
            meses += 12;
        }

        return `${anos} anos, ${meses} meses`;
    }

      if (nomePerfil) nomePerfil.textContent = data.nome;
      if (cargoPerfil) cargoPerfil.textContent = data.cargo;
      if (emailPerfil) emailPerfil.textContent = data.email;
      if (telefonePerfil) telefonePerfil.textContent = data.telefone || "(não informado)";
      if (infoCargo) infoCargo.textContent = data.cargo;
      if (infoDepartamento) infoDepartamento.textContent = data.departamento;
      if (infoDepartamento2) infoDepartamento2.textContent = data.departamento;
      if (infoGestor) infoGestor.textContent = data.gestor || "-";
      if (dataAdmissao) dataAdmissao.textContent = dataFormat;
      if (tempoServico) tempoServico.textContent = diferencaData(dataSelect);
      if (regimePerfil) regimePerfil.textContent = data.regime;
      if (salarioPerfil) salarioPerfil.textContent = data.salario;
      if (horarioEntradaPerfil) horarioEntradaPerfil.textContent = data.horario_entrada;
      if (horarioSaidaPerfil) horarioSaidaPerfil.textContent = data.horario_saida;

      const idPerfil = document.querySelector(".text-gray-500.mt-2");
      if (idPerfil) idPerfil.textContent = `ID: ${data.id}`;

    })
    .catch(err => console.error("Erro ao buscar usuário:", err));
  } else {
    console.warn("Nenhum token encontrado no localStorage");
  }
});


