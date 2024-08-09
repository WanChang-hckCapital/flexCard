"use client";

import React, { useState, useEffect } from "react";
import { getCurrentUserAllFriendRequest } from "@/lib/actions/user.actions";
import { FriendRequest } from "@/types";
import FriendRequestItem from "./ReceiveRequestItem";
import { Badge } from "@/components/ui/badge";

interface FriendRequestListProps {
  authenticatedUserId: string;
}

const FriendRequestList: React.FC<FriendRequestListProps> = ({
  authenticatedUserId,
}) => {
  const [friendRequests, setFriendRequests] = useState<
    (FriendRequest & { senderName: string })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchFriendRequests = async () => {
    try {
      const response = await getCurrentUserAllFriendRequest(
        authenticatedUserId
      );
      if (response.success && response.length) {
        setFriendRequests(response.friendRequests);
      } else {
        setError(response.message || "Failed to fetch friend requests");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriendRequests();
  }, [authenticatedUserId]);

  const handleUpdate = (msg: string) => {
    setMessage(msg);
    fetchFriendRequests();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    // return <div>Error: {error}</div>;
    console.log("list error:" + error);
  }

  // Filter friend requests with status 1
  const filteredRequests = friendRequests.filter(
    (request) => request.status === 1
  );

  return (
    <div className="grid gap-2">
      <div className="text-sm font-medium text-muted-foreground">
        {/* Your Friend Requests */}
        {filteredRequests.length > 0 && (
          <Badge variant="bgRed" className="ml-2">
            {filteredRequests.length}
          </Badge>
        )}
        {message && <p className="text-green-500">{message}</p>}{" "}
        {filteredRequests.length === 0 ? (
          <p>No friend requests found.</p>
        ) : (
          filteredRequests.map((request) => (
            <div className="text-sm font-medium text-muted-foreground">
              <FriendRequestItem
                key={request._id}
                friendRequest={request}
                authenticatedId={authenticatedUserId}
                onUpdate={handleUpdate}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FriendRequestList;
