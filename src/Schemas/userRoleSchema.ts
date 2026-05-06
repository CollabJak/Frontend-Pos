import { z } from "zod";

export const assignRoleSchema = z.object({
  user_id: z.number({
    required_error: "User ID is required",
  }),
  role: z.string({
    required_error: "Role is required",
  }).min(1, "Role is required"),
});

export type AssignRoleFormData = z.infer<typeof assignRoleSchema>;
