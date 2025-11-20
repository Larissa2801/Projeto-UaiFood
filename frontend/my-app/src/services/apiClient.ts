// frontend/src/services/apiClient.ts

// A URL base da API é lida do ambiente Next.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// --- Funções de Ajuda ---

// Trata a resposta HTTP, convertendo em JSON ou lançando erro
const handleResponse = async (response: Response) => {
  // Tenta ler o corpo da resposta
  const text = await response.text();
  let data: any = {};

  // Tenta converter para JSON, ignorando erros se a resposta for HTML ou vazia
  try {
    data = JSON.parse(text);
  } catch {
    // Se falhar ao parsear (ex: 404 HTML), usamos o texto original no erro
    data = { error: text || `Erro HTTP: ${response.status}` };
  }

  if (!response.ok) {
    // Se o status for 4xx ou 5xx (erro), lança um erro com a mensagem do Back-end
    const errorMessage =
      data.error ||
      data.message ||
      `Erro do servidor: Status ${response.status}`;
    throw new Error(errorMessage);
  }
  // Retorna os dados se a resposta for bem-sucedida (status 2xx)
  return data;
};

// Gera os headers necessários, incluindo o Content-Type e o Token de Autorização
const getHeaders = (token?: string): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

// --- Cliente API Principal (apiClient) ---

export const apiClient = {
  /** Faz requisições GET para buscar dados (Ex: /items, /orders/{id}) */
  async get(endpoint: string, token?: string) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "GET",
      headers: getHeaders(token),
    });
    return handleResponse(response);
  },

  /** Faz requisições POST para criação (Ex: /orders, /users) */
  async post(endpoint: string, token: string, body: any) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  /** Faz requisições PUT para atualização (Ex: /users/{id}/address) */
  async put(endpoint: string, token: string, data: any) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "PUT",
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  /** Faz requisições DELETE para remoção (Ex: /users/{id}) */
  async delete(endpoint: string, token: string) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "DELETE",
      headers: getHeaders(token),
    });
    return handleResponse(response);
  },
};
