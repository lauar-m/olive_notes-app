window.createToast = function ({ message, type = "default", duration = 3000 }) {
  const toast = document.createElement("div");
  toast.className = `toast${type !== "default" ? " " + type : ""}`;
  toast.textContent = message;

  // Remover com animação
  toast.addEventListener("animationend", (e) => {
    if (e.animationName === "toastOut") {
      toast.remove();
    }
  });

  // Remover após duração
  setTimeout(() => {
    toast.classList.add("removing");
  }, duration);

  return toast;
};
