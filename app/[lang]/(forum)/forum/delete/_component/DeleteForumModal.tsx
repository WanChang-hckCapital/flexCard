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
  dict: any;
}

export default function DeleteForumModal({
  forumId,
  coverImage,
  currentUserProfileId,
  dict,
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
          // variant="outline"
          className="dark:text-black text-white flex items-center gap-2"
        >
          {dict.forum.delete.delete}
          <Pen />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="dark:bg-black bg-white dark:text-white text-black">
        <h2 className="text-lg dark:text-white text-black font-semibold">
          {dict.forum.delete.title}
        </h2>
        <p className="dark:text-white text-black">
          {dict.forum.delete.deleteconfirmmessage}
        </p>
        <div className="flex justify-end gap-4 mt-4">
          <AlertDialogCancel asChild>
            <Button>{dict.forum.delete.deletecancel}</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={handleDelete}>
              {dict.forum.delete.deleteconfirm}
            </Button>
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
