"use client";

import * as z from "zod";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { usePathname, useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";
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

import { UserValidation } from "@/lib/validations/user";
import { updateMemberDetails, uploadImageToGridFS } from "@/lib/actions/user.actions";
import { isBase64Image } from "@/lib/utils";

interface Props {
  user: {
    userId: string;
    accountname: string;
    image: string;
    email: string;
    password: string;
    phone: string;
    shortdescription: string;
  };
  btnTitle: string;
}

const MemberProfile = ({ user, btnTitle }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  // const { startUpload } = useUploadThing("media");

  const [files, setFiles] = useState<File[]>([]);

  const form = useForm<z.infer<typeof UserValidation>>({
    resolver: zodResolver(UserValidation),
    defaultValues: {
      accountname: user?.accountname ? user.accountname : "",
      profile_image: user?.image ? user.image : "",
      email: user?.email ? user.email : "",
      password: user?.password ? user.password : "",
      phone: user?.phone ? user.phone : "",
      shortdescription: user?.shortdescription ? user.shortdescription : "",
    },
  });

  const onSubmit = async (values: z.infer<typeof UserValidation>) => {
    // const blob = values.profile_image;

    // const hasImageChanged = isBase64Image(blob);
    // if (hasImageChanged) {
    //   const imageUrl = await uploadImageToGridFS(files[0], "something");

    //   if (imageUrl) {
    //     values.profile_image = imageUrl;
    //   }
    // }

    // const blob = values.profile_image;

    // const hasImageChanged = isBase64Image(blob);
    // if (hasImageChanged) {
    //   const imgRes = await uploadImageToGridFS(files);

    //   if (imgRes && imgRes[0].fileUrl) {
    //     values.profile_image = imgRes[0].fileUrl;
    //   }
    // }

    try {
      const imageData = files[0] as File;
      const fileId = await uploadImageMetadataToServer(imageData.name);
      console.log("ImageId: " + fileId);
  
      await updateMemberDetails({
        userId: user.userId,
        accountname: values.accountname,
        email: values.email,
        password: values.password,
        phone: values.phone,
        shortdescription: values.shortdescription,
        image: fileId,
        path: pathname,
      });
  
      if (pathname === "/profile/edit") {
        router.back();
      } else {
        router.push("/");
      }
    } catch (error: any) {
      console.error(`Failed to submit form: ${error.message}`);
    }

    // await updateMemberDetails({
    //   userId: user.userId,
    //   accountname: values.accountname,
    //   email: values.email,
    //   password: values.password,
    //   phone: values.phone,
    //   shortdescription: values.shortdescription,
    //   image: values.profile_image,
    //   path: pathname,
    // });

    // form.setValue("profile_image", imageUrl);

    // if (pathname === "/profile/edit") {
    //   router.back();
    // } else {
    //   router.push("/");
    // }
  };

  const uploadImageMetadataToServer = async (filename: string): Promise<string> => {
    try {
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename }),
      });
  
      const data = await response.json();
      return data.fileId;
    } catch (error:any) {
      throw new Error(`Failed to upload image metadata to the server: ${error.message}`);
    }
  };

  // const formDataToBuffer = async (formData: FormData): Promise<Buffer> => {
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       const arrayBuffer = reader.result as ArrayBuffer;
  //       const buffer = Buffer.from(arrayBuffer);
  //       resolve(buffer);
  //     };
  //     reader.onerror = reject;
  //     reader.readAsArrayBuffer(formData.get('image') as Blob);
  //   });
  // };

  const handleImage = (
    e: ChangeEvent<HTMLInputElement>,
    fieldChange: (value: string) => void
  ) => {
    e.preventDefault();

    const fileReader = new FileReader();

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFiles(Array.from(e.target.files));

      if (!file.type.includes("image")) return;

      fileReader.onload = async (event) => {
        const imageDataUrl = event.target?.result?.toString() || "";
        fieldChange(imageDataUrl);
      };

      fileReader.readAsDataURL(file);
    }
  };

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
            <FormItem className='flex items-center gap-4'>
              <FormLabel className='account-form_image-label'>
                {field.value ? (
                  <Image
                    src={field.value}
                    alt='profile_icon'
                    width={96}
                    height={96}
                    priority
                    className='rounded-full object-contain'
                  />
                ) : (
                  <Image
                    src='/assets/profile.svg'
                    alt='profile_icon'
                    width={24}
                    height={24}
                    className='object-contain'
                  />
                )}
              </FormLabel>
              <FormControl className='flex-1 text-base-semibold text-gray-200'>
                <Input
                  type='file'
                  accept='image/*'
                  placeholder='Add profile photo'
                  className='account-form_image-input'
                  // onChange={handleImage}
                  onChange={(e) => handleImage(e, field.onChange)}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='accountname'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-3'>
              <FormLabel className='text-base-semibold text-light-2'>
                Account Nickname
              </FormLabel>
              <FormControl>
                <Input
                  type='text'
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
          name='email'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-3'>
              <FormLabel className='text-base-semibold text-light-2'>
                Email
              </FormLabel>
              <FormControl>
                <Input
                  type='email'
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
          name='password'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-3'>
              <FormLabel className='text-base-semibold text-light-2'>
                Password
              </FormLabel>
              <FormControl>
                <Input
                  type='password'
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
          name='confirmPassword'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-3'>
              <FormLabel className='text-base-semibold text-light-2'>
                Confirm Password
              </FormLabel>
              <FormControl>
                <Input
                  type='password'
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
          name='phone'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-3'>
              <FormLabel className='text-base-semibold text-light-2'>
                Phone No
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
                Short Description
              </FormLabel>
              <FormControl>
                <Textarea
                  rows={8}
                  className='account-form_input no-focus'
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

export default MemberProfile;
