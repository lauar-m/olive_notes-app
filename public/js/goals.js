// Handler para Enter no input de nova meta
function handleGoalInputKeydown(event) {
  if (event.key === "Enter") {
    handleAddGoal();
  }
}
window.handleGoalInputKeydown = handleGoalInputKeydown;
// ─────────────────────────────────────────────────────────────
// Módulo de metas (sidebar).
// Responsabilidades:
//  - Buscar e armazenar metas da API
//  - Renderizar metas na sidebar separadas por tipo
//  - Alternar abas "Anuais" / "De Vida"
//  - CRUD de metas com feedback visual
// ─────────────────────────────────────────────────────────────

// ── ESTADO LOCAL ──────────────────────────────────────────────

window.goalStore = []; // todas as metas em memória
window.activeGoalTab = "annual"; // aba ativa: 'annual' | 'life'

// ── FETCH ─────────────────────────────────────────────────────

/**
 * Busca todas as metas do usuário e re-renderiza a sidebar.
 */
const loadGoals = async () => {
  try {
    const data = await api.get("/goals");
    window.goalStore = data.data || [];
    renderGoals();
  } catch (err) {
    showToast("Erro ao carregar metas.", "error");
  }
};

// ── RENDERIZAÇÃO ──────────────────────────────────────────────

/**
 * Renderiza as metas da aba ativa na sidebar.
 */
const renderGoals = () => {
  // Re-renderiza a sidebar inteira (inclui GoalList)
  if (window.renderSidebar) window.renderSidebar();
};

/**
 * Gera o HTML de um item de meta na sidebar.
 * @param {object} goal
 * @returns {string}
 */
const renderGoalItem = (goal) => {
  const isDone = goal.status === "done";

  return `
    <div class="goal-item ${isDone ? "done" : ""}" data-id="${goal._id}">

      <!-- Checkbox circular -->
      <div
        class="goal-checkbox ${isDone ? "checked" : ""}"
        onclick="handleToggleGoal('${goal._id}', '${isDone ? "pending" : "done"}')"
        title="${isDone ? "Reabrir meta" : "Concluir meta"}"
        role="checkbox"
        aria-checked="${isDone}"
      ></div>

      <!-- Texto da meta -->
      <span class="goal-text">${escapeHTML(goal.title)}</span>

      <!-- Ações: editar e deletar -->
      <div class="goal-actions">
        <button
          class="goal-action-btn"
          onclick="handleEditGoal('${goal._id}')"
          title="Editar meta"
        >
          <i class="fa-solid fa-pen"></i>
        </button>
        <button
          class="goal-action-btn delete"
          onclick="handleDeleteGoal('${goal._id}')"
          title="Remover meta"
        >
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>

    </div>
  `;
};

// ── TROCA DE ABA ──────────────────────────────────────────────

/**
 * Alterna entre as abas de metas anuais e de vida.
 * @param {'annual'|'life'} tab
 */
const switchGoalTab = (tab) => {
  activeGoalTab = tab;

  // Atualiza botões de aba
  document.querySelectorAll(".sidebar-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.id === `goal-tab-${tab}`);
  });

  // Re-renderiza com a aba correta
  renderGoals();

  // Limpa o input ao trocar de aba
  const input = document.getElementById("new-goal-input");
  if (input) input.value = "";
};

// ── HANDLERS DE AÇÕES ─────────────────────────────────────────

/**
 * Adiciona nova meta.
 * Chamado pelo botão e pelo Enter no input.
 */
const handleAddGoal = async () => {
  const input = document.getElementById("new-goal-input");
  const title = input?.value.trim();

  if (!title) {
    input?.focus();
    showToast("Digite o título da meta.", "error");
    return;
  }

  try {
    await api.post("/goals", { title, type: activeGoalTab });

    input.value = ""; // limpa o campo
    await loadGoals();
    showToast("Meta adicionada!", "success");
  } catch (err) {
    showToast(err.message || "Erro ao criar meta.", "error");
  }
};

/**
 * Edita uma meta existente (usa prompt simples — sem modal extra).
 * @param {string} goalId
 */
let editGoalModal = null;
let goalIdToEdit = null;

const handleEditGoal = (goalId) => {
  const goal = goalStore.find((g) => g._id === goalId);
  if (!goal) return;

  goalIdToEdit = goalId;

  // Cria campo de input customizado
  const input = document.createElement("input");
  input.type = "text";
  input.className = "form-control";
  input.value = goal.title;
  input.maxLength = 200;
  input.style.width = "100%";
  input.style.marginTop = "12px";
  input.placeholder = "Novo título da meta";

  if (!editGoalModal) {
    editGoalModal = createModal({
      id: "edit-goal-modal",
      title: "Editar meta",
      body: input,
      confirmText: "Salvar",
      cancelText: "Cancelar",
      onConfirm: null, // será definido abaixo
      onCancel: () => {
        goalIdToEdit = null;
      },
    });
  } else {
    // Atualiza o input e título se modal já existe
    editGoalModal.element.querySelector(".modal-title").textContent =
      "Editar meta";
    const body = editGoalModal.element.querySelector(".modal-body");
    body.innerHTML = "";
    body.appendChild(input);
  }
  // Sempre atualiza o evento de confirmação para usar o input correto
  editGoalModal.element.querySelector(".btn-modal-save").onclick = async () => {
    const newTitle = input.value.trim();
    if (!newTitle) {
      showToast("O título não pode ser vazio.", "error");
      return;
    }
    const goal = goalStore.find((g) => g._id === goalIdToEdit);
    if (!goal || newTitle === goal.title) return;
    try {
      await api.put(`/goals/${goalIdToEdit}`, { title: newTitle });
      await loadGoals();
      showToast("Meta atualizada!", "success");
    } catch (err) {
      showToast("Erro ao editar meta.", "error");
    }
    goalIdToEdit = null;
    editGoalModal.hide();
  };
  setTimeout(() => input.focus(), 100);
  editGoalModal.show();
};

/**
 * Alterna o status de uma meta (pending ↔ done).
 * @param {string} goalId
 * @param {'pending'|'done'} newStatus
 */
const handleToggleGoal = async (goalId, newStatus) => {
  try {
    await api.put(`/goals/${goalId}`, { status: newStatus });

    // Atualiza localmente sem re-fetch
    const goal = goalStore.find((g) => g._id === goalId);
    if (goal) goal.status = newStatus;

    renderGoals();
    showToast(
      newStatus === "done" ? "⭐ Meta concluída!" : "Meta reaberta.",
      "success",
    );
    if (newStatus === "done") {
      launchConfetti();
    }
  } catch (err) {
    showToast("Erro ao atualizar meta.", "error");
  }
};

/**
 * Remove uma meta após confirmação.
 * @param {string} goalId
 */
let confirmDeleteGoalModal = null;
let goalIdToDelete = null;

const handleDeleteGoal = (goalId) => {
  goalIdToDelete = goalId;
  if (!confirmDeleteGoalModal) {
    confirmDeleteGoalModal = createModal({
      id: "confirm-delete-goal-modal",
      title: "Remover meta",
      body: "<p>Tem certeza que deseja remover esta meta?</p>",
      confirmText: "Remover",
      cancelText: "Cancelar",
      onConfirm: async () => {
        if (!goalIdToDelete) return;
        try {
          await api.delete(`/goals/${goalIdToDelete}`);
          goalStore = goalStore.filter((g) => g._id !== goalIdToDelete);
          renderGoals();
          showToast("Meta removida.", "default");
        } catch (err) {
          showToast("Erro ao remover meta.", "error");
        }
        goalIdToDelete = null;
      },
      onCancel: () => {
        goalIdToDelete = null;
      },
    });
  }
  confirmDeleteGoalModal.show();
};

// Função para lançar confetes coloridos
function launchConfetti() {
  // Cria um container para os confetes
  let confettiContainer = document.getElementById("confetti-container");
  if (!confettiContainer) {
    confettiContainer = document.createElement("div");
    confettiContainer.id = "confetti-container";
    confettiContainer.style.position = "fixed";
    confettiContainer.style.top = "0";
    confettiContainer.style.left = "0";
    confettiContainer.style.width = "100vw";
    confettiContainer.style.height = "0";
    confettiContainer.style.pointerEvents = "none";
    confettiContainer.style.zIndex = "9999";
    document.body.appendChild(confettiContainer);
  }
  // Gera confetes
  for (let i = 0; i < 60; i++) {
    const confetti = document.createElement("div");
    const size = Math.random() * 8 + 8;
    const colors = [
      "#F5E6A3",
      "#C8DDA0",
      "#F5C9A0",
      "#F5C0C0",
      "#B8D4E8",
      "#D4C0E8",
      "#75070c",
      "#4f6815",
      "#ffedab",
    ];
    confetti.style.position = "absolute";
    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.top = "-20px";
    confetti.style.width = size + "px";
    confetti.style.height = size * 0.6 + "px";
    confetti.style.background =
      colors[Math.floor(Math.random() * colors.length)];
    confetti.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    confetti.style.opacity = 0.85;
    confetti.style.transition =
      "top 1.2s cubic-bezier(.4,1.2,.6,1), opacity 0.3s";
    confettiContainer.appendChild(confetti);
    setTimeout(() => {
      confetti.style.top = Math.random() * 60 + 40 + "vh";
      confetti.style.opacity = 1;
    }, 10);
    setTimeout(
      () => {
        confetti.style.opacity = 0;
        confetti.remove();
      },
      1600 + Math.random() * 400,
    );
  }
}
