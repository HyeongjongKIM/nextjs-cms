import z from 'zod'

const signinSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string(),
})

type SigninFormValues = z.infer<typeof signinSchema>

export { signinSchema, type SigninFormValues }
