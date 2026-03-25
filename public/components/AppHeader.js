window.createAppHeader = function ({
  onOpenSidebar,
  onApplyFilter,
  onLogout,
  userName,
  dateText,
  currentFilter = "all",
}) {
  const header = document.createElement("header");
  header.className = "app-header";

  // Menu (sidebar)
  const menuBtn = document.createElement("button");
  menuBtn.className = "header-menu-btn";
  menuBtn.onclick = () => onOpenSidebar && onOpenSidebar();
  menuBtn.setAttribute("aria-label", "Abrir painel de metas");
  menuBtn.title = "Metas";
  menuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
  header.appendChild(menuBtn);

  // Logo
  const logoDiv = document.createElement("div");
  logoDiv.className = "header-logo";
  logoDiv.innerHTML = `
    <div class="header-logo-icon"><i class="fa-solid fa-note-sticky"></i></div>
    <span class="header-logo-text">Olive Notes</span>
  `;
  header.appendChild(logoDiv);

  // Data
  const dateSpan = document.createElement("span");
  dateSpan.className = "header-date";
  dateSpan.id = "header-date";
  dateSpan.textContent = dateText || "";
  header.appendChild(dateSpan);

  // Filtro
  const filterDiv = document.createElement("div");
  filterDiv.className = "header-filter";
  filterDiv.setAttribute("role", "group");
  filterDiv.setAttribute("aria-label", "Filtrar tarefas");
  [
    { key: "all", label: "Todas" },
    { key: "pending", label: "Pendentes" },
    { key: "done", label: "Concluídas" },
  ].forEach(({ key, label }) => {
    const btn = document.createElement("button");
    btn.className = "filter-btn" + (currentFilter === key ? " active" : "");
    btn.dataset.filter = key;
    btn.textContent = label;
    btn.onclick = () => onApplyFilter && onApplyFilter(key);
    filterDiv.appendChild(btn);
  });
  header.appendChild(filterDiv);

  // Usuário
  const userDiv = document.createElement("div");
  userDiv.className = "header-user";
  userDiv.onclick = () => onLogout && onLogout();
  userDiv.title = "Clique para sair";
  userDiv.innerHTML = `
    <i class="fa-solid fa-user-circle"></i>
    <span class="header-user-name" id="header-user-name">${userName || "Usuário"}</span>
    <i class="fa-solid fa-right-from-bracket"></i>
  `;
  header.appendChild(userDiv);

  return header;
};
