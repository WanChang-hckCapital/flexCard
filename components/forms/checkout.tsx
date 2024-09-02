'use client';

import React, { useState } from 'react';
import { Product } from '@/types';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import CheckoutForm from './checkout-form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '../ui/card';
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from '@/components/ui/select';
import CheckoutECPayForm from './checkout-ecpay-form';
import CheckoutLinePayForm from './checkout-linepay-form';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

interface CheckoutComponentProps {
    product: Product;
    productId: string;
    authActiveProfileId: string;
}

const CheckoutComponent: React.FC<CheckoutComponentProps> = ({ product, productId, authActiveProfileId }) => {
    const [paidTerms, setPaidTerms] = useState("1");

    const calculateDiscount = (price: number, terms: number, discountRate: number) => {
        return price * terms * (discountRate / 100);
    };

    const calculateTotal = (price: number, terms: number, discount: number) => {
        return price * terms - discount;
    };

    const discountRate = paidTerms === "1" ? product.monthlyDiscount : product.annualDiscount;
    const discount = calculateDiscount(product.price, Number(paidTerms), discountRate);
    const total = calculateTotal(product.price, Number(paidTerms), discount);

    return (
        <Elements stripe={stripePromise}>
            <div className='sm:w-[95%] md:w-[80%] lg:w-[70%] m-auto'>
                <h1 className="text-[28px] font-bold mb-6">Checkout</h1>
                <div className="flex flex-col lg:flex-row lg:justify-between p-8 bg-neutral-900 rounded-lg shadow-lg text-black">
                    <div className="lg:w-3/5">
                        <Card>
                            <CardHeader className="pb-2 mb-4">
                                <CardDescription className="text-slate-300 font-semibold">Payment Option</CardDescription>
                                <CardDescription className="text-slate-300 mb-4">Select your preferred payment method. Kindly note that paid licenses are not refundable.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Tabs className="w-full" defaultValue="card">
                                    <TabsList className='w-full text-white'>
                                        <TabsTrigger value="card">
                                            Credit Card
                                        </TabsTrigger>
                                        <TabsTrigger value="ecpay">EC Pay</TabsTrigger>
                                        <TabsTrigger value="linepay">Line Pay</TabsTrigger>
                                    </TabsList>
                                    <div className="mb-6 mt-4">
                                        <label htmlFor="paidTerms" className="block mb-2 text-white">Select Paid Terms:</label>
                                        <Select value={paidTerms} onValueChange={value => setPaidTerms(value)}>
                                            <SelectTrigger className="w-full p-2 border rounded text-white">
                                                <SelectValue placeholder="Select terms" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">Monthly</SelectItem>
                                                <SelectItem value="12">Annually</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <TabsContent value="card">
                                        <CheckoutForm
                                            product={product}
                                            productId={productId}
                                            authActiveProfileId={authActiveProfileId}
                                            totalAmount={total}
                                            paidTerms={paidTerms}
                                            isSubscription={true}
                                        />
                                    </TabsContent>
                                    <TabsContent value="ecpay">
                                        <CheckoutECPayForm
                                            productId={productId}
                                            authActiveProfileId={authActiveProfileId}
                                            totalAmount={total}
                                        // paidTerms={paidTerms}
                                        />
                                        {/* <TestForm /> */}
                                    </TabsContent>
                                    <TabsContent value="linepay">
                                        <CheckoutLinePayForm
                                            productId={productId}
                                            authActiveProfileId={authActiveProfileId}
                                            totalAmount={total}
                                        // paidTerms={paidTerms}
                                        />
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="lg:w-2/5 lg:ml-8 mt-8 lg:mt-0">
                        <Card>
                            <CardHeader className="pb-2 font-semibold mb-4">
                                <CardDescription className="text-slate-300">Order Summary</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-slate-300 mb-4">
                                    <div className="flex justify-between">
                                        <div>{product.name}</div>
                                        <div>${product.price}</div>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <div>Paid Terms</div>
                                        <div>{paidTerms == "1" ? "Monthly" : "Annually"}</div>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <div>Sub-total</div>
                                        <div>${product.price * Number(paidTerms)}</div>
                                    </div>
                                </div>
                                <div className="flex justify-between text-sm text-slate-300 mb-4">
                                    <div>Discount ({discountRate}%)</div>
                                    <div>${discount.toFixed(2)}</div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <div className="flex w-full justify-between text-slate-300 font-semibold">
                                    <div>Total</div>
                                    <div>${total.toFixed(2)}</div>
                                </div>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </Elements>
    );
};

export default CheckoutComponent;