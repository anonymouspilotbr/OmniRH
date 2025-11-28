(async () => {
  // ELEMENTOS
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

  // ------- API HELPERS -------
  async function apiGet(path) {
    const r = await fetch(path);
    return r.ok ? await r.json() : null;
  }

  async function apiPost(path, body) {
    const r = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    return await r.json();
  }

  async function apiPut(path, body) {
    const r = await fetch(path, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    return await r.json();
  }

  async function apiDelete(path) {
    const r = await fetch(path, { method: "DELETE" });
    return await r.json();
  }

  // ------- CARREGAR LISTA -------
  async function loadEmpresas() {
    const data = await apiGet('/empresa/listar');
    return Array.isArray(data) ? data : [];
  }

  function updateEmptyState(has) {
    emptyState.classList.toggle("hidden", has);
  }

  // ------- RENDER LISTA -------
  async function renderList(filter = "") {
    const empresas = await loadEmpresas();

    const filtered = empresas.filter(emp =>
      (emp.nome || "").toLowerCase().includes(filter.toLowerCase()) ||
      (emp.cnpj || "").includes(filter)
    );

    empresasListEl.innerHTML = "";

    filtered.forEach(emp => {
      const card = document.createElement("div");
      card.className =
        "flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:shadow transition";

      card.innerHTML = `
        <div class="flex items-center gap-3">
            <div class="w-14 h-14 rounded-lg overflow-hidden bg-gray-100">
                <img src="${emp.logo || "/img/default-company.png"}" 
                     class="w-full h-full object-cover">
            </div>
            <div>
                <div class="font-semibold">${emp.nome}</div>
                <div class="text-sm text-gray-600">${emp.setor || "—"} • <span class="text-indigo-600">${emp.status}</span></div>
                <div class="text-xs text-gray-500">${emp.cnpj || ""}</div>
            </div>
        </div>

        <div class="flex gap-2">
            <button data-id="${emp.id}" class="previewBtn px-3 py-1 bg-indigo-100 text-indigo-700 rounded">Visualizar</button>
            <button data-id="${emp.id}" class="editBtn px-3 py-1 bg-yellow-100 text-yellow-700 rounded">Editar</button>
            <button data-id="${emp.id}" class="delBtn px-3 py-1 bg-red-100 text-red-700 rounded">Excluir</button>
        </div>
      `;

      empresasListEl.appendChild(card);
    });

    totalEmpresasEl.textContent = empresas.length;
    updateEmptyState(empresas.length > 0);

    attachListActions();
  }

  // ------- ACTIONS: visualizar, editar, excluir -------
  function attachListActions() {
    document.querySelectorAll(".previewBtn").forEach(btn => {
      btn.onclick = async () => {
        const emp = await apiGet(`/empresa/${btn.dataset.id}`);
        if (emp) previewEmpresa(emp);
      };
    });

    document.querySelectorAll(".editBtn").forEach(btn => {
      btn.onclick = async () => {
        const emp = await apiGet(`/empresa/${btn.dataset.id}`);
        if (!emp) return alert("Empresa não encontrada");

        // preencher formulário
        document.getElementById("nome").value = emp.nome || "";
        document.getElementById("cnpj").value = emp.cnpj || "";
        document.getElementById("setor").value = emp.setor || "";
        document.getElementById("endereco").value = emp.endereco || "";
        document.getElementById("email").value = emp.email || "";
        document.getElementById("telefone").value = emp.telefone || "";
        document.getElementById("funcionarios").value = emp.funcionarios || 0;
        document.getElementById("status").value = emp.status || "Ativa";
        document.getElementById("logo").value = emp.logo || "";

        editIndexInput.value = emp.id;

        openForm({ mode: "edit" });
      };
    });

    document.querySelectorAll(".delBtn").forEach(btn => {
      btn.onclick = async () => {
        if (!confirm("Excluir empresa?")) return;
        await apiDelete(`/empresa/${btn.dataset.id}`);
        await renderList(searchInput.value);
      };
    });
  }

  // ------- PREVIEW -------
  function previewEmpresa(emp) {
    previewContent.innerHTML = `
      <div class="col-span-1 flex justify-center">
        <img src="${emp.logo || "/img/default-company.png"}" class="w-40 h-40 object-cover rounded">
      </div>
      <div class="col-span-2">
        <h4 class="text-xl font-bold">${emp.nome}</h4>
        <p class="text-sm text-gray-600">${emp.setor || "—"} • <span class="text-indigo-600">${emp.status}</span></p>
        <p class="mt-2"><strong>CNPJ:</strong> ${emp.cnpj || "—"}</p>
        <p><strong>Endereço:</strong> ${emp.endereco || "—"}</p>
        <p><strong>Contato:</strong> ${emp.email || "—"} • ${emp.telefone || "—"}</p>
        <p class="mt-2 text-sm text-gray-600"><strong>Funcionários:</strong> ${emp.funcionarios || 0}</p>
      </div>
    `;
    previewModal.classList.remove("hidden");
  }

  document.getElementById("closePreview").onclick = () =>
    previewModal.classList.add("hidden");

  previewModal.onclick = e => {
    if (e.target === previewModal) previewModal.classList.add("hidden");
  };

  // ------- FORM -------
  function openForm({ mode = "add" } = {}) {
    form.reset();
    formSection.classList.remove("hidden");

    if (mode === "edit") {
      submitBtn.textContent = "Salvar";
      formTitle.textContent = "Editar Empresa";
    } else {
      submitBtn.textContent = "Adicionar Empresa";
      formTitle.textContent = "Cadastrar Nova Empresa";
      editIndexInput.value = "";
    }
  }

  openFormBtn.onclick = () => openForm({ mode: "add" });
  cancelBtn.onclick = () => formSection.classList.add("hidden");
  document.getElementById("limparBtn").onclick = () => form.reset();

  // ------- SUBMIT -------
  form.addEventListener("submit", async e => {
    e.preventDefault();

    const data = {
      nome: document.getElementById("nome").value.trim(),
      cnpj: document.getElementById("cnpj").value.trim(),
      setor: document.getElementById("setor").value.trim(),
      endereco: document.getElementById("endereco").value.trim(),
      email: document.getElementById("email").value.trim(),
      telefone: document.getElementById("telefone").value.trim(),
      funcionarios: Number(document.getElementById("funcionarios").value) || 0,
      status: document.getElementById("status").value,
      logo: document.getElementById("logo").value.trim()
    };

    const id = editIndexInput.value;

    if (id) {
      await apiPut(`/empresa/${id}`, data);
    } else {
      await apiPost("/empresa/cadastrar", data);
    }

    form.reset();
    formSection.classList.add("hidden");
    await renderList(searchInput.value);
  });

  // ------- BUSCA -------
  searchInput.addEventListener("input", () =>
    renderList(searchInput.value)
  );

  // ------- EXPORTAR JSON -------
  document.getElementById("exportBtn").onclick = async () => {
    const data = JSON.stringify(await loadEmpresas(), null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "empresas_omni.json";
    a.click();

    URL.revokeObjectURL(url);
  };

  // ------- INICIAL -------
  await renderList();
})();