"use client";

import React, { useEffect, useState } from "react";
import { User } from "@/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  unfriendFriend,
  unfollowFriend,
  getFollowStatus,
  followFriend,
} from "@/lib/actions/user.actions";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface MyFriendItemProps {
  friend: User;
  friendSince: Date | string;
  authenticatedUserId: string;
}

const MyFriendItem: React.FC<MyFriendItemProps> = ({
  friend,
  friendSince,
  authenticatedUserId,
}) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [unfollowDialogOpen, setUnfollowDialogOpen] = useState(false);
  const [unfriendDialogOpen, setUnfriendDialogOpen] = useState(false);

  useEffect(() => {
    const fetchFollowStatus = async () => {
      try {
        const response = await getFollowStatus(authenticatedUserId, friend._id);
        setIsFollowing(response.isFollowing);
      } catch (error) {
        console.error("Error fetching follow status:", error);
      }
    };

    fetchFollowStatus();
  }, [authenticatedUserId, friend._id]);

  const handleUnfriend = async () => {
    try {
      const response = await unfriendFriend(authenticatedUserId, friend._id);
      if (response.success) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error unfriending user");
    } finally {
      setUnfriendDialogOpen(false);
    }
  };

  const handleUnfollow = async () => {
    try {
      const response = await unfollowFriend(authenticatedUserId, friend._id);
      if (response.success) {
        toast.success(response.message);
        setIsFollowing(false);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error unfollowing user");
    } finally {
      setUnfollowDialogOpen(false);
    }
  };

  const handleFollow = async () => {
    try {
      const response = await followFriend(authenticatedUserId, friend._id);
      if (response.success) {
        toast.success(response.message);
        setIsFollowing(true);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error following user");
    }
  };

  const formattedDate =
    typeof friendSince === "string"
      ? format(new Date(friendSince), "PPP")
      : format(friendSince, "PPP");

  return (
    <div className="flex items-center gap-3 rounded-md p-2 hover:bg-muted">
      <Avatar className="h-8 w-8">
        <AvatarImage src={friend.image || "/assets/user.svg"} alt="Avatar" />
        <AvatarFallback>
          {friend.name ? friend.name.charAt(0) : "U"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 truncate">
        <div className="font-medium">{friend.name}</div>
        <div className="text-sm text-muted-foreground">
          Friends since {formattedDate}
        </div>
      </div>
      {isFollowing ? (
        <>
          <AlertDialog
            open={unfollowDialogOpen}
            onOpenChange={setUnfollowDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Unfollow</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Unfollow {friend.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to unfollow {friend.name}? This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleUnfollow}>
                  Unfollow
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      ) : (
        <Button variant="outline" onClick={handleFollow}>
          Follow
        </Button>
      )}
      <AlertDialog
        open={unfriendDialogOpen}
        onOpenChange={setUnfriendDialogOpen}
      >
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Unfriend</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unfriend {friend.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unfriend {friend.name}? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnfriend}>
              Unfriend
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyFriendItem;
