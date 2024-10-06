"use client"

import * as React from "react";
import { useRouter } from "next/navigation";
import { TiTick } from "react-icons/ti";
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

const ProductList = ({ products, isOrganization, dict }: any) => {
    const router = useRouter();

    const personalProducts = products.filter((product: any) => product.category === 'personal');
    const organizationProducts = products.filter((product: any) => product.category === 'organization');

    const handleChoosePlanClick = (productId: string) => {
        if (isOrganization === false) {
            toast.error('Please join as an organization to choose this plan.');
            setTimeout(() => {
                router.push('/sign-up-organization');
            }, 1500);
        } else {
            router.push(`/checkout?productId=${productId}`);
        }
    };

    const renderProducts = (productList: any[], isOrganizationCategory: boolean) => (
        productList.map((product, index) => (
            <Card key={product._id} className={`dark:bg-gray-900 p-6 w-[336px] rounded-lg shadow-lg ${index === 1 ? 'border-2 dark:border-purple-600' : ''}`}>
                <CardHeader className="mb-6 p-0">
                    {index === 1 && (
                        <div className="text-sm dark:text-purple-400 text-stone-400 mb-2">{dict.productList.mostPopular}</div>
                    )}
                    <CardTitle className="text-[2xl] font-bold">{product.name}</CardTitle>
                    <CardDescription className="text-gray-400 mt-2">{product.description}</CardDescription>
                    <div className="text-center text-4xl font-bold !mt-8 mb-4">$
                        <span className="text-[36px]">
                            {product.price}
                        </span>
                        /{dict.productList.month}
                    </div>
                </CardHeader>
                <CardContent className="px-0 pt-0 pb-6">
                    {isOrganizationCategory ? (
                        <Button
                            className={`rounded-lg w-full`}
                            variant={`${index === 1 ? 'purple' : 'outline'}`}
                            onClick={() => handleChoosePlanClick(product._id)}
                        >
                            {dict.productList.choosePlan}
                        </Button>
                    ) : (
                        <Link className="w-full" href={`/checkout?productId=${product._id}`}>
                            <Button
                                className={`rounded-lg w-full`}
                                variant={`${index === 1 ? 'purple' : 'outline'}`}
                            >
                                {dict.productList.choosePlan}
                            </Button>
                        </Link>
                    )}
                </CardContent>
                <hr className="h-1 text-slate-800"></hr>
                <CardFooter className="flex mt-6 p-0">
                    <ul className="space-y-2 text-left">
                        {product.features.map((feature: any, featureIndex: number) => (
                            <li key={featureIndex} className="flex items-center">
                                <TiTick className="mr-2 text-green-500" />
                                {feature.name}
                            </li>
                        ))}
                    </ul>
                </CardFooter>
            </Card>
        ))
    );

    return (
        <Tabs defaultValue="personal" className="justify-center">
            <div className="flex justify-center">
                <TabsList className="flex justify-center mb-8 w-[336px] text-[14px]">
                    <TabsTrigger value="personal" className="px-4 py-2">{dict.productList.personal}</TabsTrigger>
                    <TabsTrigger value="organization" className="px-4 py-2">{dict.productList.organization}</TabsTrigger>
                </TabsList>
            </div>
            <TabsContent value="personal" className="flex flex-col lg:flex-row justify-center space-y-6 lg:space-y-0 lg:space-x-6">
                {renderProducts(personalProducts, false)}
            </TabsContent>
            <TabsContent value="organization" className="flex flex-col lg:flex-row justify-center space-y-6 lg:space-y-0 lg:space-x-6">
                {renderProducts(organizationProducts, true)}
            </TabsContent>
        </Tabs>
    );
};

export default ProductList;
