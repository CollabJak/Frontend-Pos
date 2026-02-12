import z from "zod";
export const AtributeSchema = z.object({
  name: z.string().min(1, "Atribute name is required"),
});

export type AtributeFormData = z.infer<typeof AtributeSchema>;