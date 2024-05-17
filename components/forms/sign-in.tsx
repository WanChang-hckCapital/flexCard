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

import { authenticateUser } from "@/lib/actions/user.actions";
import { SignInValidation } from "@/lib/validations/sign-in";
import { signIn } from "next-auth/react";

interface Props {
//   signin: {
//     email: string;
//     password: string;
//   };
  btnTitle: string;
}

const SignInWithEmail = ({btnTitle}: Props) => {
  const router = useRouter();
  const pathname = usePathname();

  const form = useForm<z.infer<typeof SignInValidation>>({
    resolver: zodResolver(SignInValidation),
    // defaultValues: {
    //   email: signin?.email ? signin.email : "",
    //   password: signin?.password ? signin.password : "",
    // },
  });

  const onSubmit = async (values: z.infer<typeof SignInValidation>) => {
    try {
      const user = await authenticateUser(values.email, values.password);
      if (user) {
        await signIn('credentials', {
          email: values.email,
          password: values.password,
          callbackUrl: "/",
        });
        router.push('/');
      } else {
        console.log("Login Failed: Invalid credentials");
      }
    } catch (error:any) {
      console.error("Login Failed:", error.message);
    }
  };

  return (
    <Form {...form}>
      <form
        className='flex flex-col justify-start gap-4'
        onSubmit={form.handleSubmit(onSubmit)}
      >

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-3'>
              {/* <FormLabel className='text-base-semibold text-light-2'>
                Email
              </FormLabel> */}
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
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-3'>
              {/* <FormLabel className='text-base-semibold text-light-2'>
                Password
              </FormLabel> */}
              <FormControl>
                <Input
                  type='password'
                  className='account-form_input no-focus'
                  placeholder="Password"
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

export default SignInWithEmail;
