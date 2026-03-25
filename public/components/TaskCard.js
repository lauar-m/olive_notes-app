window.createTaskCard = function (task, handlers = {}) {
  const isDone = task.status === "done";

  const card = document.createElement("div");
  card.className = "task-card" + (isDone ? " done" : "");
  card.dataset.id = task._id;
  card.dataset.category = task.category;
  card.style.backgroundColor = task.color;
  card.draggable = true;

  // Header
  const header = document.createElement("div");
  header.className = "task-header";

  // Checkbox
  const checkbox = document.createElement("div");
  checkbox.className = "task-checkbox" + (isDone ? " checked" : "");
  checkbox.title = isDone ? "Marcar como pendente" : "Marcar como concluída";
  checkbox.setAttribute("role", "checkbox");
  checkbox.setAttribute("aria-checked", isDone);
  checkbox.setAttribute(
    "aria-label",
    isDone ? "Marcar tarefa como pendente" : "Marcar tarefa como concluída",
  );
  checkbox.onclick = () =>
    handlers.onToggle &&
    handlers.onToggle(task._id, isDone ? "pending" : "done");
  header.appendChild(checkbox);

  // Título
  const title = document.createElement("span");
  title.className = "task-title";
  title.textContent = task.title;
  header.appendChild(title);

  card.appendChild(header);

  // Descrição
  if (task.description) {
    const desc = document.createElement("p");
    desc.className = "task-description";
    desc.textContent = task.description;
    card.appendChild(desc);
  }

  // Footer
  const footer = document.createElement("div");
  footer.className = "task-footer";

  const date = document.createElement("span");
  date.className = "task-date";
  date.textContent = handlers.formatDate
    ? handlers.formatDate(task.createdAt)
    : task.createdAt;
  footer.appendChild(date);

  const actions = document.createElement("div");
  actions.className = "task-actions";

  const editBtn = document.createElement("button");
  editBtn.className = "task-action-btn";
  editBtn.title = "Editar tarefa";
  editBtn.setAttribute("aria-label", "Editar");
  editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
  editBtn.onclick = () =>
    handlers.onEdit && handlers.onEdit(task.category, task._id);
  actions.appendChild(editBtn);

  const delBtn = document.createElement("button");
  delBtn.className = "task-action-btn delete";
  delBtn.title = "Remover tarefa";
  delBtn.setAttribute("aria-label", "Remover");
  delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
  delBtn.onclick = () => handlers.onDelete && handlers.onDelete(task._id);
  actions.appendChild(delBtn);

  footer.appendChild(actions);
  card.appendChild(footer);

  return card;
};
