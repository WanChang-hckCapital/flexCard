'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

export default function ContactForm({dict}: any) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        message: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        console.log('Form Submitted', formData);
    };

    return (
        <div className="flex justify-between gap-8 w-full max-w-6xl">
            <div className="flex-1">
                <h1 className="text-[48px] font-bold text-black dark:text-white mb-4">{dict.contactUs.title}</h1>
                <p className="dark:text-gray-400">{dict.contactUs.description}</p>
                <p className="mt-4 dark:text-gray-400">{dict.contactUs.email}</p>
                <a href="#" className="text-blue-500 dark:text-blue-300 underline mt-2 block">{dict.contactUs.customerSupport}</a>
                <div className="mt-8 space-y-4 dark:text-gray-400 flex gap-6">
                    <div>
                        <h3 className="font-semibold text-lg dark:text-white mt-4">{dict.contactUs.customerSupport}</h3>
                        <p>{dict.contactUs.customerSupportDesc}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg dark:text-white">{dict.contactUs.feedback}</h3>
                        <p>{dict.contactUs.feedbackDesc}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg dark:text-white">{dict.contactUs.mediaInquiries}</h3>
                        <p>{dict.contactUs.mediaInquiriesDesc}</p>
                    </div>
                </div>
            </div>
            <Card className="flex-1 max-w-md bg-white dark:bg-slate-800">
                <CardHeader>
                    <CardTitle className="dark:text-white text-[36px]">{dict.contactUs.getInTouch.title}</CardTitle>
                    <p className="text-gray-500 dark:text-gray-400">{dict.contactUs.getInTouch.reachUs}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-4">
                        <Input
                            name="firstName"
                            placeholder={dict.contactUs.getInTouch.firstName}
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="dark:bg-slate-700 dark:text-white"
                        />
                        <Input
                            name="lastName"
                            placeholder={dict.contactUs.getInTouch.lastName}
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="dark:bg-slate-700 dark:text-white"
                        />
                    </div>
                    <Input
                        type="email"
                        name="email"
                        placeholder={dict.contactUs.getInTouch.email}
                        value={formData.email}
                        onChange={handleInputChange}
                        className="dark:bg-slate-700 dark:text-white"
                    />
                    <Input
                        type="tel"
                        name="phone"
                        placeholder={dict.contactUs.getInTouch.phone}
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="dark:bg-slate-700 dark:text-white"
                    />
                    <Textarea
                        name="message"
                        placeholder={dict.contactUs.getInTouch.messagePlaceholder}
                        value={formData.message}
                        onChange={handleInputChange}
                        maxLength={120}
                        rows={4}
                        className="dark:bg-slate-700 dark:text-white"
                    />
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button
                        className='w-full'
                        onClick={handleSubmit}
                        variant="purple">
                        {dict.contactUs.getInTouch.submitButton}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
