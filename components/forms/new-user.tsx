"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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

import { ProductValidation } from "@/lib/validations/product";
import { toast } from "sonner";
import { usePathname, useRouter } from "next/navigation";
import { createMemberWithProfileRole, fetchAllPromotion, insertNewProduct, updateProduct } from "@/lib/actions/admin.actions";
import { useEffect, useState } from "react";
import { AdminSideUserValidation } from "@/lib/validations/user-adminside";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

type userRole = 'FLEXACCOUNTANT' | 'FLEXHR' | 'SUPERUSER';

interface Props {
  btnTitle: string;
  authActiveProfileId: string;
}

const userRoles: userRole[] = ['FLEXACCOUNTANT', 'FLEXHR', 'SUPERUSER'];

const AddNewUser = ({ btnTitle, authActiveProfileId }: Props) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof AdminSideUserValidation>>({
    resolver: zodResolver(AdminSideUserValidation),
    defaultValues: {
      email: '',
      userRole: '',
    },
  });

  const { control, handleSubmit, resetField } = form;

  function clearField(result: any) {
    resetField("email");
    resetField("userRole");
  }

  const onSubmit = async (values: z.infer<typeof AdminSideUserValidation>) => {
    const result = await createMemberWithProfileRole({
      email: values.email,
      userRole: values.userRole,
      authActiveProfileId,
    });

    clearField(result);

    if (result.success) {
      toast.success(`Member with email ${values.email} and role ${values.userRole} created successfully!`);
    } else {
      toast.error(`Failed to create member: ${result.message}`);
    }
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col justify-start gap-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <FormField
          control={control}
          name='email'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-2'>
              <FormLabel className='text-base-semibold text-light-2'>
                Email
              </FormLabel>
              <FormControl>
                <Input
                  type='email'
                  className='account-form_input no-focus'
                  placeholder="Email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name='userRole'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-2'>
              <FormLabel className='text-base-semibold text-light-2'>
                UserRole
              </FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Role" />
                    <SelectContent>
                      {userRoles.map((role) => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </SelectTrigger>
                </Select>
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

export default AddNewUser;
