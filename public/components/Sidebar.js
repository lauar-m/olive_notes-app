window.createSidebar = function ({
  activeTab = "annual",
  onClose,
  onSwitchTab,
  onAddGoal,
  onGoalInputKeydown,
  goalsAnnual = [],
  goalsLife = [],
  renderGoalList,
}) {
  const aside = document.createElement("aside");
  aside.className = "sidebar";
  aside.id = "sidebar";
  aside.setAttribute("role", "complementary");
  aside.setAttribute("aria-label", "Painel de Metas");

  // Header
  const header = document.createElement("div");
  header.className = "sidebar-header";
  header.innerHTML = `
    <button class="sidebar-close" aria-label="Fechar painel"><i class="fa-solid fa-xmark"></i></button>
    <p class="sidebar-subtitle">Visão de longo prazo</p>
    <h2 class="sidebar-title">Minhas Metas</h2>
  `;
  header.querySelector(".sidebar-close").onclick = () => onClose && onClose();
  aside.appendChild(header);

  // Tabs
  const tabs = document.createElement("div");
  tabs.className = "sidebar-tabs";
  [
    { key: "annual", label: "Anuais", icon: "fa-calendar-check" },
    { key: "life", label: "De Vida", icon: "fa-star" },
  ].forEach(({ key, label, icon }) => {
    const btn = document.createElement("button");
    btn.className = "sidebar-tab" + (activeTab === key ? " active" : "");
    btn.id = `goal-tab-${key}`;
    btn.innerHTML = `<i class="fa-solid ${icon}"></i> ${label}`;
    btn.onclick = () => onSwitchTab && onSwitchTab(key);
    tabs.appendChild(btn);
  });
  aside.appendChild(tabs);

  // Goals list
  const body = document.createElement("div");
  body.className = "sidebar-body";
  const list = document.createElement("div");
  list.className = "goals-list";
  list.id = "goals-list";
  // Renderiza a lista da aba ativa
  if (renderGoalList) {
    const goals = activeTab === "annual" ? goalsAnnual : goalsLife;
    list.appendChild(renderGoalList(goals));
  }
  body.appendChild(list);
  aside.appendChild(body);

  // Footer (input + add)
  const footer = document.createElement("div");
  footer.className = "sidebar-footer";
  const input = document.createElement("input");
  input.type = "text";
  input.className = "sidebar-input";
  input.id = "new-goal-input";
  input.placeholder = "Escreva uma nova meta...";
  input.maxLength = 200;
  input.onkeydown = (e) => onGoalInputKeydown && onGoalInputKeydown(e);
  footer.appendChild(input);
  const addBtn = document.createElement("button");
  addBtn.className = "btn-sidebar-add";
  addBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Adicionar Meta';
  addBtn.onclick = () => onAddGoal && onAddGoal();
  footer.appendChild(addBtn);
  aside.appendChild(footer);

  return aside;
};
