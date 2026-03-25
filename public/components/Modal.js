function createModal({
  id,
  title,
  body,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}) {
  // Cria overlay
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.id = id;
  overlay.tabIndex = -1;
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("role", "dialog");
  overlay.style.display = "none";

  // Cria modal
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.style.maxWidth = "340px";

  // Header
  const header = document.createElement("div");
  header.className = "modal-header";
  const h2 = document.createElement("h2");
  h2.className = "modal-title";
  h2.textContent = title;
  header.appendChild(h2);
  modal.appendChild(header);

  // Body
  const modalBody = document.createElement("div");
  modalBody.className = "modal-body";
  if (typeof body === "string") {
    modalBody.innerHTML = body;
  } else if (body instanceof Node) {
    modalBody.appendChild(body);
  }
  modal.appendChild(modalBody);

  // Footer
  const footer = document.createElement("div");
  footer.className = "modal-footer";
  const cancelBtn = document.createElement("button");
  cancelBtn.className = "btn-modal-cancel";
  cancelBtn.textContent = cancelText || "Cancelar";
  cancelBtn.onclick = () => {
    overlay.style.display = "none";
    if (onCancel) onCancel();
  };
  const confirmBtn = document.createElement("button");
  confirmBtn.className = "btn-modal-save";
  confirmBtn.textContent = confirmText || "Confirmar";
  confirmBtn.onclick = () => {
    if (onConfirm) onConfirm();
    overlay.style.display = "none";
  };
  footer.appendChild(cancelBtn);
  footer.appendChild(confirmBtn);
  modal.appendChild(footer);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  return {
    show: () => {
      overlay.style.display = "flex";
      overlay.classList.add("show");
      overlay.focus();
    },
    hide: () => {
      overlay.style.display = "none";
      overlay.classList.remove("show");
    },
    element: overlay,
  };
}
