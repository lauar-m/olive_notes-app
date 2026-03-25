/**
 * Exibe uma notificação toast flutuante.
 * @param {string} message  - Texto da notificação
 * @param {'default'|'success'|'error'} type
 * @param {number} duration - Duração em ms (padrão: 3000)
 */
const showToast = (message, type = "default", duration = 3000) => {
  const container = document.getElementById("toast-container");
  if (!container) return;

  // Ícone baseado no tipo
  const icons = {
    default: "fa-circle-info",
    success: "fa-circle-check",
    error: "fa-circle-exclamation",
  };

  const toast = window.createToast({
    message: `<i class="fa-solid ${icons[type] || icons.default}"></i> ${message}`,
    type,
    duration,
  });
  toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.default}"></i> ${message}`;
  container.appendChild(toast);
};

// ── LOADING OVERLAY ───────────────────────────────────────────

/**
 * Exibe o overlay de carregamento inicial.
 */
const showLoading = () => {
  document.getElementById("loading-overlay")?.classList.remove("hidden");
};

/**
 * Oculta o overlay de carregamento.
 */
const hideLoading = () => {
  const overlay = document.getElementById("loading-overlay");
  if (!overlay) return;
  overlay.classList.add("hidden");
  // Remove do DOM após a transição para não bloquear interações
  setTimeout(() => overlay.remove(), 500);
};

// ── FORMATAÇÃO DE DATA ────────────────────────────────────────

/**
 * Formata uma data ISO para exibição amigável em pt-BR.
 * Ex: "2024-06-10T14:30:00.000Z" → "10 jun"
 * @param {string} isoString
 * @returns {string}
 */
const formatDate = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
};

/**
 * Exibe a data completa atual no header.
 */
const renderHeaderDate = () => {
  const el = document.getElementById("header-date");
  if (!el) return;

  const now = new Date();
  const formatted = now.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Capitaliza a primeira letra
  el.textContent = formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

// ── COLOR SWATCHES ────────────────────────────────────────────

/**
 * Renderiza os swatches de cor do modal de criação de tarefa.
 * @param {string} selectedColor - Cor atualmente selecionada (hex)
 */
const renderColorSwatches = (selectedColor) => {
  const container = document.getElementById("color-picker");
  if (!container) return;

  container.innerHTML = CONFIG.POSTIT_COLORS.map(
    ({ hex, name }) => `
    <div
      class="color-swatch ${hex === selectedColor ? "selected" : ""}"
      style="background-color: ${hex};"
      data-color="${hex}"
      title="${name}"
      onclick="selectColor('${hex}')"
      role="radio"
      aria-label="${name}"
      aria-checked="${hex === selectedColor}"
    ></div>
  `,
  ).join("");
};

/**
 * Atualiza visualmente qual swatch está selecionado.
 * Chamado pelo onclick dos swatches.
 * @param {string} hex
 */
const selectColor = (hex) => {
  // Atualiza a variável do estado do modal
  if (typeof modalState !== "undefined") {
    modalState.selectedColor = hex;
  }

  // Atualiza classes visuais
  document.querySelectorAll(".color-swatch").forEach((swatch) => {
    const isSelected = swatch.dataset.color === hex;
    swatch.classList.toggle("selected", isSelected);
    swatch.setAttribute("aria-checked", isSelected);
  });
};

// ── CATEGORIA SELECTOR (MODAL) ────────────────────────────────

/**
 * Atualiza o botão de categoria selecionado no modal.
 * @param {'day'|'week'|'month'} category
 */
const selectCategory = (category) => {
  if (typeof modalState !== "undefined") {
    modalState.selectedCategory = category;
  }

  document.querySelectorAll(".category-btn").forEach((btn) => {
    // Remove todas as classes de seleção
    btn.classList.remove("selected-day", "selected-week", "selected-month");

    // Adiciona a classe correta apenas no botão selecionado
    if (btn.dataset.cat === category) {
      btn.classList.add(`selected-${category}`);
    }
  });
};

// ── SIDEBAR ───────────────────────────────────────────────────

/** Abre a sidebar de metas. */
const openSidebar = () => {
  document.getElementById("sidebar")?.classList.add("open");
  document.getElementById("sidebar-overlay")?.classList.add("show");
  document.body.style.overflow = "hidden"; // impede scroll do fundo
};

/** Fecha a sidebar de metas. */
const closeSidebar = () => {
  document.getElementById("sidebar")?.classList.remove("open");
  document.getElementById("sidebar-overlay")?.classList.remove("show");
  document.body.style.overflow = "";
};

// ── FILTRO DE STATUS ──────────────────────────────────────────

/**
 * Atualiza o botão de filtro ativo no header.
 * @param {'all'|'pending'|'done'} filter
 */
const updateFilterUI = (filter) => {
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  });
};

// ── CONTADORES DE COLUNA ──────────────────────────────────────

/**
 * Atualiza os contadores numéricos no cabeçalho de cada coluna.
 * @param {{ day: number, week: number, month: number }} counts
 */
const updateCounters = (counts) => {
  const set = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  set("counter-day", counts.day ?? 0);
  set("counter-week", counts.week ?? 0);
  set("counter-month", counts.month ?? 0);
};

// ── ESTADO VAZIO ──────────────────────────────────────────────

/**
 * Retorna o HTML de "coluna vazia" para exibir quando não há tarefas.
 * @param {'day'|'week'|'month'} category
 * @returns {string} HTML string
 */
const getEmptyColumnHTML = (category) => {
  const messages = {
    day: { icon: "fa-calendar", text: "Nenhuma tarefa para hoje" },
    week: { icon: "fa-calendar", text: "Nenhuma tarefa para esta semana" },
    month: { icon: "fa-calendar", text: "Nenhuma tarefa para este mês" },
  };

  const { icon, text } = messages[category] || messages.day;

  return `
    <div class="column-empty">
      <i class="fa-regular ${icon}"></i>
      <p>${text}</p>
    </div>
  `;
};
