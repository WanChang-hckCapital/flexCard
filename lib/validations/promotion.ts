import * as z from "zod";

export const PromotionValidation = z.object({
  name: z
    .string()
    .min(3, { message: "Minimum 3 characters." })
    .max(20, { message: "Maximum 20 caracters." }),
  code: z
    .string()
    .min(8, { message: "Minimum 8 characters." })
    .max(20, { message: "Maximum 20 caracters." }),
  discount: z
    .number()
    .min(0, { message: "Minimum 0% discount." })
    .max(100, { message: "Maximum 100% discount." }),
  dateRange: z.object(
    {
      startDate: z.date(),
      endDate: z.date(),
    },
    {
      required_error: "Please select a date range",
    })
    .refine((dateRange) => dateRange.startDate < dateRange.endDate, {
      path: ["dateRange"],
      message: "From date must be before to date",
    }),
  limitedQuantity: z
    .number()
    .min(1, { message: "Minimum limited 1 quantity." })
    .max(99999, { message: "Maximum limited 99999 quantities." }),
});
