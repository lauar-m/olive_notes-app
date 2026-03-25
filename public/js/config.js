// ─────────────────────────────────────────────────────────────
// Constantes globais do frontend.
// Centralizar aqui facilita trocar a URL da API para produção
// sem precisar buscar e substituir em vários arquivos.
// ─────────────────────────────────────────────────────────────

const CONFIG = {
  // URL base da API — string vazia = mesmo host (Express serve o frontend)
  // Em produção, troque pelo seu domínio: 'https://meu-app.railway.app'
  API_URL: "",

  // Chave usada para salvar o token JWT no localStorage
  TOKEN_KEY: "postit_mcm_token",

  // Chave usada para salvar os dados do usuário
  USER_KEY: "postit_mcm_user",

  // Cores disponíveis para os Tarefas
  POSTIT_COLORS: [
    { name: "Butter", hex: "#FFEDAB" },
    { name: "Olive Soft", hex: "#C9D7A3" },
    { name: "Terracotta", hex: "#D8A48F" },
    { name: "Cherry Soft", hex: "#E3A6A6" },
    { name: "Oat", hex: "#F0E6DA" },
    { name: "Sage", hex: "#B7C4A3" },
  ],

  // Cor padrão ao criar um novo post-it
  DEFAULT_COLOR: "#F5E6A3",

  // Duração dos toasts em milissegundos
  TOAST_DURATION: 3000,
};
