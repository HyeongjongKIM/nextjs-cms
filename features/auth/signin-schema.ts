import z from "zod";

const signinSchema = z.object({
  email: z.email(),
  password: z.string(),
});

type SigninFormValues = z.infer<typeof signinSchema>;

export { signinSchema, type SigninFormValues };
