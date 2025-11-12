// backend/src/configs/swaggerConfig.js

const swaggerJsdoc = require("swagger-jsdoc");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0", // Define o formato da API [cite: 33]
    info: {
      title: "Dcocumentação API UaiFood", // Título da sua API [cite: 21]
      version: "1.0.0",
      description:
        "API para gerenciamento de usuários, catálogo e pedidos de um sistema de delivery.", // Descrição da API [cite: 22]
    },
    servers: [
      {
        url: "http://localhost:3000", // URL base do seu servidor [cite: 26]
        description: "Servidor de Desenvolvimento Local",
      },
    ],
    // Adicione a definição de segurança (JWT Bearer Token) aqui para uso global
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Insira o token JWT (Bearer Token) obtido no login.",
        },
      },
    },
  },
  // Adaptação: Como suas rotas estão no index.js, você pode apontar o Swagger
  // para os arquivos dos Controllers que estão usando os comentários JSDoc, ou
  // para um arquivo de rotas se você o criar.
  apis: ["./backend/src/controllers/*.js"], // Apontando para onde a documentação será escrita (Nos controllers)
};

const swaggerDocs = swaggerJsdoc(swaggerOptions); // Gera a documentação a partir das opções [cite: 31]

module.exports = swaggerDocs;
