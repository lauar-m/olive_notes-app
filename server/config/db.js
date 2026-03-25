// server/config/db.js
// ─────────────────────────────────────────────────────────────
// Responsabilidade: conectar ao MongoDB usando Mongoose.
// Isolamos aqui para que o index.js fique limpo e para
// facilitar testes unitários no futuro.
// ─────────────────────────────────────────────────────────────

const mongoose = require('mongoose');

/**
 * Conecta ao MongoDB usando a URI definida no .env
 * Encerra o processo se a conexão falhar (fail-fast pattern)
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // Mensagem amigável com o host conectado
    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Erro ao conectar no MongoDB: ${error.message}`);

    // Encerramos o processo — sem banco, o app não funciona
    process.exit(1);
  }
};

module.exports = connectDB;
