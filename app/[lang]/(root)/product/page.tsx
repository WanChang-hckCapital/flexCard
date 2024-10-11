import { fetchAllProduct } from '@/lib/actions/admin.actions';
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { fetchCurrentActiveProfileId, fetchProfleRole } from '@/lib/actions/user.actions';
import ProductList from '@/components/product-list';
import { authOptions } from '@/app/api/utils/authOptions';

const ProductPage = async () => {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user) {
        redirect("/sign-in");
    }

    const authenticatedUserId = user.id;
    const authActiveProfileId = await fetchCurrentActiveProfileId(authenticatedUserId);
    let products = await fetchAllProduct();

    let isOrganization = false;
    const currentProfileRole = await fetchProfleRole(authActiveProfileId);
    if (currentProfileRole.success) {
        isOrganization = currentProfileRole.data?.toUpperCase() === "ORGANIZATION";
    }

    if (products) {
        products = products.map((product: any) => {
            return {
                ...product.toObject(),
                _id: product._id.toString(),
                createdAt: product.createdAt.toISOString(),
                updatedAt: product.updatedAt.toISOString(),
            };
        });
    }

    return (
        <div className="bg-black text-white py-16 px-4 min-h-screen">
            <div className="text-center mb-8">
                <h1 className="text-[32px] font-bold">Choose your right Plan!</h1>
                <span className="text-gray-400">No hidden fees, cancel anytime.</span>
            </div>
            <ProductList products={products} isOrganization={isOrganization} />
            <div className="text-center mt-12">
                <a href="#" className="text-purple-400">Payment terms</a>
            </div>
        </div>
    );
};

export default ProductPage;
