'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import axios from 'axios';
import LoadingModal from '../modal/loading-modal';
import { storeSubscription } from '@/lib/actions/admin.actions';

interface CheckoutLinePayFormProps {
    productId: string;
    authenticatedUserId: string;
    totalAmount: number;
    // paidTerms: string;
}

const CheckoutLinePayForm: React.FC<CheckoutLinePayFormProps> = ({ productId, authenticatedUserId, totalAmount }) => {
    const [error, setError] = useState<string | null>(null);
    const [termsCondition, setTermsCondition] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLinePayment = async () => {
        if (!termsCondition) {
            setError("You must agree to the terms and conditions before proceeding.");
            return;
        }

        setLoading(true);

        try {
            const subscription = await storeSubscription({
                authenticatedUserId,
                productId,
                // paidTerms: Number(paidTerms),
                paidTerms: 1,
                totalAmount,
            });

            console.log("subscription: " + JSON.stringify(subscription));
            console.log("authenticatedUserId: " + authenticatedUserId);

            if (subscription.success) {
                const { data } = await axios.post('/api/linepay/createPayment', {
                    amount: totalAmount,
                    orderId: subscription.data,
                    description: 'Test Transaction',
                    // memberId: authenticatedUserId,
                    // paidTerms,
                });

                console.log("data: " + JSON.stringify(data));

                if (data.success) {
                    window.location.href = data.paymentUrl;
                } else {
                    setError('Payment initiation failed. Please try again.');
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
            <div className="mb-4">
                <label className="flex items-center text-white mb-4">
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
                variant="green"
                className='w-full'
                onClick={handleLinePayment}
                disabled={loading}
            >
                Proceed to Line Pay
            </Button>
        </>
    );
};

export default CheckoutLinePayForm;
