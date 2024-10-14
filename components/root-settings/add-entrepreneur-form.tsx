"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangeEvent, useState } from "react";
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
import imageCompression from "browser-image-compression";
import { ProfileValidation } from "@/lib/validations/new-profile";
import { Textarea } from "../ui/textarea";
import { CircleUser, Pencil } from "lucide-react";
import Image from 'next/image';

interface FormData {
    businessLocation: string;
    businessType: string;
    legalBusinessName: string;
    companyRegistrationNumber: string;
    businessName: string;
    address1: string;
    address2: string;
    businessPhoneNumber: string;
    industry: string;
    businessWebsite: string;
    productDescription: string;
    accountHolderName: string;
    bank: string;
    accountNumber: string;
    confirmAccountNumber: string;
    profile_image: string;
    accountname: string;
    email: string;
    phone: string;
    shortdescription: string;
}

interface Props {
    authActiveProfileId: string;
    dict: any;
}

const AddEntrepreneurForm = ({ authActiveProfileId, dict }: Props) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Partial<FormData>>({});
    const [file, setFiles] = useState<File | null>(null);
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [errors, setErrors] = useState<{ message: string, step: number }[]>([]);
    const router = useRouter();

    const form = useForm<FormData>({
        resolver: zodResolver(step === 1 ? ProfileValidation : step === 2 ? BusinessValidation : BankValidation),
        defaultValues: {
            businessLocation: '',
            businessType: '',
            legalBusinessName: '',
            companyRegistrationNumber: '',
            businessName: '',
            address1: '',
            address2: '',
            businessPhoneNumber: '',
            industry: '',
            businessWebsite: '',
            productDescription: '',
            accountHolderName: '',
            bank: '',
            accountNumber: '',
            confirmAccountNumber: '',
            profile_image: '',
            accountname: '',
            email: '',
            phone: '',
            shortdescription: '',
        },
    });

    const { control, handleSubmit, register, formState: { errors: formErrors }, trigger, getValues } = form;

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
            "companyRegistrationNumber",
            "businessName",
            "address1",
            "businessPhoneNumber",
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
            setStep(4);
        }
    };

    const handleImage = async (e: ChangeEvent<HTMLInputElement>, fieldChange: (value: string) => void) => {
        const fileReader = new FileReader();
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setFiles(file);
            if (!file.type.includes("image")) return;
            try {
                const compressedFile = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1920 });
                fileReader.onload = async (event) => {
                    const imageDataUrl = event.target?.result?.toString() || "";
                    fieldChange(imageDataUrl);
                    setFileUrl(imageDataUrl);
                };
                fileReader.readAsDataURL(compressedFile);
            } catch (error) {
                toast.error("Error compressing image");
            }
        }
    };

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        const finalData = { ...formData, ...data };
        if (file && fileUrl) {
            const finalFormData = {
                businessType: finalData.businessType,
                businessLocation: finalData.businessLocation,
                legalBusinessName: finalData.legalBusinessName,
                businessRegistrationNumber: finalData.companyRegistrationNumber,
                businessName: finalData.businessName,
                businessAddress: `${finalData.address1} ${finalData.address2}`,
                businessPhone: finalData.businessPhoneNumber,
                industry: finalData.industry,
                businessWebsite: finalData.businessWebsite,
                businessProductDescription: finalData.productDescription,
                bankAccountHolder: finalData.accountHolderName,
                bankName: finalData.bank,
                bankAccountNumber: finalData.accountNumber,
                authActiveProfileId: authActiveProfileId,
                createNewProfile: true,
                accountname: finalData.accountname,
                email: finalData.email,
                phone: finalData.phone,
                shortdescription: finalData.shortdescription,
                profile_image: {
                    binaryCode: fileUrl || "",
                    name: file.name
                }
            };

            const result = await signUpOrganization(finalFormData);

            if (result.success === false) {
                setErrors([{ message: result.message || "", step: 3 }]);
            } else {
                toast.success("Sign up Successful, Enjoy flexCard.");
                router.push('/');
            }
        };
    };

    const handleStepClick = async (clickedStep: number) => {
        if (clickedStep === 2) {
            await onReviewStep();
        } else {
            setStep(clickedStep + 1);
        }
    };

    return (
        <div className="container mx-auto p-6 bg-black text-white min-h-screen flex">
            <div className="w-[25%] p-6">
                <Stepper
                    steps={['Profile Info', 'Verify Your Business', 'Add Your Bank', 'Review and Finish']}
                    currentStep={step - 1}
                    onStepClick={handleStepClick}
                />
            </div>
            <div className="w-[35%] p-8 bg-neutral-900 text-white rounded-lg shadow-md">
                <Form {...form}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {step === 1 && (
                            <div>
                                <h1 className="text-[28px] font-bold mb-4">{dict.organization.profile.title}</h1>
                                <FormField
                                    control={control}
                                    name="profile_image"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center gap-4 justify-center relative">
                                            <div className="relative group">
                                                <FormLabel className="account-form_image-label">
                                                    {field.value.length !== 0 ? (
                                                        <Image
                                                            src={field.value}
                                                            alt="profile_icon"
                                                            width={96}
                                                            height={96}
                                                            priority
                                                            className="rounded-full object-contain"
                                                        />
                                                    ) : (
                                                        <CircleUser
                                                            width={96}
                                                            height={96}
                                                            className="rounded-full object-contain text-gray-500"
                                                        />
                                                    )}
                                                </FormLabel>
                                                <div className="absolute inset-0 flex items-center justify-center cursor-pointer rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <Pencil size={24} className="text-white" />
                                                    <FormControl className="absolute inset-0 opacity-0 cursor-pointer">
                                                        <Input
                                                            type="file"
                                                            accept="image/*"
                                                            placeholder="Add profile photo"
                                                            className="account-form_image-input w-full h-full"
                                                            onChange={(e) => handleImage(e, field.onChange)}
                                                        />
                                                    </FormControl>
                                                </div>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="accountname"
                                    render={({ field }) => (
                                        <FormItem className="mb-4 mt-8">
                                            <FormLabel>{dict.organization.profile.accountname}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="account-form_input"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage>{formErrors.accountname?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem className="mb-4">
                                            <FormLabel>{dict.organization.profile.email}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    className="account-form_input"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage>{formErrors.email?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem className="mb-4">
                                            <FormLabel>{dict.organization.profile.phone}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="account-form_input"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage>{formErrors.phone?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="shortdescription"
                                    render={({ field }) => (
                                        <FormItem className="mb-4">
                                            <FormLabel>{dict.organization.profile.shortdescription}</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    className="account-form_input"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage>{formErrors.shortdescription?.message}</FormMessage>
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
                                <h1 className="text-[28px] font-bold mb-4">{dict.organization.business.title}</h1>
                                <h2 className="text-xl text-slate-400 font-bold mb-4">
                                    {dict.organization.business.subTitle}
                                </h2>
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
                                                />
                                            </FormControl>
                                            <FormMessage>{formErrors.legalBusinessName?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="companyRegistrationNumber"
                                    render={({ field }) => (
                                        <FormItem className="mb-4">
                                            <FormLabel>{dict.organization.business.businessRegistrationNumber}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className='account-form_input'
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage>{formErrors.companyRegistrationNumber?.message}</FormMessage>
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
                                                placeholder={dict.organization.business.businessAddress1}
                                            />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="businessPhoneNumber"
                                    render={({ field }) => (
                                        <FormItem className="mb-4">
                                            <FormLabel>{dict.organization.business.businessPhone}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className='account-form_input'
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage>{formErrors.businessPhoneNumber?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="industry"
                                    render={({ field }) => (
                                        <FormItem className="mb-4">
                                            <FormLabel>{dict.organization.business.industry}</FormLabel>
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
                        {step === 3 && (
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
                                    {dict.organization.btn.continue}
                                </Button>
                            </div>
                        )}
                        {step === 4 && (
                            <div>
                                <h1 className="text-[28px] font-bold mb-4">{dict.organization.review.title}</h1>
                                <h2 className="text-xl text-slate-400 font-bold mb-4">
                                    {dict.organization.bank.subTitle}
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
                                        <p>{formData.companyRegistrationNumber}</p>
                                        <p>{formData.businessName}</p>
                                        <p>{formData.address1} {formData.address2}</p>
                                        <p>{formData.businessPhoneNumber}</p>
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
                                <p className="text-[14px] text-slate-600 my-8">{dict.organization.bank.terms}</p>
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

export default AddEntrepreneurForm;
