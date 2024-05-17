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
import { InsertNewProduct } from "@/lib/actions/admin.actions";

interface Props {
  btnTitle: string;
  authenticatedUserId: string;
}

const AddNewProduct = ({ btnTitle, authenticatedUserId }: Props) => {
  const form = useForm<z.infer<typeof ProductValidation>>({
    resolver: zodResolver(ProductValidation),
    defaultValues: {
      name: '',
      price: 0,
      description: '',
      availablePromo: '',
      limitedCard: 10,
      limitedIP: 1,
      features: [{ name: '' }],
    },
  });

  const { control, handleSubmit, register, resetField, setValue } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'features',
  });

  const onSubmit = async (values: z.infer<typeof ProductValidation>) => {
    const result = await InsertNewProduct({
      name: values.name,
      price: values.price,
      description: values.description,
      availablePromo: values.availablePromo,
      limitedCard: values.limitedCard,
      limitedIP: values.limitedIP,
      features: values.features,
      authenticatedUserId,
    });

    if (result.success) {
      resetField("name");
      resetField("price");
      resetField("description");
      resetField("availablePromo");
      resetField("limitedCard");
      resetField("limitedIP");
      resetField("features");
      toast.success("Product added successfully");
    }else{
      toast.error("Failed to add product: " + result.message);
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
          name='name'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-2'>
              <FormLabel className='text-base-semibold text-light-2'>
                Name
              </FormLabel>
              <FormControl>
                <Input
                  type='string'
                  className='account-form_input no-focus'
                  placeholder="Name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name='price'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-2'>
              <FormLabel className='text-base-semibold text-light-2'>
                Price
              </FormLabel>
              <FormControl>
                <Input
                  type='number'
                  className='account-form_input no-focus'
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => setValue('price', parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name='description'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-2'>
              <FormLabel className='text-base-semibold text-light-2'>
                Description
              </FormLabel>
              <FormControl>
                <textarea
                  rows={3}
                  className='account-form_input no-focus'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name='availablePromo'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-2'>
              <FormLabel className='text-base-semibold text-light-2'>
                Promotion
              </FormLabel>
              <FormControl>
                <Input
                  type='string'
                  className='account-form_input no-focus'
                  placeholder="Promotion"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-row gap-4">
          <FormField
            control={control}
            name='limitedCard'
            render={({ field }) => (
              <FormItem className='flex w-full flex-col gap-2'>
                <FormLabel className='text-base-semibold text-light-2'>
                  Limited Card
                </FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    className='account-form_input no-focus'
                    placeholder="10"
                    {...field}
                    onChange={(e) => setValue('limitedCard', parseInt(e.target.value) || 10)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name='limitedIP'
            render={({ field }) => (
              <FormItem className='flex w-full flex-col gap-2'>
                <FormLabel className='text-base-semibold text-light-2'>
                  Limited IP
                </FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    className='account-form_input no-focus'
                    placeholder="1"
                    {...field}
                    onChange={(e) => setValue('limitedIP', parseInt(e.target.value) || 1)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col gap-4">
          <FormLabel className='text-base-semibold text-light-2'>
            Features
          </FormLabel>
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-4">
              <Input
                {...register(`features.${index}.name`)}
                type="text"
                className="flex-1 account-form_input no-focus"
                placeholder="Feature"
              />
              <Button type="button" onClick={() => remove(index)} className="bg-red-500">
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            onClick={() => {
              append({ name: '' });
            }}
            className="bg-green-500"
          >
            Add Feature
          </Button>
        </div>

        <Button type='submit' className='bg-primary-500'>
          {btnTitle}
        </Button>
      </form>
    </Form>
  );
};

export default AddNewProduct;
