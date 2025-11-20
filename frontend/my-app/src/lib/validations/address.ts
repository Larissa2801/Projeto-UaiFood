import { z } from "zod";

export const addressSchema = z.object({
  street: z.string().min(1, "Rua obrigatória"),
  number: z.string().min(1, "Número obrigatório"),
  district: z.string().min(1, "Bairro obrigatório"),
  city: z.string().min(1, "Cidade obrigatória"),
  state: z.string().min(2, "Estado obrigatório"),
  zipCode: z.string().min(8, "CEP obrigatório"),
});

export type AddressFormData = z.infer<typeof addressSchema>;
