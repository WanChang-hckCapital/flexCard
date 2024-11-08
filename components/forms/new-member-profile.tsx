"use client";

import * as z from "zod";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { usePathname, useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { addNewProfile, getIPCountryInfo } from "@/lib/actions/user.actions";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";
import { CircleUser, Pencil } from "lucide-react";
import { ProfileValidation } from "@/lib/validations/new-profile";

interface Props {
  profile: {
    userId: string;
    accountname: string;
    image: string;
    email: string;
    phone: string;
    shortdescription: string;
  };
  btnTitle: string;
  dict: any;
}

const NewMemberProfile = ({ profile, btnTitle, dict }: Props) => {
  const router = useRouter();
  const pathname = usePathname();

  const [file, setFiles] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isFormDirty, setIsFormDirty] = useState(false);

  const form = useForm<z.infer<typeof ProfileValidation>>({
    resolver: zodResolver(ProfileValidation),
    defaultValues: {
      accountname: profile.accountname || "",
      profile_image: profile.image || "",
      email: profile.email || "",
      phone: profile.phone || "",
      shortdescription: profile.shortdescription || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof ProfileValidation>) => {
    if (!file) {
      toast.error("Please upload a profile image.");
      return;
    }

    if (file && fileUrl) {
      const result = await addNewProfile({
        userId: profile.userId,
        accountname: values.accountname,
        email: values.email,
        phone: values.phone,
        shortdescription: values.shortdescription,
        image: {
          binaryCode: fileUrl,
          name: file.name,
        },
      });

      if (result.success) {
        toast.success("Profile added successfully!");
      } else {
        toast.error(result.message);
      }
    }
  };

  const handleImage = async (
    e: ChangeEvent<HTMLInputElement>,
    fieldChange: (value: string) => void
  ) => {
    e.preventDefault();

    const fileReader = new FileReader();

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFiles(file);
      setIsFormDirty(true);

      if (!file.type.includes("image")) return;

      try {
        const options = {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };

        const MAX_SIZE_MB = 5;
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          toast.info("File size exceeds the 5 MB limit. Please upload a smaller image.");
          return;
        }

        let compressedFile = file;
        if (file.size > 0.5 * 1024 * 1024) {
          compressedFile = await imageCompression(file, options);
        }

        fileReader.onload = async (event) => {
          const imageDataUrl = event.target?.result?.toString() || "";
          fieldChange(imageDataUrl);
          setFileUrl(imageDataUrl);
        };

        fileReader.readAsDataURL(compressedFile);
      } catch (error: any) {
        toast.error("Error compressing image:", error);
      }
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isFormDirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };

    if (pathname === "/profile/edit") {
      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }

  }, [isFormDirty, pathname]);

  return (
    <Form {...form}>
      <form
        className='flex flex-col justify-start gap-8'
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name='profile_image'
          render={({ field }) => (
            <FormItem className='flex items-center gap-4 justify-center relative'>
              <div className="relative group">
                <FormLabel className='account-form_image-label'>
                  {field.value.length !== 0 ? (
                    <Image
                      src={field.value}
                      alt='profile_icon'
                      width={96}
                      height={96}
                      priority
                      className='rounded-full object-contain'
                    />
                  ) : (
                    <CircleUser
                      width={96}
                      height={96}
                      className='rounded-full object-contain text-gray-500'
                    />
                  )}
                </FormLabel>
                <div className="absolute inset-0 flex items-center justify-center cursor-pointer rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Pencil size={24} className="text-white" />
                  <FormControl className='absolute inset-0 opacity-0 cursor-pointer'>
                    <Input
                      type='file'
                      accept='image/*'
                      placeholder='Add profile photo'
                      className='account-form_image-input w-full h-full'
                      onChange={(e) => handleImage(e, field.onChange)}
                    />
                  </FormControl>
                </div>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='accountname'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-3'>
              <FormLabel className='text-base-semibold text-light-2'>
                {dict.userSettings.profile.accountname}
              </FormLabel>
              <FormControl>
                <Input
                  type='text'
                  className='account-form_input'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-3'>
              <FormLabel className='text-base-semibold text-light-2'>
                {dict.userSettings.profile.email}
              </FormLabel>
              <FormControl>
                <Input
                  type='email'
                  className='account-form_input'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='phone'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-3'>
              <FormLabel className='text-base-semibold text-light-2'>
                {dict.userSettings.profile.phone}
              </FormLabel>
              <FormControl>
                <Input
                  type='phone'
                  className='account-form_input no-focus'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='shortdescription'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-3'>
              <FormLabel className='text-base-semibold text-light-2'>
                {dict.userSettings.profile.shortDescription}
              </FormLabel>
              <FormControl>
                <Textarea
                  rows={6}
                  className='account-form_input'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' className='bg-primary-500'>
          {btnTitle}
        </Button>
      </form>
    </Form>
  );
};

export default NewMemberProfile;
