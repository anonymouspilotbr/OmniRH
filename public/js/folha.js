document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");

    if (token) {
        fetch("https://omnirh.onrender.com/me", {
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if (!data || !data.nome) return console.warn("Usuário não encontrado.");

            const usuario_id = data.id;
            const dataAdmissaoISO = data.data_admissao;

            //FOLHA-PONTO

            (function () {
                const abrirCalendario = document.getElementById("abrir-calendario");
                const hiddenInput = document.getElementById("hiddenDatePicker");
                let dataAtual = new Date();

                const semanaSelecionada = document.querySelector(".semana-atual");
                const diasContainer = document.getElementById("diasContainer");

                function getDomingo(data = new Date()){
                    const d = new Date(data.getFullYear(), data.getMonth(), data.getDate());
                    const dia = d.getDay();
                    const domingo = new Date(d);
                    domingo.setDate(d.getDate() - dia);
                    domingo.setHours(0,0,0,0);
                    return domingo;
                }

                function getSemana(data = new Date()){
                    const d = new Date(data);
                    const diaSemana = d.getDay();
                    const domingo = new Date(d);
                    domingo.setDate(d.getDate() - diaSemana);

                    const sabado = new Date(domingo);
                    sabado.setDate(domingo.getDate() + 6);

                    return { domingo, sabado };
                }

                function formatarDataBR(data){
                    return data.toLocaleDateString('pt-BR');
                }

                function formatarDataISO(data){
                    if (!(data instanceof Date) || isNaN(data)) {
                        console.warn("⚠️ formatarDataISO recebeu data inválida:", data);
                        console.trace();
                        return null;
                    }
                    return data.toISOString().split('T')[0];
                }

                function escapeHtml(str){
                    if (typeof str !== 'string') return str;
                    return str
                        .replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;")
                        .replace(/"/g, "&quot;")
                        .replace(/'/g, "&#039;");
                }

                const domSemAdmissao = new Date(dataAdmissaoISO);
                if (isNaN(domSemAdmissao.getTime())) {
                    console.error("Data de admissão inválida:", dataAdmissaoISO);
                } else {
                    hiddenInput.min = formatarDataISO(domSemAdmissao);
                }

                const HOJE = new Date();
                const domingoAtual = getDomingo(HOJE);
                if(domingoAtual < domSemAdmissao){
                    dataAtual = domSemAdmissao;
                } else {
                    dataAtual = HOJE;
                }

                abrirCalendario.addEventListener("click", (e) => {
                    if(hiddenInput.showPicker) hiddenInput.showPicker();
                    else{
                        hiddenInput.focus();
                        hiddenInput.click();
                    }
                });

                hiddenInput.addEventListener("change", (e) => {
                    let v = e.target.value;
                    if(!v) return;
                    const [y, m, d] = v.split('-').map(Number);
                    const selected = new Date(y, m - 1, d);

                    const domSelected = getDomingo(selected);
                    if(domSelected < domSemAdmissao){
                        alert(`Você não pode acessar semanas antes de ${formatarDataBR(domSemAdmissao)}`);
                        hiddenInput.value = formatarDataISO(domSemAdmissao);
                        dataAtual = domSemAdmissao;
                        atualizarPonto();
                        return;
                    }

                    dataAtual = selected;
                    try { hiddenInput.blur(); } catch(e){}
                    atualizarPonto();
                });

                
                
                async function atualizarPonto(){
                    const { domingo, sabado } = getSemana(dataAtual);
                    semanaSelecionada.textContent = `${formatarDataBR(domingo)} a ${formatarDataBR(sabado)}`;

                    const inicioISO = formatarDataISO(domingo);

                    try{
                        const res = await fetch(`/registro/${usuario_id}/semana/${inicioISO}`, {
                            method: 'GET',
                            headers: { 'Accept': 'application/json' } 
                        });

                        if (!res.ok){
                            console.error("Erro ao buscar registros:", res.status, res.statusText);
                            diasContainer.innerHTML = `<div class="bg-yellow-50 p-4 rounded">Não foi possível carregar os registros (status ${res.status}).</div>`;
                            return;
                        }

                        const dados = await res.json();
                        renderizarSemana(dados, domingo);
                    } catch (err) {
                        console.error("Erro na requisição:", err);
                        diasContainer.innerHTML = `<div class="bg-yellow-50 p-4 rounded">Erro ao buscar registros. Verifique sua API.</div>`;
                    }
                }

                function renderizarSemana(dados = [], dataDomingo){
                    const map = {};
                    (dados || []).forEach(item => {
                        if(!item.data) return;
                        map[item.data] = item;
                    });
                    
                    const diasDaSemana = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
                    let html = "";
                    for(let i = 0; i < 7; i++){
                        const dia = new Date(dataDomingo);
                        dia.setDate(dataDomingo.getDate() + i);
                        const iso = formatarDataISO(dia);
                        const label = diasDaSemana[i];

                        const entry = map[iso] ?? {};
                        const entrada = entry.entrada ?? '--:--:--';
                        const saida = entry.saida ?? '--:--:--';
                        const modalidade = entry && entry.modalidade ? escapeHtml(entry.modalidade) : "-";
                        const ocorrencias = entry && entry.ocorrencias ? escapeHtml(entry.ocorrencias) : "<span class='text-green-500'>Sem ocorrências</span>";

                        let ocorrenciasHtml = ocorrencias;
                        if (typeof ocorrencias === 'string' && /atraso/i.test(ocorrencias)) {
                            ocorrenciasHtml = `<span class="text-red-500">${ocorrencias}</span>`;
                        }

                        html += `
                            <div class="flex items-center justify-between bg-white shadow-lg px-4 py-2 rounded-lg w-full">
                                <div class="grid grid-cols-6 gap-4 w-full text-sm">
                                    <div><p><span class="font-bold ${i===6 ? 'text-red-500':''}">${label}</span></p></div>
                                    <div class="text-center"><p class="font-bold">Data</p><p>${formatarDataBR(dia)}</p></div>
                                    <div class="text-center"><p class="font-bold">Entrada</p><p class="${entrada === '--:--:--' ? '' : 'text-green-500'}">${entrada}</p></div>
                                    <div class="text-center"><p class="font-bold">Saída</p><p class="${saida === '--:--:--' ? '' : 'text-green-500'}">${saida}</p></div>
                                    <div class="text-center"><p class="font-bold">Modalidade</p><p>${modalidade}</p></div>
                                    <div class="text-center"><p class="font-bold">Ocorrências</p><p>${ocorrenciasHtml}</p></div>
                                </div>
                            </div>
                        `;
                    }

                    diasContainer.innerHTML = html;
                }

                atualizarPonto();

            })();
        })

        .catch(err => {
            console.error('Erro ao obter /me', err);
        });
    }
});


