document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  console.log("Token carregado");

  if (token) {
    fetch("https://omnirh.onrender.com/me", {
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
        console.log("Dados recebidos: ", data);
        if (!data || !data.nome) return console.warn("Usuário não encontrado.");
        
        const userID = data.id;
        inicializarUpload(userID);

        const fotoUsuario = document.getElementById('fotoUser');
        const placeholder = document.getElementById('placeholder');

        if (data.foto_perfil) {
          fotoUsuario.src = data.foto_perfil;
          fotoUsuario.classList.remove('hidden');
          placeholder.classList.add('hidden');
        } else {
          fotoUsuario.classList.add('hidden');
          placeholder.classList.remove('hidden');
        }
    })
    .catch(err => console.error("Erro ao buscar usuário:", err));
  } else {
    console.warn("Nenhum token encontrado no localStorage");
  }
});

function inicializarUpload(userID){
    const fotoInput = document.getElementById('fotoPerfil');
    const fotoUsuario = document.getElementById('fotoUser');
    const placeholder = document.getElementById('placeholder');
    const overlay = document.querySelector('.group');

    overlay.addEventListener('click', () => {
        fotoInput.click();
    });

    fotoInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            fotoUsuario.src = event.target.result;
            fotoUsuario.classList.remove('hidden');
            placeholder.classList.add('hidden');
        };
        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append('fotoPerfil', file);
        formData.append('userID', userID);

        try {
            const response = await fetch('https://omnirh.onrender.com/upload', {
              method: 'POST',
              body: formData
            });

            const data = await response.json();
            if (data.sucesso) {
              console.log('Upload concluído:', data.caminho);
              fotoUsuario.src = data.caminho; 
            } else {
              alert('Erro ao enviar a imagem.');
            }
        } catch (err) {
            console.error('Erro no upload:', err);
        }
    });
}



