"use client"

import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { checkIfFollowing, updateMemberFollow, getLikeCount, updateCardLikes } from '@/lib/actions/user.actions';
import { Button } from '../ui/button';
import { MoreHorizontal, Heart, Share2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { toast } from 'sonner';
import ShareDialog from '../shared/share-dialog';

type CardInfoProps = {
    cardId: string;
    cardTitle: string;
    cardDescription: string;
    creatorImage: string;
    creatorId: string;
    creatorInfo: any;
    userFollowers: number;
    session: any;
    likes: any[];
    lineComponents: string;
    shareUrl: string;
}

export default function CardInfo({
    cardId,
    cardTitle,
    cardDescription,
    creatorImage,
    creatorId,
    creatorInfo,
    userFollowers,
    session,
    likes,
    lineComponents,
    shareUrl
}: CardInfoProps) {
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLiked, setIsLiked] = useState<boolean>(likes.some(like => like.userId === session?.user.id));
    const [likeCount, setLikeCount] = useState<number>(likes.length);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [likeButtonDisabled, setLikeButtonDisabled] = useState(false);
    const { data: clientSession } = useSession();
    const isDifferentUser = clientSession?.user.id !== creatorId;

    useEffect(() => {
        async function fetchFollowStatus() {
            if (clientSession) {
                const user = clientSession.user;
                const authUserId = user.id;
                const accountId = creatorId;
                const followStatus = await checkIfFollowing({ authUserId, accountId });

                if (followStatus.success === true) {
                    setIsFollowing(followStatus.isFollowing);
                }
            }
        }
        fetchFollowStatus();
    }, [clientSession, creatorId]);

    const handleFollowToggle = async () => {
        if (clientSession) {
            const user = clientSession.user;
            const authUserId = user.id;
            const accountId = creatorId;
            const method = isFollowing ? 'UNFOLLOW' : 'FOLLOW';
            await updateMemberFollow({ authUserId, accountId, method });
            setIsFollowing(!isFollowing);
        }
    };

    const handleShareClick = () => {
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
    };

    const handleUpdateLikeButtonClick = async () => {
        if (!clientSession) {
            toast.error("You need to login first before actions.");
            return;
        }

        const user = clientSession.user;
        const authUserId = user.id;

        const initialIsLiked = isLiked;
        const initialLikeCount = likeCount;
        const newLikeCount = initialIsLiked ? Math.max(0, initialLikeCount - 1) : initialLikeCount + 1;
        setLikeCount(newLikeCount);
        setIsLiked(!initialIsLiked);

        try {
            const updatedCard = await updateCardLikes({ authUserId, cardId });
            if (updatedCard.success === true) {
                setLikeCount(updatedCard.data?.length || 0);
                setIsLiked(!initialIsLiked);
            } else {
                setLikeCount(initialLikeCount);
                setIsLiked(initialIsLiked);
                toast.error(updatedCard.message);
            }

            if (updatedCard.reachedLimit === true) {
                setLikeButtonDisabled(true);
            }
        } catch (error) {
            setLikeCount(initialLikeCount);
            setIsLiked(initialIsLiked);
            console.error('Error updating member likes:', error);
            toast.error('Error updating likes. Please try again later.');
        }
    };

    return (
        <div className="p-4 border rounded shadow flex flex-col justify-between h-full">
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">{cardTitle}</h1>
                    {/* version 2 */}
                    {/* <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="focus:outline-none">
                                <MoreHorizontal className="w-6 h-6" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onSelect={() => alert("Use this as template clicked!")}>
                                Use this as template
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu> */}
                </div>
                <div className='flex justify-between'>
                    <div className="flex items-center mb-4">
                        <Image
                            src={creatorImage}
                            alt="Creator Image"
                            width={50}
                            height={50}
                            className="rounded-full"
                        />
                        <div className="ml-4">
                            <p className="text-lg">{creatorInfo.accountname}</p>
                            <p className="text-sm text-gray-500">{userFollowers} followers</p>
                        </div>
                    </div>
                    {clientSession && isDifferentUser && (
                        <Button
                            variant={isFollowing ? 'greyToDark' : 'outline'}
                            onClick={handleFollowToggle}
                            className={"py-2 px-4 h-8 rounded"}
                        >
                            {isFollowing ? 'Unfollow' : 'Follow'}
                        </Button>
                    )}
                </div>
            </div>
            {cardDescription !== "" && (
                <div className="pt-4 mb-4">
                    <p className="text-sm font-medium">Description:</p>
                    <div className="pt-4" dangerouslySetInnerHTML={{ __html: cardDescription }} />
                </div>
            )}
            <div className="mt-auto flex justify-end items-center">
                <span className="mr-2">{likeCount}</span>
                <Button variant="none_bg" size="icon" disabled={likeButtonDisabled} onClick={handleUpdateLikeButtonClick}>
                    {isLiked === true ? (
                        <Heart fill="#F47983" strokeWidth={0} className="cursor-pointer" />
                    ) : (
                        <Heart className="cursor-pointer" />
                    )}
                </Button>
                {/* <Button variant="outline" className="flex items-center" onClick={handleShareClick}>
                    <Share2 className="w-5 h-5 mr-2 text-gray-500" />
                    Share
                </Button> */}
            </div>
            {isDialogOpen && (
                <ShareDialog url={shareUrl} lineComponents={lineComponents} userImageUrl={creatorImage} onClose={handleCloseDialog} />
            )}
        </div>
    );
}
