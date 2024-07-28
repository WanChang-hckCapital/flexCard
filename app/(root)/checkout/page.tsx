import { fetchProductById } from "@/lib/actions/admin.actions";
import { Product } from "@/types";
import CheckoutComponent from "@/components/forms/checkout";
import { toast } from "sonner";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/utils/authOptions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface CheckoutPageProps {
  searchParams: {
    productId: string;
  };
}

const CheckoutPage = async ({ searchParams }: CheckoutPageProps) => {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) {
    redirect("/sign-in");
  }

  const authenticatedUserId = user.id;

  const productId = searchParams.productId;

  if (!productId) {
    toast.error("Product not found");
  }

  const product: Product = await fetchProductById(productId);

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-[90vh] content-center">
      <CheckoutComponent
        product={product}
        productId={productId}
        authenticatedUserId={authenticatedUserId}
      />
    </div>
  );
};

export default CheckoutPage;
