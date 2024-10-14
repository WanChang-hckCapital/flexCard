import { getDictionary } from "@/app/[lang]/dictionaries";
import { authOptions } from "@/app/api/utils/authOptions";
import DeleteConfirmationButton from "@/components/buttons/delete-confirmation-button";
import NavigateRouteButton from "@/components/buttons/navigate-button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { fetchAllProduct } from "@/lib/actions/admin.actions";
import { fetchCurrentActiveProfileId } from "@/lib/actions/user.actions";
import { PackageOpen, Pencil } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import * as React from "react";

async function Products({ params }: { params: { lang: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  const dict = await getDictionary(params.lang);

  if (!user) {
    redirect("/sign-in");
  }

  const authUserId = user.id.toString();
  const authActiveProfileId = await fetchCurrentActiveProfileId(authUserId);

  const products = await fetchAllProduct();

  const mainClassName =
    products && products.length > 5
      ? "flex flex-1 flex-col gap-4 p-4 lg:p-6 bg-neutral-900"
      : "flex flex-1 flex-col gap-4 p-4 lg:p-6 bg-neutral-900 h-screen";

  return (
    <main className={mainClassName}>
      <div className="flex items-center">
        <Breadcrumb className="hidden md:flex pb-3 px-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">{dict.dashboard.breadcrumb.dashboard}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard/products">{dict.dashboard.breadcrumb.product.title}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <div
              key={index}
              className="flex flex-col gap-4 p-4 bg-black border border-neutral-600 rounded-lg">
              <div className="flex row justify-between">
                <h3 className="text-lg font-bold">{product.name}</h3>
                <div className="flex flex-row gap-3">
                  <Link href={`/dashboard/products/${product.id}`}>
                    <Pencil className="w-5 h-5" />
                  </Link>
                  <DeleteConfirmationButton
                    productId={product.id}
                    authActiveProfileId={authActiveProfileId}
                  />
                </div>
              </div>
              <p className="text-sm text-slate-300">{product.description}</p>
              <div className="flex flex-col gap-2">
                <span className="text-sm text-slate-300">
                  Price: ${product.price}
                </span>
                {product.features &&
                  product.features.map((feature: any, index: any) => (
                    <li key={index} className="text-sm text-slate-300">
                      {feature.name}
                    </li>
                  ))}
                <span className="text-sm text-slate-300">
                  Features: {product.price}
                </span>
                {product.availablePromo && (
                  <span className="text-sm text-slate-300">
                    Available Promotion: {product.availablePromo}
                  </span>
                )}
                <span className="text-sm text-slate-300">
                  Card Available: {product.limitedCard}
                </span>
                <span className="text-sm text-slate-300">
                  IP Available: {product.limitedIP}
                </span>
              </div>
            </div>
          ))}
          <div className="flex flex-col gap-4 p-4 bg-black border border-neutral-600 rounded-lg text-center justify-center">
            <h3 className="text-lg font-bold">New Product</h3>
            <p className="text-sm text-slate-300">Add some new product here.</p>
            <NavigateRouteButton
              url={"/dashboard/products/add-new-plans"}
              btnName={"Add New Product"}
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-lg border border-neutral-600 shadow-sm bg-black p-[16%]">
          <div className="flex flex-col items-center gap-1 text-center">
            <PackageOpen className="w-24 h-24 max-sm:hidden" />
            <h3 className="max-sm:text-[21px] max-md:text-[26px] lg:text-[32px] font-bold tracking-tight">
              You have no products
            </h3>
            <p className="text-sm text-slate-300">
              You can start selling as soon as you add a product.
            </p>
            <NavigateRouteButton
              url={"/dashboard/products/add-new-plans"}
              btnName={"Add New Product"}
            />
          </div>
        </div>
      )}
    </main>
  );
}

export default Products;
