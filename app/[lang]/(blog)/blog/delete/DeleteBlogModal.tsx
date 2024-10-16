"use client";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Pen } from "lucide-react";
import { deleteBlog } from "@/lib/actions/user.actions";
import { toast } from "sonner";

interface DeleteBlogModalProps {
  blogId: string;
  coverImage: string; // thumbnail
  currentUserProfileId: string;
  dict: any;
}

export default function DeleteBlogModal({
  blogId,
  coverImage,
  currentUserProfileId,
  dict,
}: DeleteBlogModalProps) {
  const handleDelete = async () => {
    try {
      const blogDeleteRes = await deleteBlog(currentUserProfileId, blogId);

      if (!blogDeleteRes.success) {
        toast.error(blogDeleteRes.message);
        return;
      }

      const response = await fetch(`/api/blog-image-delete/${coverImage}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Blog and associated image deleted successfully.");
        window.location.href = "/blog";
      } else {
        toast.error("Blog deleted, but failed to delete the image.");
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Failed to delete blog. Please try again.");
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>
          {dict.blog.delete.delete}
          <Pen />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-black">
        <h2 className="text-lg font-semibold">{dict.blog.delete.title}</h2>
        <p>{dict.blog.delete.deleteconfirmmessage}</p>
        <div className="flex justify-end gap-4 mt-4">
          <AlertDialogCancel asChild>
            <Button> {dict.blog.delete.deletecancel}</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={handleDelete}>
              {dict.blog.delete.deleteconfirm}
            </Button>
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
