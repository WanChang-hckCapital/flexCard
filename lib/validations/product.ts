import * as z from "zod";

export const ProductValidation = z.object({
  name: z
    .string()
    .min(3, { message: "Minimum 3 characters." })
    .max(15, { message: "Maximum 15 caracters." }),
  price: z
    .number()
    .min(0, { message: "Price must not less than zero." }),
  description: z
    .string()
    .min(0, { message: "Minimum 0 characters." })
    .max(1000, { message: "Maximum 1000 caracters." }),
  availablePromo: z
    .string()
    .min(0, { message: "Minimum 0 characters." })
    .max(100, { message: "Maximum 100 caracters." }),
  stripeProductId: z
    .string()
    .min(0, { message: "Minimum 0 characters." })
    .max(50, { message: "Maximum 50 caracters." }),
  monthlyDiscount: z
    .number()
    .min(0, { message: "Discount must not less than zero." })
    .max(100, { message: "Maximum discount 100%." }),
  annualDiscount: z
    .number()
    .min(0, { message: "Discount must not less than zero." })
    .max(100, { message: "Maximum discount 100%." }),
  limitedCard: z
    .number()
    .min(10, { message: "Minimum limited 10 cards." })
    .max(99999, { message: "Maximum limited 99999 cards." }),
  limitedIP: z
    .number()
    .min(1, { message: "Minimum limited 1 IP." })
    .max(9999, { message: "Maximum limited 9999 IP." }),
  features: z.array(z.object({
    name: z.string()
      .min(1, { message: "Minimum 1 character for feature." })
      .max(100, { message: "Maximum 100 characters for feature." })
  })),
});
