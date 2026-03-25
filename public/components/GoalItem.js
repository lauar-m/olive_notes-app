window.createGoalItem = function (goal, handlers = {}) {
  const isDone = goal.status === "done";

  // Cria elemento principal
  const item = document.createElement("div");
  item.className = "goal-item" + (isDone ? " done" : "");
  item.dataset.id = goal._id;

  // Checkbox
  const checkbox = document.createElement("div");
  checkbox.className = "goal-checkbox" + (isDone ? " checked" : "");
  checkbox.title = isDone ? "Reabrir meta" : "Concluir meta";
  checkbox.setAttribute("role", "checkbox");
  checkbox.setAttribute("aria-checked", isDone);
  checkbox.onclick = () =>
    handlers.onToggle &&
    handlers.onToggle(goal._id, isDone ? "pending" : "done");
  item.appendChild(checkbox);

  // Texto
  const text = document.createElement("span");
  text.className = "goal-text";
  text.textContent = goal.title;
  item.appendChild(text);

  // Ações
  const actions = document.createElement("div");
  actions.className = "goal-actions";

  const editBtn = document.createElement("button");
  editBtn.className = "goal-action-btn";
  editBtn.title = "Editar meta";
  editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
  editBtn.onclick = () => handlers.onEdit && handlers.onEdit(goal._id);
  actions.appendChild(editBtn);

  const delBtn = document.createElement("button");
  delBtn.className = "goal-action-btn delete";
  delBtn.title = "Remover meta";
  delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
  delBtn.onclick = () => handlers.onDelete && handlers.onDelete(goal._id);
  actions.appendChild(delBtn);

  item.appendChild(actions);
  return item;
};
