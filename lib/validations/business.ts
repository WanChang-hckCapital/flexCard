import * as z from "zod";

export const BusinessValidation = z.object({
    businessLocation: 
        z.string()
        .nonempty({ message: "Business location is required" }),
    businessType: 
        z.string()
        .nonempty({ message: "Business type is required" }),
    legalBusinessName: 
        z.string()
        .nonempty({ message: "Legal business name is required" }),
    businessRegistrationNumber: 
        z.string()
        .nonempty({ message: "Company registration number is required" }),
    businessName: 
        z.string()
        .nonempty({ message: "Business name is required" }),
    address1: 
        z.string()
        .nonempty({ message: "Address 1 is required" }),
    address2: 
        z.string()
        .optional(),
    businessPhone: 
        z.string()
        .nonempty({ message: "Business phone number is required" }),
    industry: 
        z.string()
        .nonempty({ message: "Industry is required" }),
    businessWebsite: 
        z.string()
        .optional(),
    productDescription: 
        z.string()
        .optional(),
});