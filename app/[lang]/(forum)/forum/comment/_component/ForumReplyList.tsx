"use client";

import React, { useEffect, useState } from "react";
//import ReplyItem from "./ReplyItem";
import ForumReplyItem from "./ForumReplyItem";
import { toast } from "sonner";
import {
  deleteBlogCommentReplies,
  deleteForumCommentReplies,
} from "@/lib/actions/user.actions";

interface ForumReply {
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

interface ForumReplyListProps {
  replies: ForumReply[];
  currentUserProfileId: string;
  isAdmin: boolean;
  dict: any;
}

const ForumReplyList: React.FC<ForumReplyListProps> = ({
  replies,
  currentUserProfileId,
  isAdmin,
  dict,
}) => {
  const [replyList, setReplyList] = useState<ForumReply[]>([]);

  useEffect(() => {
    if (replies && replies.length > 0) {
      setReplyList(replies);
    }
  }, [replies]);

  const handleDeleteImage = async (replyImage: string) => {
    console.log("image delete id:", replyImage);
    try {
      const deleteReplyImageRes = await fetch(
        `/api/forum-comment-reply-image-delete/${replyImage}`,
        { method: "DELETE" }
      );

      if (!deleteReplyImageRes.ok) {
        throw new Error("Image deletion failed.");
      }

      toast.success("Image deleted successfully.");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Error occurred while deleting the image.");
    }
  };

  const handleDeleteCommentReply = async (
    replyId: string,
    replyImage: string
  ) => {
    if (!currentUserProfileId) {
      toast.error("You have to login to do so.");
      return;
    }

    if (replyImage) {
      await handleDeleteImage(replyImage);
    }

    try {
      const response = await deleteForumCommentReplies(
        currentUserProfileId,
        replyId
      );
      if (response.success) {
        setReplyList((prevReplies) =>
          prevReplies.filter((reply) => reply._id !== replyId)
        );
        toast.success("Comment replies deleted successfully.");
      } else {
        toast.error(response.message || "Failed to delete the comment reply.");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the comment.");
    }
  };

  return (
    <div className="mt-4">
      {replyList.length > 0 &&
        replyList.map((reply, index) => (
          <ForumReplyItem
            key={index}
            currentUserProfileId={currentUserProfileId}
            reply={reply}
            onDelete={() => handleDeleteCommentReply(reply._id, reply?.image)}
            isAdmin={isAdmin}
            dict={dict}
          />
        ))}
    </div>
  );
};

export default ForumReplyList;
