"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";

import { PromotionValidation } from "@/lib/validations/promotion";
import { InsertNewPromotion } from "@/lib/actions/admin.actions";
import { toast } from "sonner";
import { useState } from "react";

interface Props {
  btnTitle: string;
  authenticatedUserId: string;
}

const AddNewPromotion = ({ btnTitle, authenticatedUserId }: Props) => {
  const form = useForm<z.infer<typeof PromotionValidation>>({
    resolver: zodResolver(PromotionValidation),
    defaultValues: {
      name: '',
      code: '',
      discount: 0,
      dateRange: { startDate: new Date(), endDate: new Date() },
      limitedQuantity: 1,
    },
  });

  const { control, handleSubmit, resetField, setValue } = form;

  const onSubmit = async (values: z.infer<typeof PromotionValidation>) => {
    const result = await InsertNewPromotion({
      name: values.name,
      code: values.code,
      discount: values.discount,
      dateRange: {
        startDate: values.dateRange.startDate,
        endDate: values.dateRange.endDate,
      },
      limitedQuantity: values.limitedQuantity,
      authenticatedUserId: authenticatedUserId,
    });

    if (result.success) {
      resetField("name");
      resetField("code");
      resetField("discount");
      resetField("dateRange");
      resetField("limitedQuantity");
      
      toast.success("Promotion added successfully");
    }else{
      toast.error("Failed to add Promotion: " + result.message);
    }
  };

  const [isPickingStartDate, setIsPickingStartDate] = useState(true);

  const onSelectDate = (selectedDate: Date) => {
    if (isPickingStartDate && selectedDate >= new Date()) {
      setValue("dateRange.startDate", selectedDate);
      setValue("dateRange.endDate", selectedDate);
      setIsPickingStartDate(false);
    } else {
      if (selectedDate < form.getValues("dateRange.startDate")) {
        toast.error("Please select a valid date.");
        setValue("dateRange.startDate", new Date());
        setValue("dateRange.endDate", new Date());
        setIsPickingStartDate(true);
      } else {
        setValue("dateRange.endDate", selectedDate);
        setIsPickingStartDate(true);
      }
    }
  };

  return (
    <Form {...form}>
      <form
        className='flex flex-col justify-start gap-4'
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
                  type='text'
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
          name='code'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-2'>
              <FormLabel className='text-base-semibold text-light-2'>
                Promo Code
              </FormLabel>
              <FormControl>
                <Input
                  type='text'
                  className='account-form_input no-focus'
                  placeholder="Change Later"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name='discount'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-2'>
              <FormLabel className='text-base-semibold text-light-2'>
                Discount(%)
              </FormLabel>
              <FormControl>
                <input
                  type='number'
                  className='account-form_input no-focus px-3 py2 h-10 rounded-md w-full'
                  placeholder="0"
                  min={0}
                  {...field}
                  onChange={(e) => setValue('discount', parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="dateRange"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-2">
              <FormLabel>Promotion Start & End Date</FormLabel>
              <Popover modal={true}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-center text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value.startDate && field.value.endDate ? (
                      <>
                        {format(field.value.startDate, "LLL dd, yyyy")} - {" "}
                        {format(field.value.endDate, "LLL dd, yyyy")}
                      </>
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar
                    initialFocus
                    mode="single"
                    defaultMonth={field.value.startDate}
                    onSelect={onSelectDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name='limitedQuantity'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-2'>
              <FormLabel className='text-base-semibold text-light-2'>
                Pax
              </FormLabel>
              <FormControl>
                <input
                  type='number'
                  className='account-form_input no-focus px-3 py2 h-10 rounded-md w-full'
                  placeholder="1"
                  min={1}
                  {...field}
                  onChange={(e) => setValue('limitedQuantity', parseInt(e.target.value) || 1)}
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

export default AddNewPromotion;
