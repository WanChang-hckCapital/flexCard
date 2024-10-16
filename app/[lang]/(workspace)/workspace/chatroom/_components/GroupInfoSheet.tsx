"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Plus,
  UserRoundX,
  MessageCircleX,
  Pencil,
  UserPlus,
} from "lucide-react";
import { groupImageUpdate } from "@/lib/actions/user.actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ParticipantList from "./ParticipantList";
import Image from "next/image";

interface GroupInfoProps {
  participants: any[];
  isGroupInfoSheetOpen: boolean;
  setGroupInfoSheetOpen: (open: boolean) => void;
  selectedChatroomData: any;
  authenticatedUserId: string;
  invitableUsers: any[];
  invitableUsersLoading: boolean;
  handleInvitorChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    userId: string
  ) => void;
  inviteUserHandler: () => void;
  handleAppointAdmin: (participantId: string) => void;
  dischargeAppointAdmin: (participantId: string) => void;
  silentHandler: (
    silentTargetId: string,
    silentDuration: number | null
  ) => void;
  unsilentHandler: (silentTargetId: string) => void;
  leaveGroupHandler: () => void;
  loadInvitorList: () => void;
  admins: string[];
  allSilentUser: { userId: string; silentUntil: string | null }[];
  handleRemoveMember: (participantId: string) => void;
}

export default function GroupInfoSheet({
  participants,
  isGroupInfoSheetOpen,
  setGroupInfoSheetOpen,
  selectedChatroomData,
  authenticatedUserId,
  invitableUsers,
  invitableUsersLoading,
  handleInvitorChange,
  inviteUserHandler,
  handleAppointAdmin,
  dischargeAppointAdmin,
  silentHandler,
  unsilentHandler,
  leaveGroupHandler,
  loadInvitorList,
  admins,
  allSilentUser,
  handleRemoveMember,
}: GroupInfoProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [groupImageUrl, setGroupImageUrl] = useState<string | null>(null);
  const [groupImagePreview, setGroupImagePreview] = useState<string | null>(
    null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const [silentParticipantId, setSilentParticipantId] = useState<string | null>(
    null
  );
  const [silentDuration, setSilentDuration] = useState<number | null>(null);
  const [isSilentDialogOpen, setSilentDialogOpen] = useState<boolean>(false);

  const handleSilentClick = (participantId: string) => {
    setSilentParticipantId(participantId);
    setSilentDialogOpen(true);
  };

  const handleConfirmSilence = () => {
    if (silentParticipantId !== null) {
      silentHandler(silentParticipantId, silentDuration);
    }
    setSilentDialogOpen(false);
  };

  useEffect(() => {
    const fetchGroupImage = async () => {
      if (selectedChatroomData?.groupImage) {
        try {
          const response = await fetch(
            `/api/group-image-load/${selectedChatroomData.groupImage}`
          );

          if (response.ok) {
            const data = await response.json();
            setGroupImageUrl(data.fileDataUrl);
          } else {
            console.error("Failed to load group image:", response.statusText);
          }
        } catch (error) {
          console.error("Error fetching group image:", error);
        }
      }
    };

    fetchGroupImage();
  }, [selectedChatroomData?.groupImage]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setGroupImagePreview(fileUrl);
      setSelectedFile(file);
    }
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("chatroomId", selectedChatroomData.chatroomId);

      const response = await fetch("/api/group-image-submit", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Group Image uploaded successfully:", result.fileId);

        const groupImageUpdateChatroom = await groupImageUpdate(
          selectedChatroomData.chatroomId,
          result.fileId
        );

        if (groupImageUpdateChatroom.success) {
          const newImageUrl = `/api/group-image-submit/${result.fileId}`;
          setGroupImageUrl(newImageUrl); // Update with new image URL after successful upload
          setGroupImagePreview(null); // Clear the preview after upload
        } else {
          console.error("Error updating chatroom with group image.");
        }
      } else {
        console.error("Error uploading image:", response.statusText);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelUpload = () => {
    setGroupImagePreview(null);
    setSelectedFile(null);
  };

  return (
    <Sheet open={isGroupInfoSheetOpen} onOpenChange={setGroupInfoSheetOpen}>
      <SheetContent
        side="right"
        className="flex flex-col bg-white dark:bg-black justify-between h-full z-[1000]"
      >
        <SheetHeader>
          <div className="w-full flex flex-col items-center relative">
            <div className="relative group w-24 h-24">
              <Avatar className="w-full h-full bg-black dark:text-black">
                <AvatarImage
                  src={
                    groupImagePreview || groupImageUrl || "/assets/users.svg"
                  }
                  alt={selectedChatroomData?.name}
                  className="object-cover"
                />
                <AvatarFallback className="text-5xl">
                  {selectedChatroomData?.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              {(selectedChatroomData?.superAdmin.includes(
                authenticatedUserId
              ) ||
                selectedChatroomData?.admin.includes(authenticatedUserId)) && (
                <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    className="text-white"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Pencil className="h-6 w-6" />
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                </div>
              )}
            </div>

            <div className="text-center mt-4">
              <SheetTitle className="text-base font-bold">
                {selectedChatroomData?.name || "Group Info"}
              </SheetTitle>
              <p className="text-sm dark:text-gray-500 text-black">
                Created At:{" "}
                {selectedChatroomData?.createdAt
                  ? new Date(
                      selectedChatroomData.createdAt
                    ).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </SheetHeader>

        {groupImagePreview && (
          <div className="flex flex-col items-center mt-4">
            <Image
              src={groupImagePreview}
              alt="Group Preview"
              width={300}
              height={300}
              className="w-32 h-32 object-cover rounded-full"
            />
            <div className="flex gap-2 mt-4">
              <Button onClick={handleConfirmUpload} disabled={loading}>
                Upload
              </Button>
              <Button variant="secondary" onClick={handleCancelUpload}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="p-4 dark:text-white text-black flex-grow">
          <div className="flex justify-between items-center mb-4 ml-1">
            <p className="font-bold text-base mb-4 ml-1">
              {selectedChatroomData?.participants.length} Members
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button>
                  <UserPlus
                    onClick={loadInvitorList}
                    className="h-6 w-6 cursor-pointer dark:text-gray-400 hover:text-gray-600"
                  />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="z-[1100] bg-black">
                <AlertDialogHeader>
                  <AlertDialogTitle>Invite a User</AlertDialogTitle>
                  <AlertDialogDescription>
                    Select a user to invite to the group.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="p-4">
                  {invitableUsersLoading ? (
                    <p>Loading users...</p>
                  ) : (
                    <ul className="space-y-2">
                      {invitableUsers.length > 0 ? (
                        invitableUsers.map((user) => (
                          <li
                            key={user._id}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="checkbox"
                              value={user._id}
                              onChange={(e) => handleInvitorChange(e, user._id)}
                            />
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={user.image || "/default-avatar.png"}
                              />
                              <AvatarFallback>
                                {user.accountname.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <p>{user.accountname}</p>
                          </li>
                        ))
                      ) : (
                        <p>No users available to invite.</p>
                      )}
                    </ul>
                  )}
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={inviteUserHandler}>
                    Invite
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="space-y-4 flex-grow">
            <ParticipantList
              participants={participants}
              authenticatedUserId={authenticatedUserId}
              superAdmins={selectedChatroomData?.superAdmin || []}
              admins={admins}
              silentUsers={allSilentUser}
              handleAppointAdmin={handleAppointAdmin}
              dischargeAppointAdmin={dischargeAppointAdmin}
              handleSilentClick={handleSilentClick}
              unsilentHandler={unsilentHandler}
              handleRemoveMember={handleRemoveMember}
            />
          </div>
        </div>

        <Dialog open={isSilentDialogOpen} onOpenChange={setSilentDialogOpen}>
          <DialogContent className="z-[1100]">
            <DialogHeader>
              <DialogTitle>Choose Silence Duration</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <ul className="space-y-2">
                <li>
                  <label>
                    <input
                      type="radio"
                      className="mr-3"
                      name="silence-duration"
                      value={3}
                      onChange={() => setSilentDuration(3)}
                    />
                    3 Days
                  </label>
                </li>
                <li>
                  <label>
                    <input
                      type="radio"
                      className="mr-3"
                      name="silence-duration"
                      value={7}
                      onChange={() => setSilentDuration(7)}
                    />
                    1 Week
                  </label>
                </li>
                <li>
                  <label>
                    <input
                      type="radio"
                      className="mr-3"
                      name="silence-duration"
                      value={30}
                      onChange={() => setSilentDuration(30)}
                    />
                    1 Month
                  </label>
                </li>
                <li>
                  <label>
                    <input
                      type="radio"
                      className="mr-3"
                      name="silence-duration"
                      value=""
                      onChange={() => setSilentDuration(null)} // Infinite until unsilenced
                    />
                    Until Unsilenced
                  </label>
                </li>
              </ul>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary"
                onClick={() => setSilentDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleConfirmSilence}>Confirm</Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="p-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="w-full" variant="destructive">
                Leave Group
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="z-[1200]">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. You will leave the group.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={leaveGroupHandler}>
                  Leave Group
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SheetContent>
    </Sheet>
  );
}
