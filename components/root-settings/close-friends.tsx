"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { getFollowers, updateCloseFriends } from "@/lib/actions/user.actions";
import Image from 'next/image';
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Props {
    authActiveProfileId: string;
    dict: any;
}

function CloseFriends({ authActiveProfileId, dict }: Props) {
    const [followers, setFollowers] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFollowers = async () => {
            const response = await getFollowers(authActiveProfileId);

            console.log("response", response.followers);

            if (response.success) {
                setFollowers(response.followers || []);
            }

            setLoading(false);
        };

        fetchFollowers();
    }, [authActiveProfileId]);

    const handleToggleFriend = async (friendId: string) => {
        console.log("friendId", friendId);
    
        const updatedFriends = followers.map(follower =>
            follower._id === friendId ? { ...follower, isCloseFriend: !follower.isCloseFriend } : follower
        );
        setFollowers(updatedFriends);
    
        const closeFriendsIds = updatedFriends
            .filter(follower => follower.isCloseFriend)
            .map(follower => follower._id);
    
        const response = await updateCloseFriends(authActiveProfileId, closeFriendsIds);
    
        if (!response.success) {
            toast.error(response.message);
        } else {
            toast.success(response.message);
        }
    };
    

    const filteredFollowers = followers.filter(follower =>
        follower.accountname.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>{dict.userSettings.closeFriends.title}</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center items-center py-6">
                        <Loader2 className="animate-spin h-8 w-8 dark:text-light-2 text-slate-700" />
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
                            {filteredFollowers.map(follower => (
                                <div key={follower._id} className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <Image
                                            src={follower.image.binaryCode}
                                            alt={follower.accountname}
                                            width={24}
                                            height={24}
                                            className="rounded-full h-8 w-8" />
                                        <div>
                                            <p className="dark:text-light-2 text-slate-700">{follower.accountname}</p>
                                        </div>
                                    </div>
                                    <Checkbox
                                        checked={follower.isCloseFriend}
                                        onClick={() => handleToggleFriend(follower._id)}
                                    />
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

export default CloseFriends;
