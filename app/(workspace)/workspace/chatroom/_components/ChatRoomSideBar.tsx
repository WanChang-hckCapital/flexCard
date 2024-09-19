"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SendIcon, PlusIcon, UserIcon, UsersIcon } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ChatRoomSearchBar from "./ChatRoomSearchBar";
import { Dialog, DialogContent, DialogOverlay } from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import {
  createOrGetChatroom,
  createGroupChatroom,
} from "@/lib/actions/user.actions";
import { toast } from "sonner";

interface AllFollowerAndFollowing {
  success: boolean;
  message: string;
  followers: any[];
  following: any[];
  merged: any[];
}

interface Participant {
  _id: string;
  participantId: string;
  accountname: string;
  image: string;
  user: string;
}

interface Chatroom {
  _id: string;
  name: string;
  type: string;
  participants: Participant[];
  superAdmin: string[];
  admin: string[];
  silentUser: any[];
  groupImage: {};
  chatroomId: string;
  createdAt: string;
}

interface ChatroomSideBarProps {
  chatrooms: Chatroom[];
  authenticatedUserId: string;
  onSelectChatroom: (chatroomId: string) => void;
  allUsers: any[];
  allFollowerAndFollowingForPersonal: {
    followers: any[];
    following: any[];
    merged: any[];
  };
  allFollowerAndFollowingForGroup: {
    followers: any[];
    following: any[];
    merged: any[];
  };
}

export default function ChatRoomSideBar({
  chatrooms,
  authenticatedUserId,
  onSelectChatroom,
  allUsers,
  allFollowerAndFollowingForPersonal,
  allFollowerAndFollowingForGroup,
}: ChatroomSideBarProps) {
  const [isPersonalModalOpen, setIsPersonalModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([
    authenticatedUserId,
  ]);
  const [groupChatName, setGroupChatName] = useState("");

  const [groupImages, setGroupImages] = useState<{ [key: string]: string }>({});

  const fetchGroupImage = async (groupId: string) => {
    try {
      const response = await fetch(`/api/group-image-load/${groupId}`);

      if (response.ok) {
        const data = await response.json();
        console.log("before");
        setGroupImages((prev) => ({
          ...prev,
          [groupId]: data.fileDataUrl,
        }));
        console.log("after");
      } else {
        console.error("Failed to load group image:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching group image:", error);
    }
  };

  // useEffect(() => {
  //   chatrooms.forEach((chatroom) => {
  //     if (chatroom.type === "GROUP" && chatroom.groupImage) {
  //       fetchGroupImage(chatroom.groupImage.toString());
  //     }
  //   });
  // }, [chatrooms]);
  useEffect(() => {
    console.log("Chatrooms updated: ", chatrooms);

    if (chatrooms.length > 0) {
      chatrooms.forEach((chatroom) => {
        console.log("Checking chatroom: ", chatroom);
        if (chatroom.type === "GROUP" && chatroom.groupImage) {
          fetchGroupImage(chatroom.groupImage.toString());
        }
      });
    }
  }, [chatrooms]);

  const showNewPersonalChat = () => {
    setIsPersonalModalOpen(true);
  };

  const closePersonalModal = () => {
    setIsPersonalModalOpen(false);
  };

  const createNewGroupChat = () => {
    setIsGroupModalOpen(true);
  };

  const closeGroupModal = () => {
    setIsGroupModalOpen(false);
    setSelectedParticipants([authenticatedUserId]); // reset to including the current user
    // setIsConfirmingGroup(false);
  };

  const handleCheckboxChange = (participantId: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(participantId)
        ? prev.filter((id) => id !== participantId)
        : [...prev, participantId]
    );
  };

  // create new group chatroom
  const handleCreateGroupChat = async () => {
    console.log("Creating group chat with name:", groupChatName);
    console.log("Participants:", selectedParticipants);
    closeGroupModal();

    try {
      const newGroupChatroom = await createGroupChatroom(
        authenticatedUserId,
        selectedParticipants,
        groupChatName
      );
      if (newGroupChatroom.success) {
        toast.success(newGroupChatroom.message);
      } else {
        toast.error(newGroupChatroom.message);
        console.error(
          "Failed to create or retrieve group chatroom:",
          newGroupChatroom.message
        );
      }
    } catch (error: any) {
      console.error("Error in creating new group chatroom:", error);
      toast.error(
        "An error occurred while creating or retrieving the group chatroom."
      );
    }
  };

  // create personal chatroom
  const createNewPersonalChatroom = async (participantId: string) => {
    console.log(
      "Attempting to create or get chatroom for participant:",
      participantId
    );

    try {
      const newChatroom = await createOrGetChatroom(
        authenticatedUserId,
        participantId
      );

      console.log(newChatroom);

      if (newChatroom && newChatroom.success) {
        console.log("Chatroom created successfully:", newChatroom?.chatroom);
        toast.success("Chatroom created successfully!");
      } else {
        console.error(
          "Failed to create or retrieve chatroom:",
          newChatroom?.message
        );
        toast.error("Error: " + newChatroom?.message);
      }
    } catch (error: any) {
      console.error("Error in createNewPersonalChatroom:", error);
      toast.error(
        "An error occurred while creating or retrieving the chatroom."
      );
    }
  };

  return (
    <>
      {/* <div className="flex justify-center p-4">
        <ChatRoomSearchBar />
      </div> */}
      <hr></hr>
      <div className="flex h-16 items-center border-b px-4">
        <h3 className="text-lg font-semibold">Messages</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto rounded-full"
            >
              <PlusIcon className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={showNewPersonalChat}>
              <UserIcon className="mr-2 h-4 w-4" />
              New Chat
            </DropdownMenuItem>
            <DropdownMenuItem onClick={createNewGroupChat}>
              <UsersIcon className="mr-2 h-4 w-4" />
              New Group Chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {isPersonalModalOpen && (
        <Dialog
          open={isPersonalModalOpen}
          onOpenChange={setIsPersonalModalOpen}
        >
          <DialogOverlay className="fixed inset-0 bg-black opacity-30 z-40" />
          <DialogContent className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-md w-full relative">
              <button
                className="absolute top-2 right-2"
                onClick={closePersonalModal}
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
              <h3 className="text-lg font-semibold text-black">New Chat</h3>
              <div className="mt-4 max-h-64 overflow-y-auto">
                {allFollowerAndFollowingForPersonal?.merged &&
                allFollowerAndFollowingForPersonal.merged.length > 0 ? (
                  allFollowerAndFollowingForPersonal.merged.map((merged) => (
                    <div
                      key={merged?.id}
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer hover:bg-gray-200"
                      onClick={() => createNewPersonalChatroom(merged.userId)}
                    >
                      <Avatar className="h-8 w-8 border">
                        <AvatarImage src={merged?.image} />
                        <AvatarFallback>
                          {merged?.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <div className="font-medium truncate text-black">
                          {merged?.name}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500">
                    Follow more people to chat with them.
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {isGroupModalOpen && (
        <Dialog open={isGroupModalOpen}>
          <DialogOverlay className="fixed inset-0 bg-black opacity-30 z-40" />
          <DialogContent className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg relative">
              <button
                className="absolute top-2 right-2"
                onClick={closeGroupModal}
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
              <h3 className="text-lg font-semibold text-black">
                New Group Chat
              </h3>
              <p className="text-black">
                Here you can add participants or start a new chat.
              </p>
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Enter group chat name"
                  value={groupChatName}
                  onChange={(e) => setGroupChatName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-black"
                />
              </div>
              <div className="mt-4 max-h-64 overflow-y-auto">
                {allFollowerAndFollowingForGroup.merged.map((merge) => (
                  <div
                    key={merge.id}
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer hover:bg-gray-200"
                  >
                    {/* <div className="text-black">{merge.id}</div> */}
                    <input
                      type="checkbox"
                      onChange={() => handleCheckboxChange(merge.id)}
                      className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                    />
                    <Avatar className="h-8 w-8 border">
                      <AvatarImage
                        src={merge.image || "/placeholder-user.jpg"}
                      />
                      <AvatarFallback>{merge.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <div className="font-medium truncate text-black">
                        {merge.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={handleCreateGroupChat} className="mt-4 w-full">
                Create Group Chat
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <div className="flex-1 overflow-auto">
        <nav className="space-y-2">
          {chatrooms.map((chatroom, index) => {
            const filteredParticipants = chatroom.participants.filter(
              (participant) => participant.participantId !== authenticatedUserId
            );

            return (
              <div
                key={index}
                onClick={() => onSelectChatroom(chatroom.chatroomId)}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer hover:bg-gray-200 hover:text-black"
              >
                {chatroom.type == "PERSONAL" &&
                  filteredParticipants.length > 0 && (
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={filteredParticipants[0]?.image || ""} />
                      <AvatarFallback>
                        {filteredParticipants[0]?.accountname?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                  )}

                {chatroom.type == "GROUP" && (
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage
                      src={
                        groupImages[chatroom.groupImage.toString()] ||
                        "/assets/users.svg"
                      }
                    />
                    <AvatarFallback>?</AvatarFallback>
                  </Avatar>
                )}

                <div className="flex-1 overflow-hidden">
                  {chatroom.type == "PERSONAL" &&
                    filteredParticipants.length > 0 && (
                      <div className="font-medium truncate">
                        {filteredParticipants[0]?.accountname || "Unknown User"}
                      </div>
                    )}
                  {chatroom.type == "GROUP" && (
                    <div className="font-medium truncate">{chatroom.name}</div>
                  )}
                </div>
              </div>
            );
          })}
        </nav>
      </div>
    </>
  );
}
