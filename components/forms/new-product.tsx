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
import { fetchAllPromotion, insertNewProduct, updateProduct } from "@/lib/actions/admin.actions";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface Props {
  btnTitle: string;
  authenticatedUserId: string;
  productDetails?: {
    id: string;
    name: string;
    price: number;
    description: string;
    category: string;
    availablePromo: string;
    stripeProductId: string;
    monthlyDiscount: number;
    annualDiscount: number;
    limitedCard: number;
    limitedIP: number;
    features: { name: string }[];
  };
}

interface Promotion {
  name: string;
  code: string;
  discount: number;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  limitedQuantity: number;
}

const AddNewProduct = ({ btnTitle, authenticatedUserId, productDetails }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const isEditMode = Boolean(productDetails);

  const [promotions, setPromotions] = useState<Promotion[]>([]);

  useEffect(() => {
    const loadPromotions = async () => {
      try {
        const result = await fetchAllPromotion();
        if (result.success) {
          setPromotions(result.data || []);
        } else {
          toast.error("Failed to fetch promotions.");
        }
      } catch (error: any) {
        toast.error("Error loading promotions: " + error.message);
      }
    };
    loadPromotions();
  }, []);

  const form = useForm<z.infer<typeof ProductValidation>>({
    resolver: zodResolver(ProductValidation),
    defaultValues: {
      name: productDetails?.name ? productDetails.name : '',
      price: productDetails?.price ? productDetails.price : 0,
      description: productDetails?.description ? productDetails.description : '',
      category: productDetails?.category ? productDetails.category : '',
      availablePromo: productDetails?.availablePromo ? productDetails.availablePromo : '',
      stripeProductId: productDetails?.stripeProductId ? productDetails.stripeProductId : '',
      monthlyDiscount: productDetails?.monthlyDiscount ? productDetails.monthlyDiscount : 0,
      annualDiscount: productDetails?.annualDiscount ? productDetails.annualDiscount : 0,
      limitedCard: productDetails?.limitedCard ? productDetails.limitedCard : 10,
      limitedIP: productDetails?.limitedIP ? productDetails.limitedIP : 1,
      features: productDetails?.features?.map(feature => (
        { name: feature.name }
      )) || [{ name: '' }],
    },
  });

  const { control, handleSubmit, register, resetField, setValue } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'features',
  });

  function clearField(result: any) {
    resetField("name");
    resetField("price");
    resetField("description");
    resetField("category");
    resetField("availablePromo");
    resetField("stripeProductId");
    resetField("monthlyDiscount");
    resetField("annualDiscount");
    resetField("limitedCard");
    resetField("limitedIP");
    resetField("features");
  }

  const onSubmit = async (values: z.infer<typeof ProductValidation>) => {
    let result;
    if (isEditMode && productDetails) {
      console.log("values", values);

      result = await updateProduct({
        ...values,
        productId: productDetails.id,
        authenticatedUserId,
        path: pathname,
      });
    } else {
      result = await insertNewProduct({
        name: values.name,
        price: values.price,
        description: values.description,
        category: values.category,
        availablePromo: values.availablePromo,
        stripeProductId: values.stripeProductId,
        monthlyDiscount: values.monthlyDiscount,
        annualDiscount: values.annualDiscount,
        limitedCard: values.limitedCard,
        limitedIP: values.limitedIP,
        features: values.features,
        authenticatedUserId,
        path: pathname,
      });
    }

    clearField(result);

    if (result.success) {
      toast.success(`Product ${productDetails?.name} ${isEditMode ? 'updated' : 'added'} successfully!`);
      router.push("/dashboard/products");
    } else {
      toast.error(`Failed to ${isEditMode ? 'update' : 'add'} product: ${result.message}`);
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
          name='category'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-2'>
              <FormLabel className='text-base-semibold text-light-2'>
                Category
              </FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="organization">Organization</SelectItem>
                  </SelectContent>
                </Select>
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
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Promotion" />
                  </SelectTrigger>
                  <SelectContent>
                    {promotions.length > 0 ? (
                      promotions.map((promo) => (
                        <SelectItem key={promo.name} value={promo.name}>{promo.name}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-promotions" disabled>No Promotions Available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name='stripeProductId'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-2'>
              <FormLabel className='text-base-semibold text-light-2'>
                Stripe Product ID
              </FormLabel>
              <FormControl>
                <Input
                  type='string'
                  className='account-form_input no-focus'
                  placeholder="stripe_product_id"
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
            name='monthlyDiscount'
            render={({ field }) => (
              <FormItem className='flex w-full flex-col gap-2'>
                <FormLabel className='text-base-semibold text-light-2'>
                  Monthly Discount
                </FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    className='account-form_input no-focus'
                    placeholder="0"
                    {...field}
                    onChange={(e) => setValue('monthlyDiscount', parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name='annualDiscount'
            render={({ field }) => (
              <FormItem className='flex w-full flex-col gap-2'>
                <FormLabel className='text-base-semibold text-light-2'>
                  Annual Discount
                </FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    className='account-form_input no-focus'
                    placeholder="0"
                    {...field}
                    onChange={(e) => setValue('annualDiscount', parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
