window.createGoalList = function (goals, handlers = {}) {
  const list = document.createElement("div");
  list.className = "goals-list";

  if (!goals.length) {
    const empty = document.createElement("div");
    empty.className = "goals-empty";
    empty.innerHTML =
      '<i class="fa-regular fa-star"></i><p>Nenhuma meta ainda.</p>';
    list.appendChild(empty);
    return list;
  }

  goals.forEach((goal) => {
    const el = window.createGoalItem(goal, handlers);
    list.appendChild(el);
  });

  return list;
};
