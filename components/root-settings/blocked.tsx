"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getBlockedAccounts, unblockAccount } from "@/lib/actions/user.actions";
import Image from 'next/image';
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
    authActiveProfileId: string;
    dict: any;
}

function Blocked({ authActiveProfileId, dict }: Props) {
    const [blockedAccounts, setBlockedAccounts] = useState<any[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<any | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchBlockedAccounts = async () => {
            const response = await getBlockedAccounts(authActiveProfileId);

            if (response.success) {
                setBlockedAccounts(response.blockedAccounts || []);
            }

            setLoading(false);
        };

        fetchBlockedAccounts();
    }, [authActiveProfileId]);

    const handleUnblock = async () => {
        if (!selectedAccount) return;

        const response = await unblockAccount(authActiveProfileId, selectedAccount._id);

        if (response.success) {
            toast.success("Account unblocked successfully!");
            setBlockedAccounts(blockedAccounts.filter(account => account._id !== selectedAccount._id));
        } else {
            toast.error(response.message);
        }

        setIsModalOpen(false);
    };

    const filteredBlockedAccounts = blockedAccounts.filter(blockAccount =>
        blockAccount.accountname.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>{dict.userSettings.blockedUsers.title}</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center items-center py-6">
                        <Loader2 className="animate-spin h-8 w-8 dark:text-light-2 text-slate-700" />
                    </div>
                ) : (
                    <>
                        {filteredBlockedAccounts.length === 0 ? (
                            <div className="flex justify-center items-center py-6">
                                <p className="dark:text-light-2 text-slate-700">{dict.userSettings.blockedUsers.noBlockedUsers}</p>
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
                                    {filteredBlockedAccounts.map(blockedAccount => (
                                        <div key={blockedAccount._id} className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <Image
                                                    src={blockedAccount.image.binaryCode}
                                                    alt={blockedAccount.accountname}
                                                    width={24}
                                                    height={24}
                                                    className="rounded-full h-8 w-8" />
                                                <div>
                                                    <p className="dark:text-light-2">{blockedAccount.accountname}</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="destructive"
                                                onClick={() => {
                                                    setSelectedAccount(blockedAccount);
                                                    setIsModalOpen(true);
                                                }}
                                            >
                                                Unblock
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
                        <DialogTitle>Confirm Unblock</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to unblock {selectedAccount?.accountname}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleUnblock}>
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}

export default Blocked;
