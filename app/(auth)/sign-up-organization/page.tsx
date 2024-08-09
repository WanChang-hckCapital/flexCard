import * as React from "react";
import SignupOrganizationForm from '@/components/forms/signup-organization-form';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { X } from "lucide-react";

async function Page() {
    const session = await getServerSession(authOptions)
    const user = session?.user;

    if (!user) {
        redirect("/sign-in");
    }

    const authenticatedUserId = user.id;

    return (
        <div>
            <header className="flex items-center p-2 bg-neutral-900 text-white border-b-2 border-indigo-500">
                <Button variant="link" className="text-white">
                    <Link href="/product"><X/></Link>
                </Button>
                |&nbsp;
                <h1 className="text-xl font-bold py-2 px-4">Join as Organization</h1>
            </header>
            <SignupOrganizationForm authenticatedUserId={authenticatedUserId} />
        </div>
    );
};

export default Page;