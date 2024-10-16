"use client";

import React, { useEffect, useState } from "react";
import { getImage } from "@/lib/actions/user.actions";
import Image from "next/image";
import { Heart, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  likeBlogCommentReply,
  unlikeBlogCommentReply,
} from "@/lib/actions/user.actions";
import { toast } from "sonner";

interface Reply {
  _id: string;
  content: string;
  createdAt: Date;
  author: {
    accountname: string;
    image: string;
    authorId: string;
  };
  likes: { user: string; likedAt: Date; _id: string }[];
  image: string;
}

interface ReplyItemProps {
  reply: Reply;
  currentUserProfileId: string;
  onDelete: () => void;
  isAdmin: boolean;
  dict: any;
}

const formatSentTime = (dateString: string): string => {
  const messageDate = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor(
    (now.getTime() - messageDate.getTime()) / 1000
  );
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds === 1 ? "" : "s"} ago`;
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
  } else {
    const day = messageDate.getDate();
    const month = messageDate
      .toLocaleString("en-US", { month: "short" })
      .toUpperCase();
    const time = messageDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return `${day} ${month} AT ${time}`;
  }
};

const ReplyItem: React.FC<ReplyItemProps> = ({
  reply,
  currentUserProfileId,
  onDelete,
  isAdmin,
  dict,
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [replyImage, setReplyImage] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(
    reply.likes.some((like) => like.user === currentUserProfileId)
  );
  const [likes, setLikes] = useState(reply.likes.length);
  const [openDialog, setOpenDialog] = useState(false);

  const isCreator = reply.author.authorId === currentUserProfileId;

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const image = await getImage(reply.author.authorId);
        setImageUrl(image.image);
      } catch (error) {
        console.error("Error fetching image:", error);
      }
    };

    fetchImage();
  }, [reply.author.authorId]);

  useEffect(() => {
    const fetchReplyImage = async () => {
      if (reply.image) {
        try {
          const imageResponse = await fetch(
            `/api/blog-comment-reply-image-load/${reply.image}`
          );

          if (imageResponse.ok) {
            const data = await imageResponse.json();

            setReplyImage(data.fileDataUrl);
          }
        } catch (error) {
          console.error("Error fetching reply image:", error);
        }
      }
    };
    fetchReplyImage();
  }, [reply.image]);

  const handleLikeButton = async () => {
    if (!currentUserProfileId) {
      toast.error("You have to login to like this comment.");
      return;
    }

    try {
      const response = await likeBlogCommentReply(
        reply._id,
        currentUserProfileId
      );

      if (response.success) {
        setLikes((prevLikes) => prevLikes + 1);
        setIsLiked(true);
      } else {
        toast.error(response.message || "Failed to like the comment reply.");
      }
    } catch (error) {
      toast.error("An error occurred while liking the comment reply.");
    }
  };

  const handleUnlikeButton = async () => {
    if (!currentUserProfileId) {
      toast.error("You have to login to unlike this comment.");
      return;
    }

    try {
      const response = await unlikeBlogCommentReply(
        reply._id,
        currentUserProfileId
      );

      if (response.success) {
        setLikes((prevLikes) => prevLikes - 1);
        setIsLiked(false);
        toast.success("You unliked this comment reply.");
      } else {
        toast.error(response.message || "Failed to unlike the comment reply.");
      }
    } catch (error) {
      toast.error("An error occurred while unliking the comment reply.");
    }
  };

  return (
    <div className="flex justify-end w-full">
      <div className="relative w-full md:w-3/4 lg:w-1/2 p-4 dark:bg-neutral-800 bg-white rounded-lg shadow-sm hover:bg-neutral-700 transition-all duration-300 ease-in-out mb-2 border border-neutral-600">
        {(isAdmin || isCreator) && (
          <div className="absolute top-2 right-2">
            <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
              <AlertDialogTrigger asChild>
                <X
                  className="cursor-pointer text-neutral-500 hover:text-red-500 transition-colors"
                  size={20}
                  role="button"
                  aria-label="Delete comment"
                />
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-black">
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {dict.blog.commentreply.title}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {dict.blog.commentreply.deleteconfirmmessage}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    {dict.blog.commentreply.deletecancel}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      onDelete();
                      setOpenDialog(false);
                    }}
                  >
                    {dict.blog.commentreply.deleteconfirm}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        <div className="flex items-center mb-4">
          {imageUrl ? (
            <Image
              src={imageUrl || ""}
              alt={reply.author.accountname}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover mr-3 shadow-md"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-500 rounded-full mr-3 shadow-md"></div>
          )}
          <div>
            <p className="text-base font-semibold dark:text-white text-black leading-tight">
              {reply.author.accountname}
            </p>
            <p className="text-xs dark:text-neutral-400 text-black">
              {formatSentTime(reply.createdAt.toString())}
            </p>
          </div>
        </div>

        <p className="text-base dark:text-neutral-300 text-black leading-relaxed mb-3">
          {reply.content}
        </p>

        {replyImage && (
          <div className="mb-2">
            <Image
              src={replyImage}
              alt="Reply Image"
              width={400}
              height={300}
              className="rounded-lg"
            />
          </div>
        )}

        <div className="absolute right-5 bottom-8 flex flex-col items-center space-y-2">
          {isLiked ? (
            <Heart
              className="text-red-500 cursor-pointer"
              fill="currentColor"
              onClick={handleUnlikeButton}
              role="button"
              aria-label="Unlike reply"
            />
          ) : (
            <Heart
              className="dark:text-white text-black cursor-pointer hover:text-red-500 transition-colors"
              onClick={handleLikeButton}
              role="button"
              aria-label="Like reply"
            />
          )}
          <span className="text-xs dark:text-neutral-400 text-black mt-1">
            {likes}{" "}
            {likes === 1
              ? dict.blog.commentreply.like
              : dict.blog.commentreply.like}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReplyItem;
