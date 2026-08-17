import { z } from "zod";

export const assignRoleSchema = z.object({
  user_id: z.number(),
  role: z.string().min(1, "Peran wajib dipilih"),
});

export type AssignRoleFormData = z.infer<typeof assignRoleSchema>;
