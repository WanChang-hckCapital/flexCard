"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { businessLocations, businessTypes, industries, banks } from "@/lib/constants";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BusinessValidation } from "@/lib/validations/business";
import { BankValidation } from "@/lib/validations/bank";
import Stepper from "@/components/ui/stepper";
import { Card } from "@/components/ui/card";
import { signUpOrganization } from "@/lib/actions/user.actions";
import { toast } from "sonner";

interface FormData {
    businessLocation: string;
    businessType: string;
    legalBusinessName: string;
    businessRegistrationNumber: string;
    businessName: string;
    address1: string;
    address2: string;
    businessPhone: string;
    industry: string;
    businessWebsite: string;
    productDescription: string;
    accountHolderName: string;
    bank: string;
    accountNumber: string;
    confirmAccountNumber: string;
}

interface Props {
    authActiveProfileId: string;
    organization?: any;
    isEditMode?: boolean;
    dict: any;
}

const SignupOrganizationForm = ({ authActiveProfileId, organization, isEditMode = false, dict }: Props) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Partial<FormData>>({});
    const [errors, setErrors] = useState<{ message: string, step: number }[]>([]);
    const router = useRouter();

    const form = useForm<FormData>({
        resolver: zodResolver(step === 1 ? BusinessValidation : BankValidation),
        defaultValues: {
            businessLocation: '',
            businessType: '',
            legalBusinessName: '',
            businessRegistrationNumber: '',
            businessName: '',
            address1: '',
            address2: '',
            businessPhone: '',
            industry: '',
            businessWebsite: '',
            productDescription: '',
            accountHolderName: '',
            bank: '',
            accountNumber: '',
            confirmAccountNumber: ''
        },
    });

    const { control, handleSubmit, register, formState: { errors: formErrors }, trigger, getValues, setValue } = form;

    useEffect(() => {
        if (organization && isEditMode) {
            setValue("businessLocation", organization.businessLocation || "");
            setValue("businessType", organization.businessType || "");
            setValue("legalBusinessName", organization.legalBusinessName || "");
            setValue("businessRegistrationNumber", organization.businessRegistrationNumber || "");
            setValue("businessName", organization.businessName || "");
            setValue("address1", organization.businessAddress || "");
            setValue("address2", organization.address2 || "");
            setValue("businessPhone", organization.businessPhone || "");
            setValue("industry", organization.industry || "");
            setValue("businessWebsite", organization.businessWebsite || "");
            setValue("productDescription", organization.businessProductDescription || "");
            setValue("accountHolderName", organization.bankAccountHolder || "");
            setValue("bank", organization.bankName || "");
            setValue("accountNumber", organization.bankAccountNumber || "");
        }
    }, [organization, isEditMode, setValue]);

    const onNextStep = async () => {
        const valid = await trigger();
        if (valid) {
            setFormData(prevData => ({ ...prevData, ...getValues() }));
            setStep((prevStep) => prevStep + 1);
        }
    };

    const onReviewStep = async () => {
        const validBusiness = await trigger([
            "businessLocation",
            "businessType",
            "legalBusinessName",
            "businessRegistrationNumber",
            "businessName",
            "address1",
            "businessPhone",
            "industry",
            "productDescription",
        ]);

        const validBank = await trigger([
            "accountHolderName",
            "bank",
            "accountNumber",
            "confirmAccountNumber",
        ]);

        const newErrors: { message: string, step: number }[] = [];

        if (!validBusiness) {
            newErrors.push({ message: 'Business Information is missing values.', step: 1 });
        }

        if (!validBank) {
            newErrors.push({ message: 'Bank Information is missing values.', step: 2 });
        }

        if (newErrors.length > 0) {
            setErrors(newErrors);
        } else {
            setFormData(prevData => ({ ...prevData, ...getValues() }));
            setStep(3);
        }
    };

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        const finalData = { ...formData, ...data };
        const finalFormData = {
            businessType: finalData.businessType,
            businessLocation: finalData.businessLocation,
            legalBusinessName: finalData.legalBusinessName,
            businessRegistrationNumber: finalData.businessRegistrationNumber,
            businessName: finalData.businessName,
            businessAddress: `${finalData.address1} ${finalData.address2}`,
            businessPhone: finalData.businessPhone,
            industry: finalData.industry,
            businessWebsite: finalData.businessWebsite,
            businessProductDescription: finalData.productDescription,
            bankAccountHolder: finalData.accountHolderName,
            bankName: finalData.bank,
            bankAccountNumber: finalData.accountNumber,
            authActiveProfileId: authActiveProfileId,
            createNewProfile: !isEditMode,
        }

        console.log("Final Form Data: ", finalFormData);

        const result = await signUpOrganization(finalFormData);

        if (result.success === false) {
            setErrors([{ message: result.message || "", step: 3 }]);
        } else {
            toast.success(isEditMode ? "Profile updated successfully!" : "Sign up successful, enjoy flexCard.");
            router.push('/');
        }
    };

    const handleStepClick = async (clickedStep: number) => {
        if (step === 1 && clickedStep === 1) {
            await onNextStep();
        } else if (step === 2 && clickedStep === 2) {
            const validBank = await trigger([
                "accountHolderName",
                "bank",
                "accountNumber",
                "confirmAccountNumber",
            ]);

            if (validBank) {
                setFormData(prevData => ({ ...prevData, ...getValues() }));
                setStep(3);
            } else {
                setErrors([{ message: 'Please complete all required fields in bank information.', step: 2 }]);
            }
        }
    };

    return (
        <div className="container mx-auto p-6 bg-black text-white min-h-screen flex">
            <div className="w-[25%] p-6">
                <Stepper
                    steps={['Verify Your Business', 'Add Your Bank', 'Review and finish']}
                    currentStep={step - 1}
                    onStepClick={handleStepClick}
                />
            </div>
            <div className="w-[35%] p-8 bg-neutral-900 text-white rounded-lg shadow-md">
                <Form {...form}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {step === 1 && (
                            <div>
                                <h1 className="text-[28px] font-bold mb-4">{isEditMode ? dict.organization.isEdit.editTitle : dict.organization.isEdit.newTitle}</h1>
                                <FormField
                                    control={control}
                                    name="businessLocation"
                                    render={({ field }) => (
                                        <FormItem className="mb-4">
                                            <FormLabel>{dict.organization.business.businessLocation}</FormLabel>
                                            <FormControl>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={dict.organization.business.selectBusinessLocation} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {businessLocations.map(location => (
                                                            <SelectItem key={location} value={location}>{location}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage>{formErrors.businessLocation?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="businessType"
                                    render={({ field }) => (
                                        <FormItem className="mb-4">
                                            <FormLabel>{dict.organization.business.businessType}</FormLabel>
                                            <FormControl>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={dict.organization.business.selectBusinessType} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {businessTypes.map(type => (
                                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage>{formErrors.businessType?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="legalBusinessName"
                                    render={({ field }) => (
                                        <FormItem className="mb-4">
                                            <FormLabel>{dict.organization.business.legalBusinessName}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className='account-form_input'
                                                    {...field}
                                                    disabled={isEditMode}
                                                />
                                            </FormControl>
                                            <FormMessage>{formErrors.legalBusinessName?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="businessRegistrationNumber"
                                    render={({ field }) => (
                                        <FormItem className="mb-4">
                                            <FormLabel>{dict.organization.business.businessRegistrationNumber}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className='account-form_input'
                                                    {...field}
                                                    disabled={isEditMode}
                                                />
                                            </FormControl>
                                            <FormMessage>{formErrors.businessRegistrationNumber?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="businessName"
                                    render={({ field }) => (
                                        <FormItem className="mb-4">
                                            <FormLabel>{dict.organization.business.businessName}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className='account-form_input'
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage>{formErrors.businessName?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="address1"
                                    render={({ field }) => (
                                        <FormItem className="mb-4">
                                            <FormLabel>{dict.organization.business.businessAddressTitle}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className='account-form_input'
                                                    {...field}
                                                    placeholder={dict.organization.business.businessAddress1}
                                                />
                                            </FormControl>
                                            <FormMessage>{formErrors.address1?.message}</FormMessage>
                                            <Input
                                                className='account-form_input mt-2'
                                                {...register("address2")}
                                                placeholder={dict.organization.business.businessAddress2}
                                            />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="businessPhone"
                                    render={({ field }) => (
                                        <FormItem className="mb-4">
                                            <FormLabel>{dict.organization.business.businessPhone}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className='account-form_input'
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage>{formErrors.businessPhone?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="industry"
                                    render={({ field }) => (
                                        <FormItem className="mb-4">
                                            <FormLabel></FormLabel>
                                            <FormControl>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={dict.organization.business.selectIndustry} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {industries.map(industry => (
                                                            <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage>{formErrors.industry?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="businessWebsite"
                                    render={({ field }) => (
                                        <FormItem className="mb-4">
                                            <FormLabel>{dict.organization.business.businessWebsite}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className='account-form_input'
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage>{formErrors.businessWebsite?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="productDescription"
                                    render={({ field }) => (
                                        <FormItem className="mb-4">
                                            <FormLabel>{dict.organization.business.businessProductDescription}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className='account-form_input'
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage>{formErrors.productDescription?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />
                                <Button variant="purple" type="button" onClick={onNextStep} className="mt-4 w-full">
                                    Continue
                                </Button>
                            </div>
                        )}
                        {step === 2 && (
                            <div>
                                <h1 className="text-[28px] font-bold mb-4">{dict.organization.bank.title}</h1>
                                <h2 className="text-xl text-slate-400 font-bold mb-4">{dict.organization.bank.subTitle}</h2>
                                <FormField
                                    control={control}
                                    name="accountHolderName"
                                    render={({ field }) => (
                                        <FormItem className="mb-4">
                                            <FormLabel>{dict.organization.bank.bankAccountHolder}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className='account-form_input'
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage>{formErrors.accountHolderName?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="bank"
                                    render={({ field }) => (
                                        <FormItem className="mb-4">
                                            <FormLabel>{dict.organization.bank.bankName}</FormLabel>
                                            <FormControl>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={dict.organization.bank.bankName} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {banks.map(bank => (
                                                            <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage>{formErrors.bank?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="accountNumber"
                                    render={({ field }) => (
                                        <FormItem className="mb-4">
                                            <FormLabel>{dict.organization.bank.bankAccountNumber}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className='account-form_input'
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage>{formErrors.accountNumber?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="confirmAccountNumber"
                                    render={({ field }) => (
                                        <FormItem className="mb-4">
                                            <FormLabel>{dict.organization.bank.reBankAccountNumber}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className='account-form_input'
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage>{formErrors.confirmAccountNumber?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />
                                <Button variant="purple" type="button" onClick={onReviewStep} className="mt-4 w-full">
                                    Continue
                                </Button>
                            </div>
                        )}
                        {step === 3 && (
                            <div>
                                <h1 className="text-[28px] font-bold mb-4">{dict.organization.review.title}</h1>
                                <h2 className="text-xl text-slate-400 font-bold mb-4">
                                    {dict.organization.review.subTitle}
                                </h2>
                                {errors.length > 0 && (
                                    <div className="bg-red-500 text-white p-3 mb-4 rounded">
                                        {errors.map((error, index) => (
                                            <div key={index} className="flex justify-between items-center">
                                                <p>{error.message}</p>
                                                <Button
                                                    variant="link"
                                                    onClick={() => setStep(error.step)}
                                                    className="text-white underline">
                                                    {dict.organization.btn.edit}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="mb-4">
                                    <div className="flex flex-row justify-between">
                                        <h3 className="self-center font-bold">{dict.organization.business.info}</h3>
                                        <Button
                                            variant="link"
                                            onClick={() => setStep(1)}
                                            className="text-white underline">
                                            {dict.organization.btn.edit}
                                        </Button>
                                    </div>
                                    <Card className="p-4 bg-neutral-800 text-white mb-4 mt-2">
                                        <p>{formData.businessLocation}</p>
                                        <p>{formData.businessType}</p>
                                        <p>{formData.legalBusinessName}</p>
                                        <p>{formData.businessRegistrationNumber}</p>
                                        <p>{formData.businessName}</p>
                                        <p>{formData.address1} {formData.address2}</p>
                                        <p>{formData.businessPhone}</p>
                                        <p>{formData.industry}</p>
                                        <p>{formData.businessWebsite}</p>
                                        <p>{formData.productDescription}</p>
                                    </Card>
                                </div>
                                <div className="mb-4">
                                    <div className="flex flex-row justify-between">
                                        <h3 className="self-center font-bold">{dict.organization.bank.info}</h3>
                                        <Button
                                            variant="link"
                                            onClick={() => setStep(2)}
                                            className="text-white underline">
                                            {dict.organization.btn.edit}
                                        </Button>
                                    </div>
                                    <Card className="p-4 bg-neutral-800 text-white mb-4 mt-2">
                                        <p>{formData.accountHolderName}</p>
                                        <p>{formData.bank}</p>
                                        <p>{formData.accountNumber}</p>
                                    </Card>
                                </div>
                                <p className="text-[14px] text-slate-600 my-8">{dict.organization.review.terms}</p>
                                <div className="flex justify-between">
                                    <Button variant="purple" type="submit" className="mt-4 w-full">
                                        {dict.organization.btn.submit}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </form>
                </Form>
            </div>
        </div>
    );
};

export default SignupOrganizationForm;
