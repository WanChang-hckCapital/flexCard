'use client';

import React, { useState } from 'react';
import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";
import { Product } from '@/types';
import axios from 'axios';
import { storeSubscription } from '@/lib/actions/admin.actions';
import LoadingModal from '../modal/loading-modal';
import { useTheme } from '@/app/context/theme-context';

interface CheckoutFormProps {
    product: Product;
    productId: string;
    authActiveProfileId: string;
    totalAmount: number;
    paidTerms: string;
    isSubscription: boolean;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ product, productId, authActiveProfileId, totalAmount, paidTerms, isSubscription }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState<string | null>(null);
    const [termsCondition, setTermsCondition] = useState(false);
    const [loading, setLoading] = useState(false);
    const { theme } = useTheme();

    const isDarkMode = theme === "dark" || (theme === "system" && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const stripeElementOptions = {
        style: {
            base: {
                color: isDarkMode ? '#ffffff' : '#000000',
                '::placeholder': {
                    color: isDarkMode ? '#aab7c4' : '#666666',
                },
            },
            invalid: {
                color: '#fa755a',
                iconColor: '#fa755a',
            },
        },
    };

    const handlePayment = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!termsCondition) {
            setError("You must agree to the terms and conditions before proceeding.");
            return;
        }

        setLoading(true);

        try {
            const subscription = await storeSubscription({
                authActiveProfileId,
                productId,
                paidTerms: Number(paidTerms),
                totalAmount,
            });

            if (subscription.success) {
                const { data } = isSubscription
                    ? await axios.post('/api/stripe/createSubscription', {
                        profileId: authActiveProfileId,
                        stripeProductId: product.stripeProductId,
                        interval: paidTerms === "1" ? 'month' : 'year',
                    })
                    : await axios.post('/api/stripe/createPayment', {
                        amount: totalAmount,
                        orderId: subscription.data,
                        description: product?.description,
                    });

                const { client_secret } = data;

                if (!stripe || !elements) return;

                const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
                    payment_method: {
                        card: elements.getElement(CardNumberElement)!,
                    },
                });

                if (error) {
                    setError(error.message || 'Payment failed. Please try again.');
                } else if (paymentIntent) {
                    if (!data.subscriptionId) {
                        throw new Error('Subscription ID not found: ' + JSON.stringify(data));
                    }
                    window.location.href = `/api/stripe/createPayment?transactionId=${paymentIntent.id}&orderId=${subscription.data}&subscriptionId=${data.subscriptionId}`;
                }
            }
        } catch (error) {
            console.error('Payment initiation failed', error);
            setError('Payment initiation failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <LoadingModal isOpen={loading} />
            <form onSubmit={handlePayment}>
                <div className="mb-4">
                    <label htmlFor="cardNumber" className={`block mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>Card Number</label>
                    <CardNumberElement id="cardNumber" className="p-2 border border-white rounded w-full" options={stripeElementOptions} />
                </div>
                <div className='flex flex-row gap-8 w-full'>
                    <div className="mb-4 w-full">
                        <label htmlFor="cardExpiry" className={`block mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>Expiration Date</label>
                        <CardExpiryElement id="cardExpiry" className="p-2 border border-white rounded w-full" options={stripeElementOptions} />
                    </div>
                    <div className="mb-4 w-full">
                        <label htmlFor="cardCvc" className={`block mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>CVC</label>
                        <CardCvcElement id="cardCvc" className="p-2 border border-white rounded w-full" options={stripeElementOptions} />
                    </div>
                </div>
                <div className="mb-[48px]">
                    <label className={`flex items-center ${isDarkMode ? 'text-white' : 'text-black'} mb-4`}>
                        <input
                            type="checkbox"
                            checked={termsCondition}
                            onChange={(e) => setTermsCondition(e.target.checked)}
                            className="mr-2"
                        />
                        By clicking this you have agreed to our &nbsp; <a href="#" className="text-blue">terms and conditions</a>
                    </label>
                </div>
                {error && <p className="text-red-500 my-4 text-center">{error}</p>}
                <Button
                    variant="purple"
                    className='w-full'
                    type="submit"
                    disabled={!stripe}
                >
                    Place Order
                </Button>
            </form>
        </>
    );
};

export default CheckoutForm;
