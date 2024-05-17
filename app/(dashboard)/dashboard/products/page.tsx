
import NavigateRouteButton from "@/components/buttons/navigate-button"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { PackageOpen } from "lucide-react"
import Link from "next/link"
import * as React from "react"

async function Products() {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6 bg-neutral-900">
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
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            <div
                className="flex items-center justify-center rounded-lg border border-neutral-600 shadow-sm bg-black p-[16%]"
            >
                <div className="flex flex-col items-center gap-1 text-center">
                    <PackageOpen className="w-24 h-24 max-sm:hidden"/>
                    <h3 className="max-sm:text-[21px] max-md:text-[26px] lg:text-[32px] font-bold tracking-tight">
                        You have no products
                    </h3>
                    <p className="text-sm text-slate-300">
                        You can start selling as soon as you add a product.
                    </p>
                    <NavigateRouteButton url={"/dashboard/products/add-new-plans"} btnName={"Add New Product"} />
                    <p>
                        or
                    </p>
                    <NavigateRouteButton url={"/dashboard/products/add-new-promotions"} btnName={"Add New Promotion"} />
                </div>
            </div>
        </main>
    )
}

export default Products