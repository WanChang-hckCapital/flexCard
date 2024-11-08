'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import axios from 'axios';
import LoadingModal from '../modal/loading-modal';
import { storeSubscription } from '@/lib/actions/admin.actions';

interface CheckoutECPayFormProps {
    productId: string;
    authActiveProfileId: string;
    totalAmount: number;
    paidTerms: string;
}

const CheckoutECPayForm: React.FC<CheckoutECPayFormProps> = ({ productId, totalAmount, authActiveProfileId, paidTerms }) => {
    const [error, setError] = useState<string | null>(null);
    const [termsCondition, setTermsCondition] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleECPayPayment = async () => {
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
                // paidTerms: 1,
                totalAmount,
            });
    
            console.log("subscription: " + JSON.stringify(subscription));
            console.log("authActiveProfileId: " + authActiveProfileId);
    
            if (subscription.success) {
                const { data } = await axios.post('/api/ecpay/createPayment', {
                    amount: totalAmount,
                    orderId: subscription.data,
                    // orderId: "abc12345678",
                    description: 'Test Transaction',
                    interval: paidTerms, 
                });
    
                if (data.success) {
                    const form = document.createElement('form');
                    form.method = 'post';
                    form.action = 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5';
    
                    Object.keys(data.tradeInfo).forEach((key) => {
                        const input = document.createElement('input');
                        input.name = key;
                        input.value = data.tradeInfo[key];
                        form.appendChild(input);
                    });
    
                    const checkMacValueInput = document.createElement('input');
                    checkMacValueInput.name = 'CheckMacValue';
                    checkMacValueInput.value = data.checkMacValue;
                    form.appendChild(checkMacValueInput);
    
                    document.body.appendChild(form);
    
                    form.submit();
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
                variant="purple"
                className='w-full'
                onClick={handleECPayPayment}
                disabled={loading}
            >
                Proceed to EC Pay
            </Button>
        </>
    );
};

export default CheckoutECPayForm;

// 'use client';

// import React, { useState } from 'react';
// import { Button } from "@/components/ui/button";
// import axios from 'axios';
// import LoadingModal from '../modal/loading-modal';
// import { storeSubscription } from '@/lib/actions/admin.actions';

// interface CheckoutECPayFormProps {
//     productId: string;
//     authActiveProfileId: string;
//     totalAmount: number;
//     paidTerms: string;
// }

// const CheckoutECPayForm: React.FC<CheckoutECPayFormProps> = ({ productId, totalAmount, authActiveProfileId, paidTerms }) => {
//     const [error, setError] = useState<string | null>(null);
//     const [termsCondition, setTermsCondition] = useState(false);
//     const [loading, setLoading] = useState(false);

//     const [cardNumber, setCardNumber] = useState('');
//     const [cardExpiry, setCardExpiry] = useState('');
//     const [cardCVV, setCardCVV] = useState('');

//     const handleECPayPayment = async () => {
//         if (!termsCondition) {
//             setError("You must agree to the terms and conditions before proceeding.");
//             return;
//         }

//         if (!cardNumber || !cardExpiry || !cardCVV) {
//             setError('Please provide all the required credit card information.');
//             return;
//         }

//         setLoading(true);

//         try {
//             const subscription = await storeSubscription({
//                 authActiveProfileId,
//                 productId,
//                 paidTerms: Number(paidTerms),
//                 totalAmount,
//             });
    
//             console.log("Subscription: " + JSON.stringify(subscription));
//             console.log("authActiveProfileId: " + authActiveProfileId);
    
//             if (subscription.success) {
//                 const { data } = await axios.post('/api/ecpay/processPayment', {
//                     cardNumber,
//                     cardExpiry,
//                     cardCVV,
//                     totalAmount,
//                     orderId: subscription.data,
//                     description: 'Test Transaction',
//                     interval: paidTerms, 
//                 });
    
//                 if (data.success) {
//                     window.location.href = `/order-status?orderId=${subscription.data}&transactionId=${data.transactionId}`;
//                 } else {
//                     setError('Payment failed. Please try again.');
//                 }
//             }
//         } catch (error) {
//             console.error('Payment initiation failed', error);
//             setError('Payment initiation failed. Please try again.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <>
//             <LoadingModal isOpen={loading} />
//             <div className="mb-4">
//                 <label className="flex items-center text-white mb-4">
//                     <input
//                         type="checkbox"
//                         checked={termsCondition}
//                         onChange={(e) => setTermsCondition(e.target.checked)}
//                         className="mr-2"
//                     />
//                     By clicking this you agree to our &nbsp; <a href="#" className="text-blue">terms and conditions</a>
//                 </label>
//             </div>

//             <div className="mb-4">
//                 <input
//                     type="text"
//                     value={cardNumber}
//                     onChange={(e) => setCardNumber(e.target.value)}
//                     placeholder="Card Number"
//                     className="w-full p-2 mb-2"
//                 />
//                 <input
//                     type="text"
//                     value={cardExpiry}
//                     onChange={(e) => setCardExpiry(e.target.value)}
//                     placeholder="Expiry Date (MMYY)"
//                     className="w-full p-2 mb-2"
//                 />
//                 <input
//                     type="text"
//                     value={cardCVV}
//                     onChange={(e) => setCardCVV(e.target.value)}
//                     placeholder="CVV"
//                     className="w-full p-2 mb-2"
//                 />
//             </div>

//             {error && <p className="text-red-500 my-4 text-center">{error}</p>}
//             <Button
//                 variant="purple"
//                 className='w-full'
//                 onClick={handleECPayPayment}
//                 disabled={loading}
//             >
//                 Proceed with Payment
//             </Button>
//         </>
//     );
// };

// export default CheckoutECPayForm;
