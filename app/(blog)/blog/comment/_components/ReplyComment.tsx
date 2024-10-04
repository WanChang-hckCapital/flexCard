"use client";

import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { X, Paperclip } from "lucide-react";
import Image from "next/image";

interface ReplyCommentProps {
  commentId: string;
  currentUserProfileId: string;
  onReplySubmit: (content: string, imageFile?: File) => Promise<void>;
  onClose: () => void;
}

const ReplyComment: React.FC<ReplyCommentProps> = ({
  commentId,
  currentUserProfileId,
  onReplySubmit,
  onClose,
}) => {
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!replyContent.trim()) {
      toast.error("Reply content cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onReplySubmit(replyContent, selectedImage || undefined);
      setReplyContent("");
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error) {
      toast.error("An error occurred while adding the reply.");
    } finally {
      setIsSubmitting(false);
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
    <div className="relative mt-4 p-4 bg-gray-100 rounded-md">
      <X
        className="absolute top-2 right-2 cursor-pointer text-gray-500 hover:text-black"
        size={20}
        role="button"
        aria-label="Close reply"
        onClick={onClose}
      />

      <Textarea
        placeholder="Write your reply..."
        value={replyContent}
        onChange={(e) => setReplyContent(e.target.value)}
        rows={3}
        className="w-full text-black"
      />

      {imagePreview && (
        <div className="mt-4">
          <Image
            src={imagePreview}
            alt="Selected Image"
            width={300}
            height={200}
            className="rounded-lg object-cover"
          />
        </div>
      )}

      <div className="flex justify-end items-center mt-2 space-x-2">
        <label htmlFor="file-upload" className="cursor-pointer">
          <Paperclip className="text-gray-500 hover:text-gray-700" size={20} />
        </label>
        <input
          type="file"
          id="file-upload"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !replyContent.trim()}
        >
          {isSubmitting ? "Submitting..." : "Submit Reply"}
        </Button>
      </div>
    </div>
  );
};

export default ReplyComment;
