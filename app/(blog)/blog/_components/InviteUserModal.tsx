"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getBlogWriterList,
  sendCreatorInvitation,
} from "@/lib/actions/user.actions";
import { toast } from "sonner";

interface InviteUserModalProps {
  currentProfileId: string;
  onClose: () => void;
}

const InviteUserModal: React.FC<InviteUserModalProps> = ({
  currentProfileId,
  onClose,
}) => {
  const [profiles, setProfiles] = useState<
    { accountname: string; email: string; _id: string; image: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedProfile, setSelectedProfile] = useState<{
    accountname: string;
    email: string;
    _id: string;
  } | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const fetchProfiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getBlogWriterList(currentProfileId);

      if (result.success) {
        setProfiles(result.profiles);
      } else {
        setError(result.message);
        toast.error(result.message);
      }
    } catch (error) {
      setError("An error occurred while fetching users.");
      toast.error("An error occurred while fetching users.");
    } finally {
      setIsLoading(false);
    }
  }, [currentProfileId]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const inviteCreator = async (invitorId: string) => {
    if (!currentProfileId) {
      toast.error("You have to login to do so.");
      setError("You have to login to do so.");
      return;
    }

    try {
      const invitationRes = await sendCreatorInvitation(
        currentProfileId,
        invitorId
      );

      if (invitationRes.success) {
        toast.success(invitationRes.message);
        onClose();
      } else {
        toast.error(invitationRes.message);
      }
    } catch (error: any) {
      toast.error("Error when sending the invitation.");
    }
  };

  const handleInviteClick = (profile: {
    accountname: string;
    email: string;
    _id: string;
  }) => {
    setSelectedProfile(profile);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmInvite = () => {
    if (selectedProfile) {
      inviteCreator(selectedProfile._id);
    }
  };

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="bg-black text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Invite Creator to Write a Blog</DialogTitle>
          </DialogHeader>
          {isLoading ? (
            <p>Loading users...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <ul
              className="space-y-2 overflow-y-scroll"
              style={{ maxHeight: "300px" }}
            >
              {profiles.length > 0 ? (
                profiles.map((profile, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center p-2 bg-gray-100 rounded-md"
                  >
                    <span className="text-black">
                      {profile.accountname}{" "}
                      {profile.email && ` (${profile.email})`}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleInviteClick(profile)}
                    >
                      Invite
                    </Button>
                  </li>
                ))
              ) : (
                <p>No users available to invite.</p>
              )}
            </ul>
          )}
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {selectedProfile && (
        <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
          <DialogContent className="bg-black text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>Confirm Invitation</DialogTitle>
            </DialogHeader>
            <p>
              Are you sure you want to invite{" "}
              <strong>{selectedProfile.accountname}</strong> to be a creator?
            </p>
            <div className="mt-4 flex justify-end">
              <Button
                variant="destructive"
                onClick={() => setIsConfirmModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                className="ml-2"
                onClick={handleConfirmInvite}
              >
                Confirm
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default InviteUserModal;
