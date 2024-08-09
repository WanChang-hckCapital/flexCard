"use client";

import React, { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import {
  getFriendRequestStatus,
  followPrivateAcc,
  sendFollowRequestPublic,
} from "@/lib/actions/user.actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getFollowStatus } from "@/lib/actions/user.actions";

interface FriendItemProps {
  user: {
    _id: string;
    name: string;
    image: string | null;
    friendStatus: string;
    accountType: string;
  };
  senderId: string; // current user id
}

const FriendItem: React.FC<FriendItemProps> = ({ user, senderId }) => {
  const [statusChecked, setStatusChecked] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [followed, setFollowed] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const friendRequestStatus = await getFriendRequestStatus(
          senderId,
          user._id
        );
        if (friendRequestStatus.success) {
          setRequestSent(true);
        } else {
          setRequestSent(false);
        }

        if (user.accountType === "private") {
          const followStatus = await getFollowStatus(senderId, user._id);
          if (followStatus.success && followStatus.isFollowing) {
            setFollowed(true);
          } else {
            setFollowed(false);
          }
        }
      } catch (error) {
        console.error("Error checking status:", error);
      } finally {
        setStatusChecked(true);
      }
    };

    checkStatus();
  }, [senderId, user._id, user.accountType]);

  // for public account
  const handleFollowRequest = async (senderId: string, receiverId: string) => {
    console.log("sender:" + senderId + ", receiver" + receiverId);

    try {
      const response = await sendFollowRequestPublic(senderId, receiverId);
      if (response.success) {
        console.log(response.message);
        toast.success(response.message);
        setRequestSent(true);
      } else {
        toast.error(response.message);
        console.error(response.message);
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  const handlePrivateAccFollow = async (
    currentAccId: string,
    followId: string
  ) => {
    try {
      const response = await followPrivateAcc(currentAccId, followId);

      console.log("response" + response);

      if (response.success) {
        toast.success(response.message);
        setFollowed(true);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error following private account");
      console.error("Error following private account:", error);
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
      key={user._id}
      className="flex items-center gap-3 rounded-md p-2 hover:bg-muted"
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={user.image || "/assets/user.svg"} alt="Avatar" />
        <AvatarFallback>{user.name ? user.name.charAt(0) : "U"}</AvatarFallback>
      </Avatar>
      <div className="flex-1 truncate">
        <div className="font-medium">{user.name}</div>
        <div className="font-medium">{user.accountType}</div>
        <div className="font-medium">{user._id}</div>
        {/* <div className="font-medium">{user.friendStatus}</div> */}
      </div>
      {user.accountType === "private" ? (
        followed ? (
          <Button variant="destructive">Following</Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => handlePrivateAccFollow(senderId, user._id)}
          >
            Follow
          </Button>
        )
      ) : requestSent ? (
        <span>Request Sent</span>
      ) : (
        <Button
          variant="outline"
          onClick={() => handleFollowRequest(senderId, user._id)}
        >
          Follow
        </Button>
      )}
    </div>
  );
};

export default FriendItem;
