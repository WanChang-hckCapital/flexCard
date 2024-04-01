import * as z from "zod";

export const SignInValidation = z.object({
  email: z
    .string()
    .min(3, { message: "Minimum 3 characters." })
    .max(30, { message: "Maximum 30 caracters." }),
  password: z
    .string()
    .min(3, { message: "Minimum 3 characters." })
    .max(30, { message: "Maximum 30 caracters." }),
});