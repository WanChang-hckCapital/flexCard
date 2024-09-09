"use client";

import React, { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  checkIfFollowing,
  sendFollowRequest,
  checkFollowRequestStatus, // Import the new function for checking follow request status
} from "@/lib/actions/user.actions";

interface FriendItemProps {
  user: {
    userId: string;
    name: string;
    image: string | null;
    friendStatus: string;
    accountType: string;
  };
  senderId: string; // current user id
}

const FriendItem: React.FC<FriendItemProps> = ({ user, senderId }) => {
  const [statusChecked, setStatusChecked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [requestSent, setRequestSent] = useState(false); // New state for tracking follow request status

  useEffect(() => {
    const checkStatus = async () => {
      try {
        if (user.accountType === "PUBLIC") {
          // Check if the current user is following the target user for public accounts
          const followStatus = await checkIfFollowing({
            authActiveProfileId: senderId,
            accountId: user.userId,
          });

          console.log("follow sattus");
          console.log(followStatus);

          if (followStatus.success) {
            setIsFollowing(followStatus.isFollowing);
          } else {
            toast.error(
              followStatus.message || "Failed to check follow status"
            );
          }
        } else if (user.accountType === "PRIVATE") {
          // Check if a follow request has been sent for private accounts
          const followRequestStatus = await checkFollowRequestStatus({
            senderId,
            receiverId: user.userId,
          });

          if (followRequestStatus.success) {
            setRequestSent(followRequestStatus.requestSent);
          } else {
            toast.error(
              followRequestStatus.message ||
                "Failed to check follow request status"
            );
          }
        }
      } catch (error) {
        console.error("Error checking status:", error);
        toast.error("Failed to check follow status");
      } finally {
        setStatusChecked(true);
      }
    };

    checkStatus();
  }, [senderId, user.userId, user.accountType]);

  const handleFollowRequest = async (senderId: string, receiverId: string) => {
    try {
      const response = await sendFollowRequest(senderId, receiverId);

      if (response.success) {
        toast.success(response.message);
        if (user.accountType === "PRIVATE") {
          setRequestSent(true);
        } else {
          setIsFollowing(true);
        }
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error sending follow request:", error);
      toast.error("Failed to send follow request");
    }
  };

  if (!statusChecked) {
    return <div>Loading...</div>;
  }

  if (user.friendStatus === "not added") {
    return null;
  }

  return (
    <div
      key={user.userId}
      className="flex items-center gap-3 rounded-md p-2 hover:bg-muted"
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={user.image || "/assets/user.svg"} alt="Avatar" />
        <AvatarFallback>{user.name ? user.name.charAt(0) : "U"}</AvatarFallback>
      </Avatar>
      <div className="flex-1 truncate">
        <div className="font-medium">{user.name}</div>
        <div className="font-medium">{user.accountType}</div>
        <div className="font-medium">{user.userId}</div>
      </div>
      {user.accountType === "PRIVATE" ? (
        requestSent ? (
          <Button variant="outline" disabled>
            Follow Request Sent
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => handleFollowRequest(senderId, user.userId)}
          >
            Follow
          </Button>
        )
      ) : isFollowing ? (
        <Button variant="destructive">Following</Button>
      ) : (
        <Button
          variant="outline"
          onClick={() => handleFollowRequest(senderId, user.userId)}
        >
          Follow
        </Button>
      )}
    </div>
  );
};

export default FriendItem;
