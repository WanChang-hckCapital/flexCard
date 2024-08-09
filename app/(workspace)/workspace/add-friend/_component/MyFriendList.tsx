"use client";

import React from "react";
import { Friend } from "@/types";
import MyFriendItem from "./MyFriendItem";
import { User } from "@/types";

interface MyFriendListProps {
  userFriends: (Friend & { friendUser: User })[];
  authenticatedUserId: string;
}

const MyFriendList: React.FC<MyFriendListProps> = ({
  userFriends,
  authenticatedUserId,
}) => {
  return (
    <div className="grid gap-2">
      {userFriends.length === 0 ? (
        <p>No friend found.</p>
      ) : (
        userFriends.map((friend) => {
          return (
            <MyFriendItem
              key={friend._id}
              authenticatedUserId={authenticatedUserId}
              friendSince={friend.createdAt}
              friend={friend.friendUser}
            />
          );
        })
      )}
    </div>
  );
};

export default MyFriendList;
