// frontend/src/services/itemService.ts
import { apiClient } from "./apiClient";

// --- Para o Modal de Criação ---
interface ItemPayload {
  description: string;
  unitPrice: number;
  categoryId: string;
  imageUrl?: string;
}

/** Cria um novo item (POST /items) */
export async function createItem(token: string, payload: ItemPayload) {
  // Aqui você pode adicionar lógica de conversão se necessário
  return apiClient.post("/items", token, payload);
}

/** Busca todas as categorias (GET /categories) */
export async function fetchCategories(token: string) {
  // Rota pública, mas exigimos token para conveniência
  const data = await apiClient.get("/categories", token);

  // Mapeia para o formato { id, name }
  return data.map((cat: any) => ({
    id: String(cat.id),
    name: cat.description,
  }));
}
