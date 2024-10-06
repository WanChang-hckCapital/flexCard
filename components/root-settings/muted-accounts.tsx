"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getMutedAccounts, unmuteAccount } from "@/lib/actions/user.actions";
import Image from 'next/image';
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
    authActiveProfileId: string;
    dict: any;
}

function MutedAccount({ authActiveProfileId, dict }: Props) {
    const [mutedAccounts, setMutedAccounts] = useState<any[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<any | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchMutedAccounts = async () => {
            const response = await getMutedAccounts(authActiveProfileId);

            if (response.success) {
                setMutedAccounts(response.mutedAccounts || []);
            }

            setLoading(false);
        };

        fetchMutedAccounts();
    }, [authActiveProfileId]);

    const handleUnmuted = async () => {
        if (!selectedAccount) return;

        const response = await unmuteAccount(authActiveProfileId, selectedAccount._id);

        if (response.success) {
            toast.success("Account unmuted successfully!");
            setMutedAccounts(mutedAccounts.filter(account => account._id !== selectedAccount._id));
        } else {
            toast.error(response.message);
        }

        setIsModalOpen(false);
    };

    const filteredMutedAccounts = mutedAccounts.filter(mutedAccount =>
        mutedAccount.accountname.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>{dict.userSettings.mutedUsers.title}</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center items-center py-6">
                        <Loader2 className="animate-spin h-8 w-8 dark:text-light-2 text-slate-700" />
                    </div>
                ) : (
                    <>
                        {filteredMutedAccounts.length === 0 ? (
                            <div className="flex justify-center items-center py-6">
                                <p className="dark:text-light-2 text-slate-700">{dict.userSettings.mutedUsers.noMutedUsers}</p>
                            </div>
                        ) : (
                            <>
                                <div className="mb-4">
                                    <Input
                                        className="dark:bg-black dark:text-light-2"
                                        placeholder="Search"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div>
                                    {filteredMutedAccounts.map(mutedAccount => (
                                        <div key={mutedAccount._id} className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <Image
                                                    src={mutedAccount.image.binaryCode}
                                                    alt={mutedAccount.accountname}
                                                    width={24}
                                                    height={24}
                                                    className="rounded-full h-8 w-8" />
                                                <div>
                                                    <p className="dark:text-light-2">{mutedAccount.accountname}</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="destructive"
                                                onClick={() => {
                                                    setSelectedAccount(mutedAccount);
                                                    setIsModalOpen(true);
                                                }}
                                            >
                                                {dict.userSettings.mutedUsers.btnUnmuted}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}
            </CardContent>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{dict.userSettings.mutedUsers.dialog.title}</DialogTitle>
                        <DialogDescription>
                            {dict.userSettings.mutedUsers.dialog.confirmUnmutedDesc}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                            {dict.userSettings.mutedUsers.dialog.cancelUnmuted}
                        </Button>
                        <Button variant="destructive" onClick={handleUnmuted}>
                            {dict.userSettings.mutedUsers.dialog.confirmUnmuted}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}

export default MutedAccount;
