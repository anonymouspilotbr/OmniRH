(async () => {

  // elementos
  const form = document.getElementById('empresaForm');
  const empresasListEl = document.getElementById('empresasList');
  const totalEmpresasEl = document.getElementById('totalEmpresas');
  const previewModal = document.getElementById('previewModal');
  const previewContent = document.getElementById('previewContent');
  const editIndexInput = document.getElementById('editIndex');
  const searchInput = document.getElementById('search');
  const formSection = document.getElementById('formSection');
  const openFormBtn = document.getElementById('openFormBtn');
  const submitBtn = document.getElementById('submitBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const formTitle = document.getElementById('formTitle');
  const emptyState = document.getElementById('emptyState');

  // helpers API
  async function apiGet(path) {
    const r = await fetch(path);
    return r.ok ? await r.json() : null;
  }

  async function apiPost(path, body) {
    const r = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    return await r.json();
  }

  async function apiPut(path, body) {
    const r = await fetch(path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    return await r.json();
  }

  async function apiDelete(path) {
    const r = await fetch(path, { method: 'DELETE' });
    return await r.json();
  }

  // carregar lista
  async function loadEmpresas() {
    const data = await apiGet('/empresa/listar');
    return Array.isArray(data) ? data : [];
  }

  function updateEmptyState(has) {
    emptyState.classList.toggle('hidden', has);
  }

  async function renderList(filter = '') {
    const empresas = await loadEmpresas();
    const filtered = empresas.filter(e =>
      (e.nome || '').toLowerCase().includes(filter.toLowerCase()) ||
      (e.cnpj || '').includes(filter)
    );

    empresasListEl.innerHTML = '';

    filtered.forEach(emp => {
      const card = document.createElement('div');
      card.className =
        'flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:shadow transition';

      card.innerHTML = `
        <div class="flex items-center gap-3">
            <div class="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                <img src="${emp.logo || 'https://via.placeholder.com/56'}"
                     class="w-full h-full object-cover" />
            </div>
            <div>
                <div class="font-semibold">${emp.nome}</div>
                <div class="text-sm muted">${emp.setor || '—'} • <span class="accent-text">${emp.status}</span></div>
                <div class="text-xs muted">${emp.cnpj || ''}</div>
            </div>
        </div>
        <div class="flex gap-2">
            <button data-id="${emp.id}" class="previewBtn px-3 py-1 bg-indigo-50 text-indigo-700 rounded-md">Visualizar</button>
            <button data-id="${emp.id}" class="editBtn px-3 py-1 bg-yellow-50 text-yellow-700 rounded-md">Editar</button>
            <button data-id="${emp.id}" class="delBtn px-3 py-1 bg-red-50 text-red-700 rounded-md">Excluir</button>
        </div>
      `;

      empresasListEl.appendChild(card);
    });

    totalEmpresasEl.textContent = (await loadEmpresas()).length;
    updateEmptyState(filtered.length > 0);

    attachListActions();
  }

  function attachListActions() {
    document.querySelectorAll('.previewBtn').forEach(btn => {
      btn.onclick = async () => {
        const emp = await apiGet(`/empresa/${btn.dataset.id}`);
        if (emp) previewEmpresa(emp);
      };
    });

    document.querySelectorAll('.editBtn').forEach(btn => {
      btn.onclick = async () => {
        const emp = await apiGet(`/empresa/${btn.dataset.id}`);
        if (!emp) return alert("Empresa não encontrada");

        // preencher formulário
        document.getElementById('nome').value = emp.nome || '';
        document.getElementById('cnpj').value = emp.cnpj || '';
        document.getElementById('setor').value = emp.setor || '';
        document.getElementById('endereco').value = emp.endereco || '';
        document.getElementById('email').value = emp.email || '';
        document.getElementById('telefone').value = emp.telefone || '';
        document.getElementById('funcionarios').value = emp.funcionarios || 0;
        document.getElementById('status').value = emp.status || 'Ativa';
        document.getElementById('logo').value = emp.logo || '';

        editIndexInput.value = emp.id;
        openForm({ mode: 'edit' });
      };
    });

    document.querySelectorAll('.delBtn').forEach(btn => {
      btn.onclick = async () => {
        if (!confirm("Excluir empresa?")) return;
        await apiDelete(`/empresa/${btn.dataset.id}`);
        await renderList(searchInput.value);
      };
    });
  }

  // MODAL
  function previewEmpresa(emp) {
    previewContent.innerHTML = `
      <div class="col-span-1 flex justify-center">
          <img src="${emp.logo || 'https://via.placeholder.com/160'}"
               class="w-40 h-40 object-cover rounded" />
      </div>
      <div class="col-span-2">
          <h4 class="text-xl font-bold">${emp.nome}</h4>
          <p class="text-sm muted">${emp.setor || ''} • <span class="accent-text">${emp.status}</span></p>
          <p class="mt-2"><strong>CNPJ:</strong> ${emp.cnpj}</p>
          <p><strong>Endereço:</strong> ${emp.endereco || '—'}</p>
          <p><strong>Contato:</strong> ${emp.email || '—'} • ${emp.telefone || '—'}</p>
          <p class="mt-2 text-sm muted"><strong>Funcionários:</strong> ${emp.funcionarios || 0}</p>
      </div>
    `;

    previewModal.classList.remove('hidden');
  }

  document.getElementById('closePreview').onclick = () =>
    previewModal.classList.add('hidden');

  previewModal.onclick = e => {
    if (e.target === previewModal) previewModal.classList.add('hidden');
  };

  // FORM
  function openForm({ mode }) {
    form.reset();
    formSection.classList.remove('hidden');

    if (mode === 'edit') {
      formTitle.textContent = "Editar empresa";
      submitBtn.textContent = "Salvar";
    } else {
      formTitle.textContent = "Cadastrar nova empresa";
      submitBtn.textContent = "Adicionar Empresa";
      editIndexInput.value = '';
    }
  }

  openFormBtn.onclick = () => openForm({ mode: 'add' });

  cancelBtn.onclick = () => {
    formSection.classList.add('hidden');
    editIndexInput.value = '';
  };

  document.getElementById('limparBtn').onclick = () => form.reset();

  // SUBMIT
  form.addEventListener('submit', async ev => {
    ev.preventDefault();

    const cnpj = document.getElementById('cnpj').value.trim().replace(/\D/g, "");

    const data = {
      nome: document.getElementById('nome').value.trim(),
      cnpj: cnpj,
      setor: document.getElementById('setor').value.trim(),
      endereco: document.getElementById('endereco').value.trim(),
      email: document.getElementById('email').value.trim(),
      telefone: document.getElementById('telefone').value.trim(),
      funcionarios: Number(document.getElementById('funcionarios').value) || 0,
      status: document.getElementById('status').value,
      logo: document.getElementById('logo').value.trim()
    };

    let result;

    if (editIndexInput.value) {
      result = await apiPut(`/empresa/${editIndexInput.value}`, data);
    } else {
      result = await apiPost('/empresa/cadastrar', data);
    }

    if (!result.sucesso) {
      alert(`Erro: ${result.erro}`);
      return;
    }

    form.reset();
    formSection.classList.add('hidden');
    await renderList(searchInput.value);
  });

  // search
  searchInput.addEventListener('input', () =>
    renderList(searchInput.value)
  );

  // export
  document.getElementById('exportBtn').onclick = async () => {
    const data = JSON.stringify(await loadEmpresas(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = "empresas_omni.json";
    a.click();

    URL.revokeObjectURL(url);
  };

  await renderList();

})();