window.createTaskColumn = function ({
  category,
  title,
  subtitle,
  counter,
  tasks,
  onAdd,
  onToggle,
  onEdit,
  onDelete,
  formatDate,
  getEmptyColumnHTML,
  initDragOnCards,
}) {
  const section = document.createElement("section");
  section.className = `column column-${category}`;
  section.id = `column-${category}`;
  section.dataset.category = category;
  section.setAttribute("aria-label", title);
  section.ondragover = (e) => window.handleDragOver && window.handleDragOver(e);
  section.ondragleave = (e) =>
    window.handleDragLeave && window.handleDragLeave(e);
  section.ondrop = (e) => window.handleDrop && window.handleDrop(e);

  // Header
  const header = document.createElement("div");
  header.className = "column-header";

  const titleDiv = document.createElement("div");
  titleDiv.className = "column-title";

  const dot = document.createElement("span");
  dot.className = "column-title-dot";
  titleDiv.appendChild(dot);

  const textDiv = document.createElement("div");
  const titleSpan = document.createElement("span");
  titleSpan.className = "column-title-text";
  titleSpan.textContent = title;
  textDiv.appendChild(titleSpan);
  const subtitleSpan = document.createElement("span");
  subtitleSpan.className = "column-subtitle";
  subtitleSpan.textContent = subtitle;
  textDiv.appendChild(subtitleSpan);
  titleDiv.appendChild(textDiv);
  header.appendChild(titleDiv);

  const counterSpan = document.createElement("span");
  counterSpan.className = "column-counter";
  counterSpan.id = `counter-${category}`;
  counterSpan.textContent = counter;
  header.appendChild(counterSpan);
  section.appendChild(header);

  // Drop zone
  const dropZone = document.createElement("div");
  dropZone.className = "tasks-drop-zone";
  dropZone.id = `drop-${category}`;

  if (!tasks.length) {
    dropZone.innerHTML = getEmptyColumnHTML ? getEmptyColumnHTML(category) : "";
  } else {
    tasks.forEach((task) => {
      const el = window.createTaskCard(task, {
        onToggle,
        onEdit,
        onDelete,
        formatDate,
      });
      dropZone.appendChild(el);
    });
  }
  section.appendChild(dropZone);

  // Add button
  const addBtn = document.createElement("button");
  addBtn.className = "btn-add-task";
  addBtn.onclick = () => onAdd && onAdd(category);
  addBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Adicionar tarefa';
  section.appendChild(addBtn);

  // Inicializa drag nos cards
  if (initDragOnCards) initDragOnCards(dropZone);

  return section;
};
