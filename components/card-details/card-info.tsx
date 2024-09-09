"use client";

import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { checkIfFollowing, updateMemberFollow, updateCardLikes, fetchComments, addComment, addReply, likeComment, fetchCurrentActiveProfileId } from '@/lib/actions/user.actions';
import { Button } from '../ui/button';
import { MoreHorizontal, Heart, Share2, ChevronDown, ChevronUp, SendHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import ShareDialog from '../shared/share-dialog';
import { Input } from '../ui/input';
import { timeSince } from '@/lib/utils';

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
    const [authActiveProfileId, setAuthActiveProfileId] = useState<string | null>(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLiked, setIsLiked] = useState<boolean>(likes.some(like => like.userId === session?.user.id));
    const [likeCount, setLikeCount] = useState<number>(likes.length);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [likeButtonDisabled, setLikeButtonDisabled] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState<string>('');
    const [parentCommentId, setParentCommentId] = useState<string | null>(null);
    const [commentsCollapsed, setCommentsCollapsed] = useState<boolean>(false);
    const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
    const { data: clientSession } = useSession();
    const isDifferentUser = clientSession?.user.id !== creatorId;

    useEffect(() => {
        async function fetchActiveProfileId() {
            if (clientSession) {
                const user = clientSession.user;
                const authActiveProfileId = await fetchCurrentActiveProfileId(user.id);
                setAuthActiveProfileId(authActiveProfileId);
            }
        }
        fetchActiveProfileId();
    }, [clientSession]);

    useEffect(() => {
        async function fetchFollowStatus() {
            if (clientSession) {
                const user = clientSession.user;
                const authUserId = user.id;
                const authActiveProfileId = await fetchCurrentActiveProfileId(authUserId);
                
                const accountId = creatorId;
                const followStatus = await checkIfFollowing({ authActiveProfileId, accountId });

                if (followStatus.success === true) {
                    setIsFollowing(followStatus.isFollowing);
                }
            }
        }
        fetchFollowStatus();
    }, [clientSession, creatorId]);

    useEffect(() => {
        async function loadComments() {
            const response = await fetchComments(cardId);

            if (response.success) {
                setComments(response.data);
            }
        }
        loadComments();
    }, [cardId]);

    const handleFollowToggle = async () => {
        if (clientSession) {
            const user = clientSession.user;
            const authUserId = user.id;
            const authActiveProfileId = await fetchCurrentActiveProfileId(authUserId);

            const accountId = creatorId;
            const method = isFollowing ? 'UNFOLLOW' : 'FOLLOW';
            await updateMemberFollow({ authActiveProfileId, accountId, method });
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
        const authActiveProfileId = await fetchCurrentActiveProfileId(authUserId);


        const initialIsLiked = isLiked;
        const initialLikeCount = likeCount;
        const newLikeCount = initialIsLiked ? Math.max(0, initialLikeCount - 1) : initialLikeCount + 1;
        setLikeCount(newLikeCount);
        setIsLiked(!initialIsLiked);

        try {
            const updatedCard = await updateCardLikes({ authActiveProfileId, cardId });
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
            toast.error("Something went wrong. Please try again later.");
        }
    };

    const handleAddComment = async () => {
        if (!clientSession) {
            toast.error("You need to login first before commenting.");
            return;
        }

        const user = clientSession.user;
        const authUserId = user.id;
        const authActiveProfileId = await fetchCurrentActiveProfileId(authUserId);

        try {
            if (parentCommentId) {
                const response = await addReply(parentCommentId, authActiveProfileId, newComment);
                if (response.success) {
                    setComments(comments.map(comment => updateReplies(comment, parentCommentId, response.data)));
                    setParentCommentId(null);
                } else {
                    toast.error(response.message);
                }
            } else {
                const response = await addComment(cardId, authActiveProfileId, newComment);
                if (response.success) {
                    setComments([...comments, response.data]);
                } else {
                    toast.error(response.message);
                }
            }
            setNewComment("");
            toast.success("Commented successfully!");
        } catch (error) {
            toast.error("Something went wrong. Please try again later.");
        }
    };

    const handleReplyClick = (accountname: string, commentId: string) => {
        setNewComment(`@${accountname} `);
        setParentCommentId(commentId);
        setActiveCommentId(commentId);
    };

    const handleCommentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNewComment(value);

        if (!value.startsWith("@")) {
            setParentCommentId(null);
            setActiveCommentId(null);
        }
    };

    const handleCommentInputBlur = () => {
        const trimmedComment = newComment.trim();
        const atMention = `@${trimmedComment.split(' ')[0].slice(1)}`;

        if (trimmedComment === atMention) {
            setNewComment('');
            setParentCommentId(null);
            setActiveCommentId(null);
        }
    };


    const handleLikeComment = async (commentId: string) => {
        if (!clientSession) {
            toast.error("You need to login first before liking.");
            return;
        }

        const user = clientSession.user;
        const authUserId = user.id;
        const authActiveProfileId = await fetchCurrentActiveProfileId(authUserId);

        try {
            const response = await likeComment(commentId, authActiveProfileId);

            if (response.success && response.data) {
                setComments(comments.map(comment => updateLikes(comment, commentId, response.data.likes || [])));
                toast.success("Comment liked successfully!");
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again later.");
        }
    };

    const updateLikes = (comment: any, commentId: string, likes: any[]) => {
        if (comment._id === commentId) {
            return {
                ...comment,
                likes,
            };
        }
        return {
            ...comment,
            replies: comment.replies.map((reply: any) => updateLikes(reply, commentId, likes)),
        };
    };

    const updateReplies = (comment: any, parentCommentId: string, newReply: any) => {
        if (comment._id === parentCommentId) {
            return {
                ...comment,
                replies: [...comment.replies, newReply],
            };
        }
        return {
            ...comment,
            replies: comment.replies.map((reply: any) => updateReplies(reply, parentCommentId, newReply)),
        };
    };

    const renderReplies = (replies: any[], parentId: string) => {
        return (
            <div className="ml-4 mt-2">
                {replies.map((reply, replyIndex) => {
                    return (
                        <div key={replyIndex} className="flex items-start mt-2 cursor-pointer">
                            <Image
                                src={reply.commentBy.image}
                                alt="User Image"
                                width={30}
                                height={30}
                                className="rounded-full"
                            />
                            <div className="ml-2 w-full z-40">
                                <div className="flex justify-between" onClick={() => setActiveCommentId(reply._id)}>
                                    <div>
                                        <p className="font-semibold">{reply.commentBy.accountname}</p>
                                        <p>{reply.comment}</p>
                                        <p className="text-xs text-gray-500">{timeSince(new Date(reply.commentDate))}</p>
                                        {activeCommentId === reply._id && (
                                            <Button
                                                variant="none_bg"
                                                size="sm"
                                                onClick={(e) => { e.stopPropagation(); handleReplyClick(reply.commentBy.accountname, reply._id); }}
                                                className="text-blue px-0 h-5 text-[14px]"
                                            >
                                                Reply
                                            </Button>
                                        )}
                                    </div>
                                    {/* might have problem here */}
                                    <div className="flex items-center gap-3 mt-1">
                                        <Button className="hover:scale-105" variant="none_bg" size="icon" onClick={(e) => { e.stopPropagation(); handleLikeComment(reply._id); }}>
                                            {reply.likes && reply.likes.map((like: { _id: string }) => like._id.toString()).includes(authActiveProfileId?.toString()) ? (
                                                <Heart fill="#F47983" strokeWidth={0} className="cursor-pointer" />
                                            ) : (
                                                <Heart className="cursor-pointer" />
                                            )}
                                        </Button>
                                        <span>{reply.likes.length}</span>
                                    </div>
                                </div>
                                {reply.replies && renderReplies(reply.replies, reply._id)}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="p-4 border rounded shadow flex flex-col justify-between overflow-y-auto h-[380px]">
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">{cardTitle}</h1>
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
                            <p className="text-sm text-gray-500">{creatorInfo.followers} followers</p>
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
            <div className="my-4">
                <div className="flex justify-between items-center cursor-pointer" onClick={() => setCommentsCollapsed(!commentsCollapsed)}>
                    <h2 className="text-lg font-bold">Comments</h2>
                    {commentsCollapsed ? <ChevronDown /> : <ChevronUp />}
                </div>
                {!commentsCollapsed && (
                    <div>
                        {comments.map((comment, index) => (
                            <div key={index} className="flex items-start mt-2">
                                <Image
                                    src={comment.commentBy.image}
                                    alt="User Image"
                                    width={30}
                                    height={30}
                                    className="rounded-full"
                                />
                                <div className="ml-2 w-full">
                                    <div className="flex flex-row justify-between w-full" onClick={() => setActiveCommentId(comment._id)}>
                                        <div>
                                            <p className="font-semibold">{comment.commentBy.accountname}</p>
                                            <p>{comment.comment}</p>
                                            <p className="text-xs text-gray-500">{timeSince(new Date(comment.commentDate))}</p>
                                        </div>
                                        <div className="flex gap-3 items-center">
                                            <Button className="hover:scale-105" variant="none_bg" size="icon" onClick={(e) => { e.stopPropagation(); handleLikeComment(comment._id); }}>
                                                {comment.likes.map((like: { user: string }) => like.user.toString()).includes(clientSession?.user.id.toString()) ? (
                                                    <Heart fill="#F47983" strokeWidth={0} className="cursor-pointer" />
                                                ) : (
                                                    <Heart className="cursor-pointer" />
                                                )}
                                            </Button>
                                            <span>{comment.likes.length}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center gap-2 mt-1">
                                        <div className="flex">
                                            {activeCommentId === comment._id && (
                                                <Button
                                                    variant="none_bg"
                                                    size="sm"
                                                    onClick={(e) => { e.stopPropagation(); handleReplyClick(comment.commentBy.accountname, comment._id); }}
                                                    className="text-blue px-0 h-5 text-[14px]"
                                                >
                                                    Reply
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    {comment.replies && renderReplies(comment.replies, comment._id)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="mt-auto sticky bottom-0 flex flex-col gap-2 items-center">
                <div className="flex gap-3 w-full items-center justify-between">
                    <div className="flex items-center gap-4 w-full">
                        <Input
                            type="text"
                            value={newComment}
                            onChange={handleCommentInputChange}
                            placeholder="Add a comment..."
                            className="border p-2 rounded w-full bg-black text-white"
                            onBlur={handleCommentInputBlur}
                            onFocus={() => setActiveCommentId(null)}
                        />
                        {newComment !== "" && (
                            <SendHorizontal className="cursor-pointer" onClick={handleAddComment} />
                        )}
                    </div>
                    <div className="flex gap-3">
                        <Button className="hover:scale-105" variant="none_bg" size="icon" disabled={likeButtonDisabled} onClick={handleUpdateLikeButtonClick}>
                            {isLiked === true ? (
                                <Heart fill="#F47983" strokeWidth={0} className="cursor-pointer" />
                            ) : (
                                <Heart className="cursor-pointer" />
                            )}
                        </Button>
                        <span>{likeCount}</span>
                    </div>
                </div>
            </div>
            {isDialogOpen && (
                <ShareDialog url={shareUrl} lineComponents={lineComponents} userImageUrl={creatorImage} onClose={handleCloseDialog} />
            )}
        </div>
    );
}
