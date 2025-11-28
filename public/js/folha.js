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

                function parseTimeToMinutes(t) {
                    if (!t || t === '--:--:--') return null;
                    // aceita "HH:MM:SS" ou "HH:MM"
                    const parts = t.split(':').map(Number);
                    return parts[0] * 60 + (parts[1] || 0);
                }

                function minutosDiff(real, esperado) {
                    const mReal = parseTimeToMinutes(real);
                    const mEsp  = parseTimeToMinutes(esperado);
                    if (mReal == null || mEsp == null) return null;
                    return mReal - mEsp; // positivo = atrasado (minutos)
                }

                function jornadaEmMinutos(entrada, saida) {
                    const me = parseTimeToMinutes(entrada);
                    const ms = parseTimeToMinutes(saida);
                    if (me == null || ms == null) return null;
                    let diff = ms - me;
                    if (diff < 0) diff += 24 * 60; // passa da meia-noite
                    return diff;
                }

                // evita criar ocorrências duplicadas localmente (checa texto)
                function precisaCriarOcorrencia(entry) {
                    if (!entry) return true;
                    if (!entry.ocorrencias) return true;
                    return !/atraso/i.test(String(entry.ocorrencias));
                }

                async function criarOcorrenciaBackend(payload) {
                    try {
                        const r = await fetch("/ocorrencias", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`
                            },
                            body: JSON.stringify(payload)
                        });
                        if (!r.ok) {
                            console.error("Falha ao criar ocorrência:", await r.text());
                            return null;
                        }
                        return await r.json();
                    } catch (e) {
                        console.error("Erro ao criar ocorrência:", e);
                        return null;
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
                    const EntEsperada = (data.horario_entrada || "08:00:00").substring(0,8);
                    const SaiEsperada = (data.horario_saida || "18:00:00").substring(0,8);

                    for(let i = 0; i < 7; i++){
                        const dia = new Date(dataDomingo);
                        dia.setDate(dataDomingo.getDate() + i);
                        const iso = formatarDataISO(dia);
                        const label = diasDaSemana[i];

                        const entry = map[iso] ?? {};
                        const entrada = entry.entrada ?? '--:--:--';
                        const saida = entry.saida ?? '--:--:--';
                        const modalidade = entry && entry.modalidade ? escapeHtml(entry.modalidade) : "PRESENCIAL";
                        
                        const diffEntradaMin = minutosDiff(entrada.substring(0,8), EntEsperada); // positivo = atrasado
                        const diffSaidaMin   = minutosDiff(saida.substring(0,8), SaiEsperada);
                        const jornadaRealMin = entrada !== '--:--:--' && saida !== '--:--:--' ? jornadaEmMinutos(entrada.substring(0,8), saida.substring(0,8)) : null;
                        const jornadaEsperadaMin = jornadaEmMinutos(EntEsperada, SaiEsperada);

                        let classeEntrada = "";
                        if (entrada === '--:--:--') {
                            classeEntrada = "";
                        } else if (diffEntradaMin == null) {
                            classeEntrada = "";
                        } else if (diffEntradaMin > 5) {
                            classeEntrada = "text-red-500";
                        } else if (diffEntradaMin >= -3 && diffEntradaMin <= 5) {
                            classeEntrada = "text-black";
                        } else if (diffEntradaMin < -3) {
                            classeEntrada = "text-green-500";
                        }

                        let classeSaida = "";
                        if (saida === '--:--:--') {
                            classeSaida = "";
                        } else if (diffSaidaMin == null) {
                            classeSaida = "";
                        } else if (diffSaidaMin < -3) {
                            classeSaida = "text-red-500";
                        } else if (diffSaidaMin >= -3 && diffSaidaMin <= 5) {
                            classeSaida = "text-black";
                        } else if (diffSaidaMin > 5) {
                            if (jornadaRealMin - jornadaEsperadaMin >= 5) {
                                classeSaida = "text-green-500";
                            } else {
                                classeSaida = "text-black";
                            }
                        }

                        if (diffEntradaMin != null && diffEntradaMin > 5 && precisaCriarOcorrencia(entry)) {
                            const payload = {
                                id_funcionario: usuario_id,
                                tipo_ocorrencia: "Atraso",
                                motivo: "Atraso no ponto",
                                data: iso, // YYYY-MM-DD
                                detalhes: `Entrada esperada ${EntEsperada} — registrada ${entrada.substring(0,8)}`,
                                anexos: null,
                                gravidade: "Média",
                                status: "Em análise"
                            };
                            criarOcorrenciaBackend(payload).then(res => {
                                if (res) {
                                    console.info("Ocorrência criada:", res);
                                }
                            });
                        }

                        let ocorrenciasHtml = "<span class='text-green-500'>Sem ocorrências</span>";
                        if (entry.ocorrencias && Array.isArray(entry.ocorrencias) && entry.ocorrencias.length > 0) {
                            const lista = entry.ocorrencias.map(o => escapeHtml(o.tipo_ocorrencia)).join(", ");
                            if (/atraso/i.test(lista)) {
                                ocorrenciasHtml = `<span class='text-red-500'>${lista}</span>`;
                            } else {
                                ocorrenciasHtml = `<span class='text-black'>${lista}</span>`;
                            }
                        }

                        html += `
                            <div class="flex items-center justify-between bg-white shadow-lg px-4 py-2 rounded-lg w-full">
                                <div class="grid grid-cols-6 gap-4 w-full text-sm">
                                    <div><p><span class="font-bold ${i===6 ? 'text-red-500':''}">${label}</span></p></div>
                                    <div class="text-center"><p class="font-bold">Data</p><p>${formatarDataBR(dia)}</p></div>
                                    <div class="text-center"><p class="font-bold">Entrada</p><p class="${classeEntrada}">${entrada}</p></div>
                                    <div class="text-center"><p class="font-bold">Saída</p><p class="${classeSaida}">${saida}</p></div>
                                    <div class="text-center"><p class="font-bold">Modalidade</p><p>${modalidade}</p></div>
                                    <div class="text-center"><p class="font-bold">Ocorrências</p><p>${ocorrenciasHtml}</p></div>
                                </div>
                            </div>
                        `;
                    }

                    diasContainer.innerHTML = html;
                }

                atualizarPonto();

                document.getElementById("btnRegistrarPonto").addEventListener("click", async () => {
                    const token = localStorage.getItem("token");

                    const resposta = await fetch("https://omnirh.onrender.com/registro", {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    });

                    const dados = await resposta.json();
                    alert(dados.mensagem || dados.erro || "Erro inesperado");
                    atualizarPonto();
                });

            })();
        })

        .catch(err => {
            console.error('Erro ao obter /me', err);
        });
    }
});


