"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { getImage } from "@/lib/actions/user.actions";
import { Button } from "@/components/ui/button";
import {
  likeBlogComment,
  unlikeBlogComment,
  submitBlogCommentReply,
  loadBlogCommentReply,
} from "@/lib/actions/user.actions";
import { toast } from "sonner";
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
import { Textarea } from "@/components/ui/textarea";
import ReplyComment from "./ReplyComment";
import ReplyList from "./ReplyList";

interface BlogComment {
  _id: string;
  content: string;
  blog: string;
  image: string;
  author: {
    accountname: string;
    image: string;
    authorId: string;
  };
  likes: { user: string; likedAt: Date; _id: string }[];
  created_at: Date;
  replyCount: number;
}

interface BlogCommentItemProps {
  comment: BlogComment;
  currentUserProfileId: string;
  onDelete: () => void;
  isAdmin: boolean;
}

const BlogCommentItem: React.FC<BlogCommentItemProps> = ({
  comment,
  currentUserProfileId,
  onDelete,
  isAdmin,
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [commentImage, setCommentImage] = useState<string | null>(null);
  const [likes, setLikes] = useState(comment.likes.length);
  const [isLiked, setIsLiked] = useState(
    comment.likes.some((like) => like.user === currentUserProfileId)
  );

  const [openDialog, setOpenDialog] = useState(false);
  const [replies, setReplies] = useState<any[]>([]);
  const [replyMode, setReplyMode] = useState(false);

  const isCreator = comment.author.authorId === currentUserProfileId;

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const image = await getImage(comment.author.authorId);
        setImageUrl(image.image);
      } catch (error) {
        console.error("Error fetching image:", error);
      }
    };

    fetchImage();
  }, [comment.author.authorId]);

  useEffect(() => {
    const fetchCommentImage = async () => {
      if (comment.image) {
        try {
          const imageResponse = await fetch(
            `/api/blog-comment-image-load/${comment.image}`
          );

          if (imageResponse.ok) {
            const data = await imageResponse.json();

            setCommentImage(data.fileDataUrl);
          }
        } catch (error) {
          console.error("Error fetching comment image:", error);
        }
      }
    };

    fetchCommentImage();
  }, [comment.image]);

  useEffect(() => {
    if (comment.replyCount > 0) {
      const fetchReplies = async () => {
        try {
          const repliesResponse = await loadBlogCommentReply(comment._id);

          if (repliesResponse.success) {
            setReplies(repliesResponse.replies);
          }
        } catch (error) {
          toast.error("An error occurred while loading replies.");
        }
      };

      fetchReplies();
    }
  }, [comment._id, comment.replyCount]);

  const handleLikeButton = async () => {
    if (!currentUserProfileId) {
      toast.error("You have to login to like this comment.");
      return;
    }

    try {
      const response = await likeBlogComment(comment._id, currentUserProfileId);

      if (response.success) {
        setLikes((prevLikes) => prevLikes + 1);
        setIsLiked(true);
        toast.success("You liked this comment.");
      } else {
        toast.error(response.message || "Failed to like the comment.");
      }
    } catch (error) {
      toast.error("An error occurred while liking the comment.");
    }
  };

  const handleUnlikeButton = async () => {
    if (!currentUserProfileId) {
      toast.error("You have to login to unlike this comment.");
      return;
    }

    try {
      const response = await unlikeBlogComment(
        comment._id,
        currentUserProfileId
      );

      if (response.success) {
        setLikes((prevLikes) => prevLikes - 1);
        setIsLiked(false);
        toast.success("You unliked this comment.");
      } else {
        toast.error(response.message || "Failed to unlike the comment.");
      }
    } catch (error) {
      toast.error("An error occurred while unliking the comment.");
    }
  };

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

  const handleReplySubmit = async (replyContent: string, imageFile?: File) => {
    if (!currentUserProfileId) {
      toast.error("You have to login to do so.");
      return;
    }
    try {
      let imageId = null;

      if (imageFile) {
        const formData = new FormData();
        formData.append("imageFile", imageFile);

        const commentReplyImageUploadRes = await fetch(
          "/api/blog-comment-reply-image-submit",
          {
            method: "POST",
            body: formData,
          }
        );

        if (commentReplyImageUploadRes.ok) {
          const result = await commentReplyImageUploadRes.json();
          console.log("successfully uploaded");
          console.log("fileId", result.fileId); // Correcting to fileId here
          imageId = result.fileId; // Correcting to assign fileId
        } else {
          toast.error("Image upload failed.");
          return;
        }
      }

      const response = await submitBlogCommentReply({
        content: replyContent,
        commentId: comment._id,
        authenticatedUserId: currentUserProfileId,
        blogId: comment.blog,
        imageId: imageId,
      });

      if (response.success) {
        setReplyMode(false);
        setReplies((prevReplies) => [...prevReplies, response.reply]);
        comment.replyCount += 1;
      } else {
        toast.error(response.message || "Failed to add reply.");
      }
    } catch (error) {
      toast.error("An error occurred while adding the reply.");
    }
  };

  return (
    <div className="relative p-5 bg-neutral-900 text-white border border-neutral-800 rounded-lg shadow-lg">
      {(isAdmin || isCreator) && (
        <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
          <AlertDialogTrigger asChild>
            <X
              className="absolute top-2 right-2 cursor-pointer text-neutral-500 hover:text-red-500"
              size={20}
              role="button"
              aria-label="Delete comment"
            />
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-black">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this comment? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  onDelete();
                  setOpenDialog(false);
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      <div className="flex items-center mb-2">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={comment.author.accountname}
            width={40}
            height={40}
            className="w-12 h-12 rounded-full object-cover mr-4"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-500 rounded-full mr-4"></div>
        )}
        <div>
          <p className="text-sm font-semibold text-white">
            {comment.author.accountname}
          </p>
          <p className="text-xs text-neutral-400">
            {formatSentTime(comment.created_at.toISOString())}
          </p>
        </div>
      </div>

      <p className="text-base text-neutral-300 mb-2">{comment.content}</p>

      {commentImage && (
        <div className="mb-2">
          <Image
            src={commentImage}
            alt="Comment Image"
            width={400}
            height={300}
            className="rounded-lg"
          />
        </div>
      )}

      <div className="flex justify-between items-center mt-1 mb-1">
        <div className="flex space-x-2">
          {isLiked ? (
            <Heart
              className="text-red-500 cursor-pointer"
              fill="currentColor"
              onClick={handleUnlikeButton}
              role="button"
              aria-label="Unlike comment"
            />
          ) : (
            <Heart
              className="text-white cursor-pointer hover:text-red-500"
              onClick={handleLikeButton}
              role="button"
              aria-label="Like comment"
            />
          )}
          <span className="text-xs text-neutral-400">
            {likes} {likes <= 1 ? "like" : "likes"}
          </span>
          <span
            className="text-xs text-neutral-400 cursor-pointer"
            onClick={() => setReplyMode(!replyMode)}
          >
            Reply
          </span>
        </div>
      </div>

      {replyMode && (
        <>
          <ReplyComment
            commentId={comment._id}
            currentUserProfileId={currentUserProfileId}
            onReplySubmit={handleReplySubmit}
            onClose={() => setReplyMode(false)}
          />
        </>
      )}

      <ReplyList
        currentUserProfileId={currentUserProfileId}
        replies={replies}
        isAdmin={isAdmin}
      />
    </div>
  );
};

export default BlogCommentItem;
