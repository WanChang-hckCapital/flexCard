"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { getFollowers } from "@/lib/actions/admin.actions"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import AddNewUser from "@/components/forms/new-user"

interface Props {
    authActiveProfileId: string;
}

function Setting({ authActiveProfileId }: Props) {
    const [activeSection, setActiveSection] = useState('General');
    const [lineOAFollowers, setLineOAFollowers] = useState<string[]>([]);
    const router = useRouter();

    const handleNavClick = (section: any) => {
        setActiveSection(section);
    };

    useEffect(() => {
        const fetchFollowers = async () => {
            const response = await getFollowers();
            if (response.success === true && response.followers !== undefined) {
                setLineOAFollowers(response.followers);
            }
        };

        fetchFollowers();
    }, []);

    return (
        <div className="flex min-h-screen bg-neutral-900 w-full flex-col">
            <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
                <div className="mr-auto ml-[8%] grid w-full max-w-[60%] gap-2">
                    <Breadcrumb className="hidden md:flex">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href="/dashboard/settings">Settings</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href="/dashboard/settings">{activeSection}</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                <div className="mr-auto ml-[8%] grid w-full max-w-[60%] items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
                    <nav className="grid gap-4 text-sm text-muted-foreground" x-chunk="dashboard-04-chunk-0">
                        <a onClick={() => handleNavClick('General')} className={`cursor-pointer ${activeSection === 'General' ? 'text-primary font-bold' : ''}`}>
                            General
                        </a>
                        <a onClick={() => handleNavClick('User')} className={`cursor-pointer ${activeSection === 'User' ? 'text-primary font-bold' : ''}`}>
                            New User
                        </a>
                        <a onClick={() => handleNavClick('Report')} className={`cursor-pointer ${activeSection === 'Report' ? 'text-primary font-bold' : ''}`}>
                            Report
                        </a>
                    </nav>
                    <div className="grid gap-6">
                        {activeSection === 'General' && (
                            <Card x-chunk="dashboard-04-chunk-1">
                                <CardHeader>
                                    <CardTitle>Something General</CardTitle>
                                    {/* <CardDescription>General General General General General General</CardDescription> */}
                                </CardHeader>
                                <CardContent>
                                    <div>
                                        <h1>General Settings</h1>
                                        <p>General settings for the admins.</p>
                                    </div>
                                </CardContent>
                                {/* <CardContent>
                                    <form>
                                        <Input placeholder="Store Name" />
                                    </form>
                                </CardContent>
                                <CardFooter className="border-t px-6 py-4">
                                    <Button>Save</Button>
                                </CardFooter> */}
                            </Card>
                        )}
                        {activeSection === 'User' && (
                            <Card x-chunk="dashboard-04-chunk-2">
                                <CardHeader>
                                    <CardTitle className="pb-2 text-[21px]">Create Internal User</CardTitle>
                                    <CardDescription>
                                        User will be able to access the dashboard by different user role.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <AddNewUser btnTitle={"Submit"} authActiveProfileId={authActiveProfileId} />
                                </CardContent>
                            </Card>
                        )}
                        {activeSection === 'Report' && (
                            <Card x-chunk="dashboard-04-chunk-3">
                                <CardHeader>
                                    <CardTitle>LineOA Friends</CardTitle>
                                    <CardDescription>Send Weekly Sales Report to Line OA Friends.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div>
                                        <h1>LINE OA Followers</h1>
                                        <ul>
                                            {lineOAFollowers.map((followerId) => (
                                                <li key={followerId}>{followerId}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                                <CardFooter className="border-t px-6 py-4">
                                    <Button
                                        variant={"secondary"}
                                        className="w-full"
                                    >
                                        Send
                                    </Button>
                                </CardFooter>
                            </Card>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Setting
