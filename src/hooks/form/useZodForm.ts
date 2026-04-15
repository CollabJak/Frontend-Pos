import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormProps, type FieldValues } from "react-hook-form";
import { type z, type ZodType } from "zod";

type UseZodFormParams<TSchema extends ZodType<FieldValues>> = {
  schema: TSchema;
} & Omit<UseFormProps<z.infer<TSchema>>, "resolver">;

export const useZodForm = <TSchema extends ZodType<FieldValues>>({
  schema,
  ...options
}: UseZodFormParams<TSchema>) => {
  return useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema as any),
    ...options,
  });
};
