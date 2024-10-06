import { fetchAllProduct } from '@/lib/actions/admin.actions';
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { fetchCurrentActiveProfileId, fetchProfleRole } from '@/lib/actions/user.actions';
import ProductList from '@/components/product-list';
import { authOptions } from '@/app/api/utils/authOptions';
import { getDictionary } from '../../dictionaries';

interface ProductPageProps {
    params: {
        lang: string;
    };
}

const ProductPage = async ({ params: { lang } }: ProductPageProps) => {
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

    const dict = await getDictionary(lang);

    return (
        <div className="dark:bg-black dark:text-white text-slate-700 py-16 px-4 min-h-screen">
            <div className="text-center mb-8">
                <h1 className="text-[32px] font-bold">{dict.products.title}</h1>
                <span className="dark:text-gray-400 text-slate-400">{dict.products.subtitle}</span>
            </div>
            <ProductList products={products} isOrganization={isOrganization} dict={dict} />
            <div className="text-center mt-12">
                <a href="#" className="dark:text-purple-400 text-stone-700">{dict.products.paymentTerms}</a>
            </div>
        </div>
    );
};

export default ProductPage;
