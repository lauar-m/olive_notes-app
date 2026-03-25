// ─────────────────────────────────────────────────────────────
// Wrapper centralizado para todas as chamadas HTTP da API.
//
// POR QUE isso existe?
// Sem esse wrapper, precisaríamos repetir em CADA chamada:
//   - headers com 'Content-Type' e 'Authorization'
//   - tratamento de resposta 401 (token expirado)
//   - conversão do body para JSON
//
// Com esse wrapper, chamamos apenas:
//   api.get('/tasks')
//   api.post('/tasks', { title: 'Comprar leite' })
//   api.put('/tasks/123', { status: 'done' })
//   api.delete('/tasks/123')
// ─────────────────────────────────────────────────────────────

const api = {
  /**
   * Método base — todos os outros métodos usam este.
   * @param {string} endpoint - Caminho da API (ex: '/tasks')
   * @param {Object} options  - Opções do fetch (method, body, etc.)
   * @returns {Promise<any>}  - Dados da resposta em JSON
   */
  async request(endpoint, options = {}) {
    // Lê o token do localStorage
    const token = localStorage.getItem(CONFIG.TOKEN_KEY);

    // Monta os headers padrão
    const headers = {
      "Content-Type": "application/json",
      // Se existir token, adiciona o header de autorização
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Token expirado ou inválido → desloga automaticamente
    if (response.status === 401) {
      localStorage.removeItem(CONFIG.TOKEN_KEY);
      localStorage.removeItem(CONFIG.USER_KEY);
      window.location.href = "/index.html";
      return;
    }

    const data = await response.json();

    // Se a API retornou um erro (4xx, 5xx), lança exceção
    if (!response.ok) {
      throw new Error(data.message || "Erro na requisição.");
    }

    return data;
  },

  /** GET — busca dados */
  get(endpoint) {
    return this.request(endpoint, { method: "GET" });
  },

  /** POST — cria um recurso */
  post(endpoint, body) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  /** PUT — atualiza um recurso */
  put(endpoint, body) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  /** DELETE — remove um recurso */
  delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  },
};
