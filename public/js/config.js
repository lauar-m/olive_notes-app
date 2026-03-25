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
    { name: "Vermelho", hex: "#7D2027" },
    { name: "Terracota", hex: "#CF5527" },
    { name: "Oliva", hex: "#998731" },
    { name: "Azul", hex: "#5FA8C2" },
  ],

  // Cor padrão ao criar um novo post-it
  DEFAULT_COLOR: "#998731",

  // Duração dos toasts em milissegundos
  TOAST_DURATION: 3000,
};
