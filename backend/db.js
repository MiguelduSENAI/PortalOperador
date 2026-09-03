const mysql = require("mysql2/promise"); // O "/promise" permite usar async/await
require("dotenv").config(); // Lê o arquivo .env

// Cria um "pool" de conexões para o banco não ficar sobrecarregado
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Testa a conexão assim que o arquivo é lido
pool.getConnection()
  .then(() => console.log("✅ Conectado ao MySQL com sucesso!"))
  .catch((err) => console.error("❌ Erro ao conectar no banco:", err.message));

module.exports = pool; // Exporta a conexão para ser usada no server.js
