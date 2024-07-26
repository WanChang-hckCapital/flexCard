import GetStartButton from "@/components/buttons/getstart-button";
import { TiTick } from "react-icons/ti";
import { fetchAllProduct } from '@/lib/actions/admin.actions';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ProductPage = async () => {
    const products = await fetchAllProduct();

    return (
        <div className="bg-black text-white py-16 px-4 min-h-screen">
            <div className="text-center mb-12">
                <h1 className="text-[32px] font-bold">Choose your right Plan!</h1>
                <span className="text-gray-400">No hidden fees, cancel anytime.</span>
            </div>
            <div className="flex flex-col lg:flex-row justify-center space-y-6 lg:space-y-0 lg:space-x-6">
                {products?.map((product, index) => (
                    <Card key={product._id} className={`bg-gray-900 p-6 w-[336px] rounded-lg shadow-lg ${index === 1 ? 'border-2 border-purple-600' : ''}`}>
                        <CardHeader className="mb-6 p-0">
                            {index === 1 && (
                                <div className="text-sm text-purple-400 mb-2">MOST POPULAR</div>
                            )}
                            <CardTitle className="text-[2xl] font-bold">{product.name}</CardTitle>
                            <CardDescription className="text-gray-400 mt-2">{product.description}</CardDescription>
                            <div className="text-center text-4xl font-bold !mt-8 mb-4">$
                                <span className="text-[36px]">
                                    {product.price}
                                </span>
                                /month
                            </div>
                            {/* <div className="text-sm text-gray-500">For 48 month term</div>
                            <div className="text-sm text-purple-400">+3 months FREE</div> */}
                        </CardHeader>
                        <CardContent className="px-0 pt-0 pb-6">
                            <Link className="w-full" href={`/checkout?productId=${product._id}`}>
                                <Button 
                                    className={`rounded-lg w-full`}
                                    variant={`${index === 1 ? 'purple' : 'outline'}`}>
                                    Choose Plan
                                </Button>
                            </Link>
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
                ))}
            </div>
            <div className="text-center mt-12">
                <a href="#" className="text-purple-400">Payment terms</a>
            </div>
        </div>
    );
};

export default ProductPage;
