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
import { deleteForum } from "@/lib/actions/user.actions";
import { toast } from "sonner";

interface DeleteForumModalProps {
  forumId: string;
  coverImage: string; // thumbnail
  currentUserProfileId: string;
}

export default function DeleteForumModal({
  forumId,
  coverImage,
  currentUserProfileId,
}: DeleteForumModalProps) {
  const handleDelete = async () => {
    try {
      const forumDeleteRes = await deleteForum(currentUserProfileId, forumId);
      if (!forumDeleteRes.success) {
        toast.error(forumDeleteRes.message);
        return;
      }
      const response = await fetch(`/api/forum-image-delete/${coverImage}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Forum and associated image deleted successfully.");
        window.location.href = "/forum";
      } else {
        toast.error("Forum deleted, but failed to delete the image.");
      }
    } catch (error) {
      console.error("Error deleting forum:", error);
      toast.error("Failed to delete forum. Please try again.");
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="text-black flex items-center gap-2"
        >
          Delete
          <Pen />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-black">
        <h2 className="text-lg text-white font-semibold">Confirm Deletion</h2>
        <p className="text-white">
          Are you sure you want to delete this forum? This action cannot be
          undone.
        </p>
        <div className="flex justify-end gap-4 mt-4">
          <AlertDialogCancel asChild>
            <Button variant="outline">Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={handleDelete}>
              Confirm
            </Button>
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
