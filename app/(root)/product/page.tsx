'use client'

import GetStartButton from "@/components/buttons/getstart-button";
import SignInButton from "@/components/buttons/signin-button";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { TiTick } from "react-icons/ti";


function Product() {
    return (
        <div className="pl-4 pr-4 min-2xl:p-8 ">
            <h1 className="text-center head-text font-bold">
                Subscription Plan
            </h1>
            <div className="grid lg:grid-cols-6 md:grid-cols-4 sm:grid-cols-2 overflow-x-auto gap-3 h-full">
                <div className="mt-14 rounded-xl border border-[#4E67E5]/25 bg-[#080C23] p-6 w-full">
                    <div className="relative h-full overflow-hidden">
                        <div className="text-[#4d66e5] font-bold">Basic</div>
                        <div className="text-6xl my-5 font-light">Free</div>
                        <div>
                            Basic Feature for Personal
                        </div>
                        <ul className="mt-4 mb-12">
                            <li className="flex items-center mb-2"><TiTick className="mr-2" /> Create flexCard</li>
                            {/* <li className="flex items-center mb-2"><TiTick className="mr-2" /> Share to Friends</li> */}
                            {/* <li className="flex items-center mb-2"><TiTick className="mr-2" /> Import from JSON format</li> */}
                            {/* <li className="flex items-center mb-2"><TiTick className="mr-2" /> Generate as QRCode to share</li> */}
                            <li className="flex items-center mb-2"><TiTick className="mr-2" /> Up to 10 flexCard to save</li>
                            <li className="flex items-center mb-2"><TiTick className="mr-2" /> Up to 3 flexCard per flex message</li>
                        </ul>
                        <div className="absolute bottom-0 left-0 right-0">
                            <GetStartButton />
                        </div>
                    </div>
                </div>
                <div className="mt-14 rounded-xl border border-[#4E67E5]/25 bg-[#080C23] p-6 w-full">
                    <div className="relative h-full overflow-hidden">
                        <div className="text-[#4d66e5] font-bold">Premium</div>
                        <div className="text-6xl my-5 font-light">$1.9/month</div>
                        <div>
                            Unlock Premium Features
                        </div>
                        <ul className="mt-4 mb-12">
                            <li className="flex items-center mb-2"><TiTick className="mr-2" /> Included all Basic Features</li>
                            {/* <li className="flex items-center mb-2"><TiTick className="mr-2" /> Import data from picture</li> */}
                            <li className="flex items-center mb-2"><TiTick className="mr-2" /> Up to 100 flexCard to save</li>
                            <li className="flex items-center mb-2"><TiTick className="mr-2" /> Up to 6 flexCard per flex message</li>
                        </ul>
                        <div className="absolute bottom-0 left-0 right-0">
                            <GetStartButton />
                        </div>
                    </div>
                </div>
                <div
                    className="text-xl mt-14 rounded-xl border border-[#9966FF]/25 bg-[#120d1d] p-6 w-full"
                >
                    <div className="relative h-full overflow-hidden">
                        <div className="text-[#9967FF] font-bold">Expert</div>
                        <div className="text-6xl my-5 font-light">$9.9/month</div>
                        <div>
                            Just For Expert
                        </div>
                        <ul className="mt-4 mb-12">
                            <li className="flex items-center mb-2"><TiTick className="mr-2" /> Included all Premium Features</li>
                            <li className="flex items-center mb-2"><TiTick className="mr-2" /> Up to 1 video per flexCard</li>
                            <li className="flex items-center mb-2"><TiTick className="mr-2" /> Up to 500 flexCard to save</li>
                        </ul>
                        <div className="absolute bottom-0 left-0 right-0">
                            <GetStartButton />
                        </div>
                    </div>
                </div>
                <div
                    className="text-xl mt-14 rounded-xl border border-[#F7E16F]/25 bg-[#19170d] p-6 w-full"
                >
                    <div className="relative h-full overflow-hidden">
                        <div className="text-[#F7E16F] font-bold">Elite</div>
                        <div className="text-6xl my-5 font-light">$19.9/month</div>
                        <div>
                            Enjoy for Unlimited flexCard
                        </div>
                        <ul className="mt-4 mb-12">
                            <li className="flex items-center mb-2"><TiTick className="mr-2" /> Included all Expert Features</li>
                            <li className="flex items-center mb-2"><TiTick className="mr-2" /> Unlimited flexCard to Save</li>
                        </ul>
                        <div className="absolute bottom-0 left-0 right-0">
                            <GetStartButton />
                        </div>
                    </div>
                </div>
                <div className="text-xl mt-14 rounded-xl border border-[#4E67E5]/25 bg-[#080C23] p-6 w-full">
                    <div className="relative h-full overflow-hidden">
                        <div className="text-[#4d66e5] font-bold">Business</div>
                        <div className="text-6xl my-5 font-light">$14.9/month</div>
                        <div>
                            Just for Business
                        </div>
                        <ul className="mt-4 mb-12">
                            <li className="flex items-center mb-2"><TiTick className="mr-2" /> Included all Basic Features</li>
                            {/* <li className="flex items-center mb-2"><TiTick className="mr-2" /> Import data from picture</li> */}
                            <li className="flex items-center mb-2"><TiTick className="mr-2" /> Import Employee details from CSV</li>
                            <li className="flex items-center mb-2"><TiTick className="mr-2" /> Up to 1 video per flexCard</li>
                            <li className="flex items-center mb-2"><TiTick className="mr-2" /> Up to 6 flexCard per flex message</li>
                        </ul>
                        <div className="absolute bottom-0 left-0 right-0">
                            <GetStartButton />
                        </div>
                    </div>
                </div>
                <div className="text-xl mt-14 rounded-xl border border-[#4E67E5]/25 bg-[#080C23] p-6 w-full">
                    <div className="relative h-full overflow-hidden">
                        <div className="text-[#4d66e5] font-bold">Enterprise</div>
                        <div className="text-6xl my-5 font-light">$24.9/month</div>
                        <div>
                            Just for Enterprise
                        </div>
                        <ul className="mt-4 mb-12">
                            <li className="flex items-center mb-2"><TiTick className="mr-2" /> Included all Business Features</li>
                            <li className="flex items-center mb-2"><TiTick className="mr-2" /> Unlimited flexCard to Save</li>
                        </ul>
                        <div className="absolute bottom-0 left-0 right-0">
                            <GetStartButton />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        // continue future
        // <>
        //     <div>
        //         <h2 className="h2-bold text-dark-600">
        //             Subcription Plan
        //         </h2>
        //         <p className="p-16-regular mt-4">Choose a package that suits your needs!</p>
        //     </div>

        //     <section>
        //         <ul className="products-list">
        //             {products.map((product) => (
        //                 <li key={product.name} className="product-item">
        //                     <div className="flex-center flex-col gap-3">
        //                         <Image src={product.icon} alt="check" width={50} height={50} />
        //                         <p className="p-20-semibold mt-2 text-purple-500">
        //                             {product.name}
        //                         </p>
        //                         <p className="h1-semibold text-dark-600">${product.price}</p>
        //                     </div>

        //                     {/* Inclusions */}
        //                     <ul className="flex flex-col gap-5 py-9">
        //                         {product.descriptions.map((description) => (
        //                             <li
        //                                 key={product.name + description}
        //                                 className="flex items-center gap-4"
        //                             >
        //                                 <Image
        //                                     src='/assets/check.svg'
        //                                     alt="check"
        //                                     width={24}
        //                                     height={24}
        //                                 />
        //                                 <p className="p-16-regular">{description}</p>
        //                             </li>
        //                         ))}
        //                     </ul>

        //                     {product.price === "Free" ? (
        //                         <Button variant="outline" className="credits-btn">
        //                             Free 
        //                         </Button>
        //                     ) : (
        //                         session ? (
        //                             <Checkout
        //                                 plan={plan.name}
        //                                 amount={plan.price}
        //                                 credits={plan.credits}
        //                                 buyerId={user._id}
        //                             />
        //                         ) : (
        //                             <SignInButton />
        //                         )
                                    
        //                     )}
        //                 </li>
        //             ))}
        //         </ul>
        //     </section>
        // </>
    );
};

export default Product;