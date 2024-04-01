import * as z from "zod";

export const SignUpValidation = z.object({
    email: z
        .string()
        .email({ message: "Invalid email address." })
        .min(3, { message: "Email must be at least 6 characters." })
        .max(255, { message: "Email must be at most 255 characters." }),
    username: z
        .string()
        .min(3, { message: "Username must be at least 6 characters." })
        .max(30, { message: "Username must be at most 30 characters." }),
    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters." })
        .max(30, { message: "Password must be at most 30 characters." }),
    confirmPassword: z
        .string()
})
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });
