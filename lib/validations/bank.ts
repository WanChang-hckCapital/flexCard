import * as z from "zod";

export const BankValidation = z.object({
    accountHolderName: 
        z.string()
        .nonempty({ message: "Account holder name is required" }),
    bank: 
        z.string()
        .nonempty({ message: "Bank is required" }),
    accountNumber: 
        z.string()
        .nonempty({ message: "Account number is required" }),
    confirmAccountNumber: 
        z.string()
        .nonempty({ message: "Confirm account number is required" }),
}).refine(data => data.accountNumber === data.confirmAccountNumber, {
    message: "Account numbers must match",
    path: ["confirmAccountNumber"],
});