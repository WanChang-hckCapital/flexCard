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
}

export default function DeleteBlogModal({
  blogId,
  coverImage,
  currentUserProfileId,
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
        <Button
        // variant="outline"
        // className="dark:text-white text-black flex items-center gap-2"
        >
          Delete
          <Pen />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-black">
        <h2 className="text-lg font-semibold">Confirm Deletion</h2>
        <p>
          Are you sure you want to delete this blog? This action cannot be
          undone.
        </p>
        <div className="flex justify-end gap-4 mt-4">
          <AlertDialogCancel asChild>
            <Button
            // variant="outline"
            >
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              // variant="destructive"
              onClick={handleDelete}
            >
              Confirm
            </Button>
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
