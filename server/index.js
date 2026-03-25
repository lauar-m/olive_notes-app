// server/index.js
// ─────────────────────────────────────────────────────────────
// Entry point do servidor. Responsabilidades:
// 1. Carregar variáveis de ambiente (.env)
// 2. Conectar ao MongoDB
// 3. Configurar middlewares globais do Express
// 4. Registrar as rotas
// 5. Iniciar o servidor na porta configurada
// ─────────────────────────────────────────────────────────────

// Carrega as variáveis do .env ANTES de qualquer outra coisa
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

// Importa os roteadores
const authRoutes = require("./routes/auth.routes");
const taskRoutes = require("./routes/task.routes");
const goalRoutes = require("./routes/goal.routes");

// ─── Inicializa o app Express ────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3000;

// ─── Conecta ao banco de dados ───────────────────────────────
connectDB();

// ─── Middlewares Globais ─────────────────────────────────────

// CORS: permite que o frontend (rodando em outro domínio/porta) acesse a API
// Em produção, substitua '*' pelo domínio específico do seu frontend
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Interpreta o body das requisições como JSON
app.use(express.json());

// Interpreta dados de formulários HTML (x-www-form-urlencoded)
app.use(express.urlencoded({ extended: false }));

// Serve os arquivos estáticos do frontend (HTML, CSS, JS)
// __dirname aponta para /server, então subimos um nível com '..'
app.use(express.static(path.join(__dirname, "..", "public")));

// ─── Rotas da API ────────────────────────────────────────────
app.use("/auth", authRoutes); // Autenticação (pública)
app.use("/tasks", taskRoutes); // Tarefas (protegida)
app.use("/goals", goalRoutes); // Metas (protegida)

// ─── Rota de Health Check ─────────────────────────────────────
// Útil para verificar se o servidor está rodando (ex: no Render, Railway)
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Servidor rodando! 🚀",
    timestamp: new Date().toISOString(),
  });
});

// ─── Fallback: qualquer rota não-API serve o frontend ────────
// Isso garante que o roteamento do frontend funcione corretamente
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// ─── Middleware de Tratamento de Erros Global ─────────────────
// Captura erros que não foram tratados nos controllers
app.use((err, req, res, next) => {
  console.error("Erro não tratado:", err.stack);
  res.status(500).json({
    success: false,
    message: "Algo deu errado no servidor.",
  });
});

// ─── Inicia o servidor ────────────────────────────────────────
app.listen(PORT, () => {
  console.log("─────────────────────────────────────");
  console.log(`🟡 Olive Notes rodando na porta ${PORT}`);
  console.log(`🌐 Acesse: http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log("─────────────────────────────────────");
});
