import { authOptions } from "@/app/api/utils/authOptions";
import AddNewProduct from "@/components/forms/new-product";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { fetchCurrentActiveProfileId } from "@/lib/actions/user.actions";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

async function Page() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) {
    redirect("/sign-in");
  }

  const authUserId = user.id.toString();
  const authActiveProfileId = await fetchCurrentActiveProfileId(authUserId);

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
                <Link href="/dashboard/products/add-new-plans">
                  Add New Products
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="bg-black border border-neutral-600 px-[25%] py-[4%] rounded-xl w-full self-center">
        <AddNewProduct
          btnTitle="Add"
          authActiveProfileId={authActiveProfileId}></AddNewProduct>
      </div>
    </main>
  );
}

export default Page;
