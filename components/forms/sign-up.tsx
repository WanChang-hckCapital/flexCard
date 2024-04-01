// SignUpWithEmail.tsx

import * as z from "zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createUser } from "@/lib/actions/user.actions";
import { SignUpValidation } from "@/lib/validations/sign-up";

interface Props {
  btnTitle: string;
}

const SignUpNewUser = ({ btnTitle }: Props) => {
  const router = useRouter();
  const form = useForm<z.infer<typeof SignUpValidation>>({
    resolver: zodResolver(SignUpValidation),
  });

  const onSubmit = async (values: z.infer<typeof SignUpValidation>) => {
    const userCreated = await createUser(values.email, values.username, values.password);
    if (userCreated) {
      router.push('/');
    } else {
      console.log("Failed to create user");
    }
  };

  return (
    <Form {...form}>
      <form
        className='flex flex-col justify-start gap-4 w-80'
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-3'>
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
          name='username'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-3'>
              <FormControl>
                <Input
                  type='text'
                  className='account-form_input no-focus'
                  placeholder="Username"
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

        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-3'>
              <FormControl>
                <Input
                  type='password'
                  className='account-form_input no-focus'
                  placeholder="Re-enter Password"
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

export default SignUpNewUser;
