document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem("token");

    if (!token) {
        console.warn("No token found, cannot fetch user data");
        return;
    }

    // Fetch user data to get ID
    fetch("https://omnirh.onrender.com/me", {
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(userData => {
        if (!userData || !userData.id) {
            console.warn("User data not found");
            return;
        }

        const usuarioId = userData.id;

        // Fetch balance
        fetch(`https://omnirh.onrender.com/banco-horas/${usuarioId}`)
            .then(response => response.json())
            .then(data => {
                const saldo = data.saldo;
                const horas = Math.floor(saldo);
                const minutos = Math.round((saldo - horas) * 60);
                document.querySelector('.bg-white.text-center.shadow-lg.px-4.py-2.rounded-lg.shadow-md.w-fit.mx-auto h3').textContent = `${horas}h${minutos}m`;
            })
            .catch(error => console.error('Error fetching balance:', error));

        // Fetch records for the current week
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const dataInicio = startOfWeek.toISOString().split('T')[0];

        fetch(`https://omnirh.onrender.com/banco-horas/registros/${usuarioId}?dataInicio=${dataInicio}`)
            .then(response => response.json())
            .then(registros => {
                const historyContainer = document.querySelector('.space-y-2');
                historyContainer.innerHTML = ''; // Clear existing static data

                registros.forEach(registro => {
                    const date = new Date(registro.data);
                    const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase();
                    const day = date.getDate();
                    const month = date.getMonth() + 1;
                    const year = date.getFullYear();

                    const entrada = registro.entrada || '--:--:--';
                    const saida = registro.saida || '--:--:--';
                    const tempoServico = registro.horas_trabalhadas ? `${Math.floor(registro.horas_trabalhadas)}h${Math.round((registro.horas_trabalhadas % 1) * 60)}m` : '--:--:--';
                    const tempoArmazenado = registro.horas_extras ? `${Math.floor(registro.horas_extras)}h${Math.round((registro.horas_extras % 1) * 60)}m` : '--:--:--';

                    // Determine occurrences (simplified, based on atraso or something)
                    let ocorrencias = 'Sem ocorrências';
                    let ocorrenciasClass = 'text-green-500';
                    if (registro.atraso) {
                        ocorrencias = 'Atraso - Não Resolvida';
                        ocorrenciasClass = 'text-red-500';
                    }

                    const dayDiv = document.createElement('div');
                    dayDiv.className = 'bg-gray-50 rounded-2xl shadow-lg p-6 w-full mx-auto';
                    dayDiv.innerHTML = `
                        <div class="flex items-center justify-between grid grid-cols-7 gap-4 w-full">
                            <div>
                                <p><span class="font-bold">${dayName}</span></p>
                            </div>
                            <div class="text-center">
                                <p><span class="font-bold">Data</span></p>
                                <p>${day}/${month}/${year}</p>
                            </div>
                            <div class="text-center">
                                <p><span class="font-bold">Entrada</span></p>
                                <p>${entrada}</p>
                            </div>
                            <div class="text-center">
                                <p><span class="font-bold">Saída</span></p>
                                <p>${saida}</p>
                            </div>
                            <div class="text-center">
                                <p><span class="font-bold">Tempo de Serviço</span></p>
                                <p>${tempoServico}</p>
                            </div>
                            <div class="text-center">
                                <p><span class="font-bold">Tempo armazenado</span></p>
                                <p>${tempoArmazenado}</p>
                            </div>
                            <div class="text-center">
                                <p><span class="font-bold">Ocorrências</span></p>
                                <p class="${ocorrenciasClass}">${ocorrencias}</p>
                            </div>
                        </div>
                    `;
                    historyContainer.appendChild(dayDiv);
                });
            })
            .catch(error => console.error('Error fetching records:', error));
    })
    .catch(err => console.error("Error fetching user data:", err));
});
