"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { acceptFollowRequest } from "@/lib/actions/user.actions";
import { toast } from "sonner";

interface FollowRequestModalProps {
  initialFollowRequests: any[];
}

const FollowRequestModal: React.FC<FollowRequestModalProps> = ({
  initialFollowRequests,
}) => {
  const [followRequests, setFollowRequests] = useState(initialFollowRequests);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAcceptClick = async (requestId: string) => {
    console.log(`Accepted follow request with ID: ${requestId}`);

    try {
      const followRequestUpdate = await acceptFollowRequest(requestId);

      if (followRequestUpdate.success) {
        toast.success("Follow request accepted successfully!");

        // Remove the accepted request from the list and update the state
        setFollowRequests((prevRequests) =>
          prevRequests.filter((request) => request._id !== requestId)
        );

        setIsModalOpen(false); // Close the modal after accepting
      } else {
        toast.error(
          followRequestUpdate.message || "Failed to accept follow request."
        );
      }
    } catch (error) {
      toast.error("An error occurred while accepting the follow request.");
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <>
          <p>Follow Request: </p>
          <Badge
            className="cursor-pointer"
            variant="bgRed"
            onClick={() => setIsModalOpen(true)}
          >
            {followRequests.length}
          </Badge>
        </>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Follow Requests</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {followRequests.length === 0 ? (
              <p>No follow requests found</p>
            ) : (
              followRequests.map((request, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex flex-wrap items-center gap-4 w-full">
                    {request.image ? (
                      <Image
                        src={request.image.toString()}
                        alt="Follower's Image"
                        width={40}
                        height={40}
                        className="rounded-full object-cover shadow-2xl"
                      />
                    ) : (
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={request.image || "/assets/user.svg"}
                          alt="Avatar"
                        />
                      </Avatar>
                    )}
                    <p>{request.sender}</p>
                    <Button
                      className="ml-auto"
                      onClick={() => handleAcceptClick(request._id)}
                    >
                      Accept
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          <DialogClose asChild>
            <Button variant="ghost" className="mt-4">
              Close
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FollowRequestModal;
