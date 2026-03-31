import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormProps } from "react-hook-form";
import { type z } from "zod";

type UseZodFormParams<TSchema extends z.ZodTypeAny> = {
  schema: TSchema;
} & Omit<UseFormProps<z.infer<TSchema>>, "resolver">;

export const useZodForm = <TSchema extends z.ZodTypeAny>({
  schema,
  ...options
}: UseZodFormParams<TSchema>) => {
  return useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    ...options,
  });
};
