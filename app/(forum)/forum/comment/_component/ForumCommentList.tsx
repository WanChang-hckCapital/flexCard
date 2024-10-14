"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  // submitBlogComment,
  // deleteBlogComment,
  submitForumComment,
  deleteForumComment,
} from "@/lib/actions/user.actions";
// import BlogCommentItem from "./BlogCommentItem";
import ForumCommentItem from "./ForumCommentItem";
import { Paperclip } from "lucide-react";
import Image from "next/image";

interface ForumComment {
  _id: string;
  content: string;
  forum: string;
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

interface ForumCommentListProps {
  forumId: string;
  comments: ForumComment[];
  currentUserProfileId: string;
  currentUserImg: string;
  currentUserName: string;
  isAdmin: boolean;
}

const ForumCommentList: React.FC<ForumCommentListProps> = ({
  forumId,
  comments,
  currentUserProfileId,
  currentUserImg,
  currentUserName,
  isAdmin,
}) => {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [commentList, setCommentList] = useState(comments);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleCommentSubmit = async () => {
    if (!currentUserProfileId) {
      console.log("not login");
      toast.error("You have to login to leave a comment.");
      setError("You have to login to leave a comment.");
      return;
    }

    if (!newComment.trim()) {
      setError("Comment cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    let fileId = null;

    try {
      if (selectedImage) {
        console.log("yes picture");
        const formData = new FormData();

        formData.append("imageFile", selectedImage);
        const blogCommentImageUploadRes = await fetch(
          "/api/forum-comment-image-submit",
          {
            method: "POST",
            body: formData,
          }
        );

        if (blogCommentImageUploadRes.ok) {
          const result = await blogCommentImageUploadRes.json();
          fileId = result.fileId;
          console.log("sucess fileId", fileId);
        } else {
          setError("Comment Image Upload Unsuccessfully");
          return;
        }
      }

      const response = await submitForumComment(
        currentUserProfileId,
        forumId,
        newComment,
        fileId
      );

      if (response.success) {
        // for frontend
        const newCommentData: ForumComment = {
          _id: response.comment?._id,
          content: newComment,
          author: {
            accountname: currentUserName,
            image: currentUserImg,
            authorId: currentUserProfileId,
          },
          image: fileId || "",
          forum: forumId,
          likes: [],
          created_at: new Date(),
          replyCount: 1,
        };

        console.log("frontedn");
        console.log(newCommentData);

        setCommentList((prev) => [...prev, newCommentData]);
        setNewComment("");
        setSelectedImage(null);
        setImagePreview(null);
        toast.success(response.message || "Comment added successfully!");
      } else {
        setError(response.message || "Failed to add comment.");
      }
    } catch (error) {
      setError("An error occurred while posting the comment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteImage = async (replyImage: string) => {
    console.log("image delete id:", replyImage);
    try {
      const deleteCommentImageRes = await fetch(
        `/api/forum-comment-image-delete/${replyImage}`,
        { method: "DELETE" }
      );

      if (!deleteCommentImageRes.ok) {
        throw new Error("Image deletion failed.");
      }

      toast.success("Image deleted successfully.");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Error occurred while deleting the image.");
    }
  };

  const handleDeleteComment = async (commentId: string, imageId: string) => {
    if (!currentUserProfileId) {
      toast.error("You have to login to do so.");
      setError("You have to login to do so.");
      return;
    }

    if (imageId) {
      await handleDeleteImage(imageId);
    }

    try {
      const response = await deleteForumComment(
        currentUserProfileId,
        commentId
      );

      if (response.success) {
        setCommentList((prevComments) =>
          prevComments.filter((comment) => comment._id !== commentId)
        );
        toast.success("Comment deleted successfully.");
      } else {
        toast.error(response.message || "Failed to delete the comment.");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the comment.");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Comments</h3>

      <div className="space-y-4">
        {commentList.map((comment, index) => (
          <ForumCommentItem
            key={index}
            comment={comment}
            currentUserProfileId={currentUserProfileId}
            onDelete={() => handleDeleteComment(comment._id, comment.image)}
            isAdmin={isAdmin}
          />
        ))}
      </div>

      <div className="mt-8">
        {imagePreview && (
          <div className="mb-4">
            <Image
              src={imagePreview}
              alt="Image Preview"
              width={300}
              height={200}
              className="rounded-lg object-cover shadow-md"
            />
          </div>
        )}
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={4}
          className="w-full text-black"
        />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <div className="flex justify-end items-center gap-2 mt-4">
          <label htmlFor="image-upload" className="cursor-pointer">
            <Paperclip
              size={24}
              className="text-gray-600 hover:text-blue-600"
            />
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
          <Button
            onClick={handleCommentSubmit}
            disabled={isSubmitting || !newComment.trim()}
          >
            {isSubmitting ? "Submitting..." : "Submit Comment"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ForumCommentList;
