let taskStore = []; // todas as tarefas do usuário
let currentFilter = "all"; // filtro ativo: 'all' | 'pending' | 'done'
// Uma tarefa é arquivada se:
// - status === 'done'
// - NÃO pertence ao dia, semana ou mês atual
function isArchived(task) {
  if (!task || task.status !== "done") return false;
  const now = new Date();
  const completed = task.completedAt ? new Date(task.completedAt) : null;
  if (!completed) return false;
  // Funções auxiliares
  const isToday =
    completed.getDate() === now.getDate() &&
    completed.getMonth() === now.getMonth() &&
    completed.getFullYear() === now.getFullYear();
  const getWeek = (d) => {
    const date = new Date(d.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 4 - (date.getDay() || 7));
    const yearStart = new Date(date.getFullYear(), 0, 1);
    return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  };
  const isSameWeek =
    completed.getFullYear() === now.getFullYear() &&
    getWeek(completed) === getWeek(now);
  const isSameMonth =
    completed.getFullYear() === now.getFullYear() &&
    completed.getMonth() === now.getMonth();

  if (task.category === "day") {
    return !isToday;
  }
  if (task.category === "week") {
    return !isSameWeek;
  }
  if (task.category === "month") {
    return !isSameMonth;
  }
  return false;
}

// Estado do modal de criação/edição
const modalState = {
  isEditing: false, // true quando editando uma tarefa existente
  editingId: null, // _id da tarefa sendo editada
  selectedCategory: "day", // categoria selecionada no modal
  selectedColor: CONFIG.DEFAULT_COLOR, // cor selecionada
};

// Modal de confirmação de remoção (instância única)
let confirmDeleteModal = null;
let taskIdToDelete = null;

function openConfirmDeleteModal(taskId) {
  taskIdToDelete = taskId;
  if (!confirmDeleteModal) {
    confirmDeleteModal = createModal({
      id: "confirm-delete-modal",
      title: "Remover tarefa",
      body: "<p>Tem certeza que deseja remover esta tarefa?</p>",
      confirmText: "Remover",
      cancelText: "Cancelar",
      onConfirm: async () => {
        if (!taskIdToDelete) return;
        try {
          await api.delete(`/tasks/${taskIdToDelete}`);
          taskStore = taskStore.filter((t) => t._id !== taskIdToDelete);
          renderAllColumns();
          showToast("Tarefa removida.", "default");
        } catch (err) {
          showToast("Erro ao remover tarefa.", "error");
        }
        taskIdToDelete = null;
      },
      onCancel: () => {
        taskIdToDelete = null;
      },
    });
  }
  confirmDeleteModal.show();
}

window.openConfirmDeleteModal = openConfirmDeleteModal;

// ── FETCH DE TAREFAS ──────────────────────────────────────────

/**
 * Busca todas as tarefas do usuário na API e re-renderiza.
 * Chamado na inicialização e após toda operação de escrita.
 */
const loadTasks = async () => {
  try {
    const data = await api.get("/tasks");
    taskStore = data.data || [];
    renderAllColumns();
  } catch (err) {
    showToast("Erro ao carregar tarefas.", "error");
  }
};

window.loadTasks = loadTasks;

// ── RENDERIZAÇÃO ──────────────────────────────────────────────

const renderAllColumns = () => {
  const categories = [
    { key: "day", title: "Hoje", subtitle: "Foco do dia" },
    { key: "week", title: "Semana", subtitle: "Esta semana" },
    { key: "month", title: "Mês", subtitle: "Este mês" },
  ];

  // Filtragem principal
  let filtered = [];
  if (currentFilter === "all") {
    // Todas: não mostra arquivadas
    filtered = taskStore.filter((t) => !isArchived(t));
  } else if (currentFilter === "archived") {
    filtered = taskStore.filter(isArchived);
  } else {
    // pending/done: só não mostra arquivadas
    filtered = taskStore.filter(
      (t) => t.status === currentFilter && !isArchived(t),
    );
  }

  // Contadores por categoria (sempre do total, sem filtro de status)
  const counts = { day: 0, week: 0, month: 0 };
  taskStore.forEach((t) => {
    if (counts[t.category] !== undefined && !isArchived(t))
      counts[t.category]++;
  });
  updateCounters(counts);

  const wrapper = document.querySelector(".columns-wrapper");
  if (!wrapper) return;
  wrapper.innerHTML = "";

  if (currentFilter === "archived") {
    // Renderiza só coluna arquivadas
    const col = window.createTaskColumn({
      category: "archived",
      title: "Arquivadas",
      subtitle: "Tarefas concluídas e antigas",
      counter: filtered.length,
      tasks: filtered,
      onAdd: null,
      onToggle: handleToggleTask,
      onEdit: openTaskModal,
      onDelete: handleDeleteTask,
      formatDate,
      getEmptyColumnHTML,
      initDragOnCards,
    });
    wrapper.appendChild(col);
    return;
  }

  // Colunas principais
  categories.forEach(({ key, title, subtitle }) => {
    const tasks = filtered.filter((t) => t.category === key);
    const col = window.createTaskColumn({
      category: key,
      title,
      subtitle,
      counter: counts[key],
      tasks,
      onAdd: openTaskModal,
      onToggle: handleToggleTask,
      onEdit: openTaskModal,
      onDelete: handleDeleteTask,
      formatDate,
      getEmptyColumnHTML,
      initDragOnCards,
    });
    wrapper.appendChild(col);
  });
};

/**
 * Gera o HTML de um post-it individual.
 * @param {object} task - Objeto de tarefa do banco
 * @returns {string} HTML string
 */
const renderTaskCard = (task) => {
  return window.createTaskCard(task, {
    onToggle: handleToggleTask,
    onEdit: openTaskModal,
    onDelete: handleDeleteTask,
    formatDate,
  });
};

// ── MODAL DE CRIAÇÃO / EDIÇÃO ─────────────────────────────────

/**
 * Abre o modal para criar ou editar uma tarefa.
 * @param {'day'|'week'|'month'} category - Categoria pré-selecionada
 * @param {string|null} taskId            - ID da tarefa ao editar (null = criar)
 */
const openTaskModal = (category = "day", taskId = null) => {
  const overlay = document.getElementById("task-modal-overlay");
  const title = document.getElementById("modal-title");

  if (taskId) {
    // ── MODO EDIÇÃO ──
    const task = taskStore.find((t) => t._id === taskId);
    if (!task) return;

    modalState.isEditing = true;
    modalState.editingId = taskId;
    modalState.selectedCategory = task.category;
    modalState.selectedColor = task.color;

    title.textContent = "Editar Tarefa";
    document.getElementById("task-title").value = task.title;
    document.getElementById("task-description").value = task.description || "";
  } else {
    // ── MODO CRIAÇÃO ──
    modalState.isEditing = false;
    modalState.editingId = null;
    modalState.selectedCategory = category;
    modalState.selectedColor = CONFIG.DEFAULT_COLOR;

    title.textContent = "Nova Tarefa";
    document.getElementById("task-title").value = "";
    document.getElementById("task-description").value = "";
  }

  // Renderiza swatches de cor e botões de categoria com o estado correto
  renderColorSwatches(modalState.selectedColor);
  selectCategory(modalState.selectedCategory);

  // Exibe o modal
  overlay.classList.add("show");
  document.getElementById("task-title").focus();
};

/**
 * Fecha o modal e limpa o estado.
 */
const closeTaskModal = () => {
  document.getElementById("task-modal-overlay")?.classList.remove("show");
  // Resetar estado após o fechamento
  modalState.isEditing = false;
  modalState.editingId = null;
};

/**
 * Fecha o modal ao clicar no overlay (fora do card).
 * @param {MouseEvent} event
 */
const handleModalOverlayClick = (event) => {
  // Só fecha se clicou diretamente no overlay, não no conteúdo interno
  if (event.target.id === "task-modal-overlay") {
    closeTaskModal();
  }
};

// ── HANDLERS DE AÇÕES ─────────────────────────────────────────

/**
 * Salva a tarefa (cria ou edita).
 * Chamado pelo botão "Salvar" do modal.
 */
const handleSaveTask = async () => {
  const title = document.getElementById("task-title").value.trim();
  const description = document.getElementById("task-description").value.trim();

  if (!title) {
    showToast("O título é obrigatório.", "error");
    document.getElementById("task-title").focus();
    return;
  }

  const payload = {
    title,
    description,
    category: modalState.selectedCategory,
    color: modalState.selectedColor,
  };

  try {
    if (modalState.isEditing) {
      // Atualiza tarefa existente
      await api.put(`/tasks/${modalState.editingId}`, payload);
      showToast("Tarefa atualizada!", "success");
    } else {
      // Cria nova tarefa
      await api.post("/tasks", payload);
      showToast("Tarefa criada!", "success");
    }

    closeTaskModal();
    await loadTasks(); // Recarrega e re-renderiza
  } catch (err) {
    showToast(err.message || "Erro ao salvar tarefa.", "error");
  }
};

/**
 * Alterna o status de uma tarefa (pendente ↔ concluída).
 * @param {string} taskId
 * @param {'pending'|'done'} newStatus
 */
const handleToggleTask = async (taskId, newStatus) => {
  try {
    await api.put(`/tasks/${taskId}`, { status: newStatus });

    // Atualiza localmente sem re-fetch (mais rápido)
    const task = taskStore.find((t) => t._id === taskId);
    if (task) task.status = newStatus;

    renderAllColumns();
    showToast(
      newStatus === "done" ? "✓ Tarefa concluída!" : "Tarefa reaberta.",
      "success",
    );
  } catch (err) {
    showToast("Erro ao atualizar tarefa.", "error");
  }
};

/**
 * Remove uma tarefa após confirmação.
 * @param {string} taskId
 */
const handleDeleteTask = async (taskId) => {
  openConfirmDeleteModal(taskId);
};

window.handleDeleteTask = handleDeleteTask;

// ── FILTRO DE STATUS ──────────────────────────────────────────

/**
 * Aplica filtro de status nas colunas.
 * @param {'all'|'pending'|'done'} filter
 */
const applyFilter = (filter) => {
  currentFilter = filter;
  updateFilterUI(filter);
  renderAllColumns();
};

// ── UTILITÁRIOS ───────────────────────────────────────────────

/**
 * Escapa caracteres HTML para evitar XSS.
 * Essencial ao injetar dados do usuário no innerHTML.
 * @param {string} str
 * @returns {string}
 */
const escapeHTML = (str) => {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};
