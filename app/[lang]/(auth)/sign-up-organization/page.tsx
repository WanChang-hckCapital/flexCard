import * as React from "react";
import SignupOrganizationForm from '@/components/forms/signup-organization-form';
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { X } from "lucide-react";
import { authOptions } from "@/app/api/utils/authOptions";
import { fetchCurrentActiveProfileId } from "@/lib/actions/user.actions";
import { getDictionary } from "../../dictionaries";

async function Page({ params }: { params: { lang: string } }) {
    const session = await getServerSession(authOptions)
    const user = session?.user;
    const dict = await getDictionary(params.lang);

    if (!user) {
        redirect("/sign-in");
    }

    const authUserId = user.id.toString();
    const authActiveProfileId = await fetchCurrentActiveProfileId(authUserId);

    return (
        <div>
            <header className="flex items-center p-2 bg-neutral-900 text-white border-b-2 border-indigo-500">
                <Button variant="link" className="text-white">
                    <Link href="/product"><X/></Link>
                </Button>
                |&nbsp;
                <h1 className="text-xl font-bold py-2 px-4">{dict.auth.signUpOrganization.title}</h1>
            </header>
            <SignupOrganizationForm authActiveProfileId={authActiveProfileId} dict={dict} />
        </div>
    );
};

export default Page;