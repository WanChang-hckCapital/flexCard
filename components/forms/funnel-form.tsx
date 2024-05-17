'use client'
import React, { useEffect } from 'react'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useForm } from 'react-hook-form'
import CardMongodb from '@/lib/models/card'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'

import { Button } from '../ui/button'
// import { CreateFunnelFormSchema } from '@/lib/types'
// import { saveActivityLogsNotification, upsertFunnel } from '@/lib/queries'
import { v4 } from 'uuid'
import { toast } from '../ui/use-toast'
// import { useModal } from '@/providers/modal-provider'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
// import FileUpload from '../global/file-upload'
import Loading from '../shared/loading'
import { useModal } from '@/lib/providers/modal-provider'
import { CreateCardFormSchema } from '@/lib/workspace/types'

interface CreateCardProps {
  defaultData?: typeof CardMongodb
  authaccoundId: string
}

//CHALLENGE: Use favicons

const NewCardForm: React.FC<CreateCardProps> = ({
  defaultData,
  authaccoundId,
}) => {
  const { setClose } = useModal()
  const router = useRouter()
  const form = useForm<z.infer<typeof CreateCardFormSchema>>({
    mode: 'onChange',
    resolver: zodResolver(CreateCardFormSchema),
    defaultValues: {
      name: '',
      // description: defaultData?.description || '',
      description: '',

    },
  })

  useEffect(() => {
    if (defaultData) {
      form.reset({
        description: '',
        name: '',
      })
    }
  }, [defaultData])

  const isLoading = form.formState.isLoading

  const onSubmit = async (values: z.infer<typeof CreateCardFormSchema>) => {
    if (!authaccoundId) return
    // const response = await upsertFunnel(
    //   authaccoundId,
    //   { ...values, liveProducts: defaultData?.liveProducts || '[]' },
    //   defaultData?.id || v4()
    // )
    // await saveActivityLogsNotification({
    //   agencyId: undefined,
    //   description: `Update Card | ${response.name}`,
    //   authaccoundId: authaccoundId,
    // })
    // if (response)
    //   toast({
    //     title: 'Success',
    //     description: 'Saved Card details',
    //   })
    // else
    //   toast({
    //     variant: 'destructive',
    //     title: 'Oppse!',
    //     description: 'Could not save card details',
    //   })
    setClose()
    router.refresh()
  }
  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>Card Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              disabled={isLoading}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Name"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              disabled={isLoading}
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us a little bit more about this card."
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {/* <FormField
              disabled={isLoading}
              control={form.control}
              name="subDomainName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sub domain</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Sub domain for funnel"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              disabled={isLoading}
              control={form.control}
              name="favicon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Favicon</FormLabel>
                  <FormControl>
                    <FileUpload
                      apiEndpoint="subaccountLogo"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
            <Button
              className="w-20 mt-4"
              disabled={isLoading}
              type="submit"
            >
              {form.formState.isSubmitting ? <Loading /> : 'Save'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default NewCardForm
