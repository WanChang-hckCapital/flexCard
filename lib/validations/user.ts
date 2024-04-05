import * as z from "zod";

export const UserValidation = z.object({
  accountname: z
    .string()
    .min(6, { message: "Minimum 6 characters." })
    .max(15, { message: "Maximum 15 caracters." }),
  profile_image: z.string().url().nonempty(),
  email: z
    .string()
    .min(10, { message: "Minimum 10 characters." })
    .max(50, { message: "Maximum 50 caracters." }),
  password: z
    .string()
    .min(3, { message: "Minimum 3 characters." })
    .max(1000, { message: "Maximum 1000 caracters." }),
  phone: z
    .string()
    .min(9, { message: "Minimum 9 characters." })
    .max(14, { message: "Maximum 14 caracters." }),
  shortdescription: z
    .string()
    .min(1, { message: "Minimum 1 characters." })
    .max(150, { message: "Maximum 150 caracters." }),
  confirmPassword: z
    .string()
})
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
