// ─────────────────────────────────────────────────────────────
// Entry point do frontend — roda APÓS todos os outros scripts.
// Responsabilidades:
//  1. Verificar autenticação (redireciona se não logado)
//  2. Exibir nome do usuário no header
//  3. Exibir data atual
//  4. Carregar tarefas e metas da API
//  5. Inicializar drag and drop
//  6. Registrar atalhos de teclado
//  7. Esconder o loading overlay
// ─────────────────────────────────────────────────────────────

/**
 * Função principal de inicialização.
 * Executada quando o DOM estiver completamente carregado.
 */
const initApp = async () => {
  // 1. Proteção de rota — redireciona para login se não autenticado
  requireAuth();

  // 2. Renderiza o header dinamicamente usando o componente
  const user = getUser();
  const dateText = getCurrentDateText();
  const headerRoot = document.getElementById("app-header-root");
  if (headerRoot) {
    headerRoot.innerHTML = "";
    headerRoot.appendChild(
      createAppHeader({
        userName: user ? user.name.split(" ")[0] : "Usuário",
        dateText,
        currentFilter: window.currentFilter || "all",
        onOpenSidebar: openSidebar,
        onApplyFilter: applyFilter,
        onLogout: handleLogout,
      }),
    );
  }

  // 2b. Renderiza a sidebar dinamicamente usando o componente
  renderSidebar();

  // Expor para outros módulos re-renderizarem a sidebar
  window.renderSidebar = renderSidebar;

  function renderSidebar() {
    const sidebarRoot = document.getElementById("sidebar-root");
    if (!sidebarRoot) return;
    // Detecta se a sidebar estava aberta
    const wasOpen = document
      .getElementById("sidebar")
      ?.classList.contains("open");
    // Se já existe, remove
    sidebarRoot.innerHTML = "";
    // Se overlay não existe, cria
    let overlay = document.getElementById("sidebar-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "sidebar-overlay";
      overlay.id = "sidebar-overlay";
      overlay.onclick = closeSidebar;
      document.body.appendChild(overlay);
    }
    // Se overlay não está no topo, move para o topo do body
    if (overlay.parentNode !== document.body) {
      document.body.appendChild(overlay);
    }
    // Dados das metas
    const goalsAnnual = (window.goalStore || []).filter(
      (g) => g.type === "annual",
    );
    const goalsLife = (window.goalStore || []).filter((g) => g.type === "life");
    const sidebarEl = window.createSidebar({
      activeTab: window.activeGoalTab || "annual",
      onClose: closeSidebar,
      onSwitchTab: (tab) => {
        window.activeGoalTab = tab;
        renderSidebar();
        renderGoals();
      },
      onAddGoal: window.handleAddGoal,
      onGoalInputKeydown: window.handleGoalInputKeydown,
      goalsAnnual,
      goalsLife,
      renderGoalList: (goals) =>
        window.createGoalList(goals, {
          onToggle: window.handleToggleGoal,
          onEdit: window.handleEditGoal,
          onDelete: window.handleDeleteGoal,
        }),
    });
    if (wasOpen) sidebarEl.classList.add("open");
    sidebarRoot.appendChild(sidebarEl);
  }

  // 3. Inicializa as zonas de drop ANTES de carregar os cards
  // (os cards serão adicionados dinamicamente depois)
  initDropZones();

  // 4. Carrega tarefas e metas da API em paralelo
  await Promise.all([loadTasks(), loadGoals()]);

  // 5. Esconde o loading overlay após carregar os dados
  hideLoading();

  // 6. Registra atalhos de teclado globais
  registerKeyboardShortcuts();
};

// ── ATALHOS DE TECLADO ────────────────────────────────────────
/**
 * Atalhos globais para agilizar o uso do app.
 *
 * N → Nova tarefa (coluna "Hoje")
 * G → Abrir/fechar sidebar de metas
 * Esc → Fechar modal ou sidebar
 */
const registerKeyboardShortcuts = () => {
  document.addEventListener("keydown", (event) => {
    // Ignora atalhos quando o usuário está digitando em um input/textarea
    const activeTag = document.activeElement?.tagName;
    if (activeTag === "INPUT" || activeTag === "TEXTAREA") {
      // Exceção: Escape fecha modal mesmo digitando
      if (event.key === "Escape") {
        closeTaskModal();
        closeSidebar();
      }
      return;
    }

    switch (event.key) {
      case "n":
      case "N":
        openTaskModal("day");
        break;
      case "g":
      case "G":
        const sidebar = document.getElementById("sidebar");
        sidebar?.classList.contains("open") ? closeSidebar() : openSidebar();
        break;
      case "Escape":
        closeTaskModal();
        closeSidebar();
        break;
    }
  });
};

// Utilitário para obter a data formatada para o header
function getCurrentDateText() {
  const now = new Date();
  return now.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

// ── INICIALIZAÇÃO ─────────────────────────────────────────────

// Aguarda o DOM estar pronto antes de inicializar
// (todos os scripts já foram carregados na ordem correta pelo HTML)
document.addEventListener("DOMContentLoaded", initApp);
