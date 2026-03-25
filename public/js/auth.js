// ─────────────────────────────────────────────────────────────
// Módulo de autenticação do frontend.
// Responsabilidades:
//  - Salvar/ler o token JWT no localStorage
//  - Enviar requisições de login e cadastro
//  - Redirecionar o usuário conforme seu estado de auth
//  - Fornecer a função de logout
// ─────────────────────────────────────────────────────────────

// ── Funções de armazenamento local ────────────────────────────

/** Salva o token JWT no localStorage */
function saveToken(token) {
  localStorage.setItem(CONFIG.TOKEN_KEY, token);
}

/** Lê o token JWT do localStorage */
function getToken() {
  return localStorage.getItem(CONFIG.TOKEN_KEY);
}

/** Remove o token do localStorage (logout) */
function removeToken() {
  localStorage.removeItem(CONFIG.TOKEN_KEY);
}

/** Salva os dados básicos do usuário logado */
function saveUser(user) {
  localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(user));
}

/** Lê os dados do usuário salvo */
function getUser() {
  const raw = localStorage.getItem(CONFIG.USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

/** Remove os dados do usuário (logout) */
function removeUser() {
  localStorage.removeItem(CONFIG.USER_KEY);
}

// ── Proteção de rotas ──────────────────────────────────────────

/**
 * Verifica se o usuário está autenticado.
 * Redireciona para o login se não estiver.
 * Deve ser chamado no topo de app.js (página protegida).
 */
function requireAuth() {
  const token = getToken();
  if (!token) {
    window.location.href = "/index.html";
    return false;
  }
  return true;
}

/**
 * Verifica se o usuário JÁ está logado ao acessar a tela de login.
 * Se estiver, redireciona para o app.
 */
function redirectIfLoggedIn() {
  const token = getToken();
  if (token) {
    window.location.href = "/app.html";
  }
}

// ── Helpers da UI da tela de login ────────────────────────────

/**
 * Alterna entre os painéis Login e Cadastro.
 * @param {'login'|'register'} tab
 */
function switchTab(tab) {
  document
    .querySelectorAll(".auth-tab")
    .forEach((t) => t.classList.remove("active"));
  document
    .querySelectorAll(".auth-panel")
    .forEach((p) => p.classList.remove("active"));

  document.getElementById(`tab-${tab}`).classList.add("active");
  document.getElementById(`panel-${tab}`).classList.add("active");

  hideError("login-error");
  hideError("register-error");
}

/** Exibe mensagem de erro abaixo do formulário */
function showError(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = message;
    el.classList.add("show");
  }
}

/** Esconde a mensagem de erro */
function hideError(elementId) {
  const el = document.getElementById(elementId);
  if (el) el.classList.remove("show");
}

/** Coloca o botão em estado de loading */
function setButtonLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;

  if (loading && !btn.dataset.originalText) {
    btn.dataset.originalText = btn.textContent;
  }

  btn.disabled = loading;
  btn.innerHTML = loading
    ? '<span class="spinner"></span> Aguarde...'
    : btn.dataset.originalText || btn.textContent;
}

// ── Handlers de formulário ─────────────────────────────────────

/**
 * Processa o login.
 */
async function handleLogin() {
  hideError("login-error");

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  if (!email || !password) {
    showError("login-error", "Preencha email e senha.");
    return;
  }

  setButtonLoading("btn-login", true);

  try {
    const response = await fetch(`${CONFIG.API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      showError("login-error", data.message || "Erro ao fazer login.");
      return;
    }

    // Sucesso → salva token e usuário, redireciona para o app
    saveToken(data.token);
    saveUser(data.user);
    window.location.href = "/app.html";
  } catch (err) {
    showError(
      "login-error",
      "Erro de conexão. Verifique se o servidor está rodando.",
    );
    console.error("Erro no login:", err);
  } finally {
    setButtonLoading("btn-login", false);
  }
}

/**
 * Processa o cadastro.
 */
async function handleRegister() {
  hideError("register-error");

  const name = document.getElementById("register-name").value.trim();
  const email = document.getElementById("register-email").value.trim();
  const password = document.getElementById("register-password").value;

  if (!name || !email || !password) {
    showError("register-error", "Preencha todos os campos.");
    return;
  }

  if (password.length < 6) {
    showError("register-error", "A senha deve ter no mínimo 6 caracteres.");
    return;
  }

  setButtonLoading("btn-register", true);

  try {
    const response = await fetch(`${CONFIG.API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      showError("register-error", data.message || "Erro ao cadastrar.");
      return;
    }

    // Cadastro bem-sucedido → loga automaticamente
    saveToken(data.token);
    saveUser(data.user);
    window.location.href = "/app.html";
  } catch (err) {
    showError(
      "register-error",
      "Erro de conexão. Verifique se o servidor está rodando.",
    );
    console.error("Erro no cadastro:", err);
  } finally {
    setButtonLoading("btn-register", false);
  }
}

/**
 * Desloga o usuário: limpa localStorage e redireciona para o login.
 */
function handleLogout() {
  removeToken();
  removeUser();
  window.location.href = "/index.html";
}

// ── Inicialização da tela de login ─────────────────────────────

// Só executa se estivermos na página de login (index.html)
if (document.getElementById("panel-login")) {
  // Se já estiver logado, vai direto pro app
  redirectIfLoggedIn();

  // Permite submeter com Enter nos campos
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const activePanel = document.querySelector(".auth-panel.active");
    if (!activePanel) return;
    if (activePanel.id === "panel-login") handleLogin();
    else handleRegister();
  });
}
