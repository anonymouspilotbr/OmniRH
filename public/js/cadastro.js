const steps = document.querySelectorAll('.form-step');
let currentStep = 0;

document.getElementById('next-1').addEventListener('click', () => validarStep(1));
document.getElementById('back-2').addEventListener('click', () => changeStep(-1));
document.getElementById('next-2').addEventListener('click', () => validarStep(2));
document.getElementById('back-3').addEventListener('click', () => changeStep(-1));

function changeStep(direction) {
  steps[currentStep].classList.remove('active');
  currentStep += direction;
  steps[currentStep].classList.add('active');
}

function validarStep(stepNumber) {
  const step = document.getElementById(`step-${stepNumber}`);
  const inputs = step.querySelectorAll('input[required], select[required]');

  for (let input of inputs) {
    if (!input.value.trim()) {
      input.focus();
      alert('Por favor, preencha todos os campos obrigatórios antes de continuar.');
      return;
    }
  }

  changeStep(1);
}

document.addEventListener("DOMContentLoaded", function () {
  const selectHoraEntrada = document.getElementById('entrada-hora');
  const selectHoraSaida = document.getElementById('saida-hora');

  for (let h = 0; h < 24; h++) {
    const hora = h.toString().padStart(2, '0');
    const option = document.createElement('option');
    option.value = hora;
    option.textContent = hora;

    selectHoraEntrada.appendChild(option.cloneNode(true));
    selectHoraSaida.appendChild(option.cloneNode(true));
  }
});

document.getElementById('cadastro-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const senha = document.getElementById('senha').value;
    const confirmar = document.getElementById('confirmar-senha').value;

    if (senha !== confirmar) {
        alert('As senhas não coincidem!');
        return;
    }

    const entrada = `${document.getElementById('entrada-hora').value}:${document.getElementById('entrada-min').value}`;
    const saida = `${document.getElementById('saida-hora').value}:${document.getElementById('saida-min').value}`;

    const funcionario = {
        nome: document.getElementById('nome').value,
        cpf: document.getElementById('cpf').value,
        email: document.getElementById('email').value,
        telefone: document.getElementById('telefone').value,
        cargo: document.getElementById('cargo').value,
        departamento: document.getElementById('departamento').value,
        gestor: document.getElementById('gestor').value,
        regime: document.getElementById('regime').value,
        salario: document.getElementById('salario').value,
        data_admissao: document.getElementById('data_admissao').value,
        horario_entrada: entrada,
        horario_saida: saida,
        senha
    };

    try {
        const response = await fetch('/funcionarios', {
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