"use client";

import React, { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  checkFollowStatus,
  checkFollowRequestStatus,
  sendFollowRequest,
} from "@/lib/actions/user.actions";

interface FriendItemProps {
  user: {
    userId: string;
    name: string;
    image: string | null;
    profileId: string;
    friendStatus: string;
    accountType: string;
  };
  senderId: string; // current user id
  dict: any;
}

const FriendItem: React.FC<FriendItemProps> = ({ user, senderId, dict }) => {
  const [statusChecked, setStatusChecked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const followStatusResponse = await checkFollowStatus({
          senderId,
          receiverId: user.profileId,
        });

        // console.log("followStatusResponse", followStatusResponse);

        if (followStatusResponse.success) {
          if (followStatusResponse.followStatus) {
            setIsFollowing(true); // Already following
          } else {
            const followRequestResponse = await checkFollowRequestStatus({
              senderId,
              receiverId: user.profileId,
            });

            console.log("followRequestResponse", followRequestResponse);

            if (followRequestResponse.success) {
              setRequestSent(followRequestResponse.requestSent);
            } else {
              toast.error(
                followRequestResponse.message ||
                  "Failed to check follow request status"
              );
            }
          }
        } else {
          toast.error(
            followStatusResponse.message || "Failed to check follow status"
          );
        }
      } catch (error) {
        console.error("Error checking status:", error);
        toast.error("Failed to check follow status");
      } finally {
        setStatusChecked(true);
      }
    };

    checkStatus();
  }, [senderId, user.profileId]);

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
      </div>
      {isFollowing ? (
        <Button variant="green">{dict.addfriend.followstatus.following}</Button>
      ) : requestSent ? (
        <Button variant="outline" disabled>
          {dict.addfriend.followstatus.followrequestsent}
        </Button>
      ) : (
        <Button
          variant="outline"
          onClick={() => handleFollowRequest(senderId, user.userId)}
        >
          {dict.addfriend.followstatus.follow}
        </Button>
      )}
    </div>
  );
};

export default FriendItem;
