import z from "zod";

const createUserSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters long."),
    email: z.email("Please enter a valid email address."),
    password: z.string().min(6, "Password must be at least 6 characters long."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

type CreateUserFormValues = z.infer<typeof createUserSchema>;

export { createUserSchema, type CreateUserFormValues };
