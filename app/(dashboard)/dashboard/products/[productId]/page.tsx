import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

import AddNewProduct from "@/components/forms/new-product";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { fetchProductById } from "@/lib/actions/admin.actions";
import Link from "next/link";

async function Page({ params }: { params: { productId: string } }) {

    const session = await getServerSession(authOptions)
    const user = session?.user;

    if (!user) return null;

    const productDetails = await fetchProductById(params.productId);
    const preparedProductDetails = {
        id: productDetails._id,
        name: productDetails.name,
        description: productDetails.description,
        price: productDetails.price,
        availablePromo: productDetails.availablePromo,
        limitedCard: productDetails.limitedCard,
        limitedIP: productDetails.limitedIP,
        features: productDetails.features.map((feature: any) => (
            { name: feature.name }
        ))
      };

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6 bg-neutral-900 h-screen">
            <div className="flex items-center">
                <Breadcrumb className="hidden md:flex pb-3 px-6">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/dashboard">Dashboard</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/dashboard/products">Product Plans</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href={`/dashboard/products/${preparedProductDetails.id}`}>Editing {preparedProductDetails.name}</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            <div className="bg-black border border-neutral-600 px-[25%] py-[4%] rounded-xl w-full self-center">
                <AddNewProduct btnTitle="Update" authenticatedUserId={user.id} productDetails={preparedProductDetails}></AddNewProduct>
            </div>
        </main>
    );
}

export default Page;