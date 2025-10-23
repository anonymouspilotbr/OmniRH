document.getElementById('cadastro-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const funcionario = {
        nome: document.getElementById('nome').value,
        cpf: document.getElementById('cpf').value,
        email: document.getElementById('email').value,
        telefone: document.getElementById('telefone').value,
        cargo: document.getElementById('cargo').value,
        departamento: document.getElementById('departamento').value,
        gestor: document.getElementById('gestor').value,
        data_admissao: document.getElementById('data_admissao').value,
        senha: document.getElementById('senha').value
    };

    try {
        const response = await fetch('/api/funcionarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(funcionario)
        });

        const data = await response.json();

        if (response.ok) {
            alert('Funcionário cadastrado com sucesso!');
            document.getElementById('cadastro-form').reset();
        } else {
            alert(`Erro: ${data.error}`);
        }

    } catch (error) {
        console.error('Erro ao enviar dados:', error);
        alert('Erro ao conectar com o servidor');
    }
});