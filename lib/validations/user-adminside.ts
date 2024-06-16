import * as z from "zod";

export const AdminSideUserValidation = z.object({
  email: z
    .string()
    .min(10, { message: "Minimum 10 characters." })
    .max(50, { message: "Maximum 50 caracters." })
    .email({ message: "Invalid email address." }),
    userRole: z
    .string()
    .nonempty({ message: "User role is required." })
    .refine(value => ["FLEXACCOUNTANT", "FLEXHR", "SUPERUSER"].includes(value), {
      message: "Invalid user role.",
    }),
})
