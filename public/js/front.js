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
  window.location.href = "recessos-funcionario";
}
function paginaMenuLicencas(){
  window.location.href = "licencas";
}
function paginaMenuHoras(){
  window.location.href = "horas";
}
function paginaMenuChamados(){
  window.location.href = "chamados";
}

document.addEventListener('DOMContentLoaded', () => {
  const menuHome = document.getElementById('menu-home');
  const menuREC = document.getElementById('menu-recesso');
  const menuLIC = document.getElementById('menu-licencas');
  const menuHoras = document.getElementById('menu-horas');
  const menuChamados = document.getElementById('menu-chamados');

  if (menuHome) menuHome.addEventListener('click', paginaMenuHome);
  if (menuREC) menuREC.addEventListener('click', paginaMenuRecessos);
  if (menuLIC) menuLIC.addEventListener('click', paginaMenuLicencas);
  if (menuHoras) menuHoras.addEventListener('click', paginaMenuHoras);
  if (menuChamados) menuChamados.addEventListener('click', paginaMenuChamados);
});

document.addEventListener('DOMContentLoaded', () => {
  const botaoREC = document.getElementById('botao-recesso');
  const botaoLIC = document.getElementById('botao-licenca');

  if (botaoREC) botaoREC.addEventListener('click', paginaMenuRecessos);
  if (botaoLIC) botaoLIC.addEventListener('click', paginaMenuLicencas);
});