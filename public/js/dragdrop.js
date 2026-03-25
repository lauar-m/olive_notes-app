// Drag and Drop entre colunas usando a API nativa do HTML5.
// Sem bibliotecas externas — didático e leve.
//
// Fluxo:
//  1. dragstart → marca o card sendo arrastado
//  2. dragover  → destaca a coluna alvo (visual feedback)
//  3. dragleave → remove destaque ao sair da coluna
//  4. drop      → move o card e salva a nova categoria na API
// ─────────────────────────────────────────────────────────────

// ID da tarefa sendo arrastada no momento
let draggingTaskId = null;

// ── INICIALIZAÇÃO ─────────────────────────────────────────────

/**
 * Inicializa drag and drop nos cards de uma zona específica.
 * Chamado pelo tasks.js após cada renderização.
 * @param {HTMLElement} zone - Elemento container das colunas
 */
window.initDragOnCards = (zone) => {
  const cards = zone.querySelectorAll('.task-card[draggable="true"]');

  cards.forEach((card) => {
    card.addEventListener("dragstart", handleDragStart);
    card.addEventListener("dragend", handleDragEnd);
  });
};

/**
 * Inicializa os listeners das zonas de drop (colunas).
 * Chamado UMA VEZ na inicialização do app.
 */
window.initDropZones = () => {
  const zones = document.querySelectorAll(".tasks-drop-zone");

  zones.forEach((zone) => {
    zone.addEventListener("dragover", handleDragOver);
    zone.addEventListener("dragleave", handleDragLeave);
    zone.addEventListener("drop", handleDrop);
  });

  // Também inicializa no elemento .column para highlight visual maior
  const columns = document.querySelectorAll(".column");
  columns.forEach((col) => {
    col.addEventListener("dragover", (e) => {
      e.preventDefault();
      col.classList.add("drag-over");
    });
    col.addEventListener("dragleave", (e) => {
      // Só remove se realmente saiu da coluna (não apenas de um filho)
      if (!col.contains(e.relatedTarget)) col.classList.remove("drag-over");
    });
    col.addEventListener("drop", () => col.classList.remove("drag-over"));
  });
};

// ── HANDLERS DE EVENTOS ───────────────────────────────────────

/**
 * Início do arraste: marca o card e salva o ID.
 * @param {DragEvent} event
 */
window.handleDragStart = (event) => {
  const card = event.currentTarget;

  // Salva o ID da tarefa sendo arrastada
  draggingTaskId = card.dataset.id;

  // dataTransfer: API nativa para passar dados entre elementos
  event.dataTransfer.setData("text/plain", draggingTaskId);
  event.dataTransfer.effectAllowed = "move";

  // Classe visual de "dragging" aplicada com pequeno delay
  // (o delay é necessário para o snapshot do drag já ter sido tirado)
  setTimeout(() => card.classList.add("dragging"), 10);
};

/**
 * Fim do arraste: remove classes visuais.
 * @param {DragEvent} event
 */
window.handleDragEnd = (event) => {
  event.currentTarget.classList.remove("dragging");
  draggingTaskId = null;

  // Limpa destaques de todas as colunas
  document.querySelectorAll(".column").forEach((col) => {
    col.classList.remove("drag-over");
  });
};

/**
 * Card está sobre a zona de drop: destaca e permite o drop.
 * @param {DragEvent} event
 */
window.handleDragOver = (event) => {
  // OBRIGATÓRIO: preventDefault() habilita o evento drop
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
};

/**
 * Card saiu da zona de drop sem soltar: remove destaque.
 * @param {DragEvent} event
 */
window.handleDragLeave = (event) => {
  // Verifica se realmente saiu (não apenas foi para um filho)
  const zone = event.currentTarget;
  if (!zone.contains(event.relatedTarget)) {
    zone.closest(".column")?.classList.remove("drag-over");
  }
};

/**
 * Card solto na zona: move a tarefa para a nova categoria.
 * @param {DragEvent} event
 */
window.handleDrop = async (event) => {
  event.preventDefault();

  const zone = event.currentTarget;
  const newCategory = zone.dataset.category; // 'day' | 'week' | 'month'
  const taskId = event.dataTransfer.getData("text/plain");

  // Remove destaque da coluna
  zone.closest(".column")?.classList.remove("drag-over");

  // Não faz nada se o ID não foi capturado
  if (!taskId || !newCategory) return;

  // Encontra a tarefa no store local
  const task = taskStore.find((t) => t._id === taskId);

  // Não faz nada se a categoria não mudou
  if (!task || task.category === newCategory) return;

  try {
    // Atualiza localmente ANTES da API para resposta instantânea (optimistic update)
    task.category = newCategory;
    renderAllColumns();

    // Persiste a mudança no banco via API
    await api.put(`/tasks/${taskId}`, { category: newCategory });

    const labels = { day: "Hoje", week: "Semana", month: "Mês" };
    showToast(`Movida para ${labels[newCategory]}!`, "success");
  } catch (err) {
    // Reverte se a API falhou (rollback)
    showToast("Erro ao mover tarefa. Tente novamente.", "error");
    await loadTasks(); // recarrega o estado real do banco
  }
};
