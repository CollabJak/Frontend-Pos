import z from "zod";
export const AtributeSchema = z.object({
  name: z.string().min(1, "Nama atribut wajib diisi"),
});

export type AtributeFormData = z.infer<typeof AtributeSchema>;