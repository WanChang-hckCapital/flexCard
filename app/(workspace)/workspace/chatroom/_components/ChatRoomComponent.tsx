"use client";

import React, { useState } from "react";
import ChatRoomSideBar from "./ChatRoomSideBar";
import ChatRoomMainBar from "./ChatRoomMainComponent";
import { fetchMessages } from "@/lib/actions/user.actions";

interface Participant {
  _id: string;
  accountName: string;
  image: string;
}

interface Message {
  _id: string;
  content: string;
  senderId: string;
  createdAt: string;
}

interface Chatroom {
  _id: string;
  name: string;
  participants: Participant[];
  chatroomId: string;
}

interface ChatRoomClientProps {
  chatrooms: Chatroom[];
  authenticatedUserId: string;
  //   onSelectChatroom: (chatroomId: string) => void;
  allUsers: any[]; // Adjust these types as necessary
  allFollowerAndFollowing: { followers: any[]; following: any[] };
}

export default function ChatRoomComponent({
  chatrooms,
  authenticatedUserId,
  allUsers,
  allFollowerAndFollowing,
}: ChatRoomClientProps) {
  const [selectedChatroom, setSelectedChatroom] = useState<string | null>("");
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSelectChatroom = async (
    chatroomId: string
    // chatrooms: Chatroom[]
  ) => {
    setSelectedChatroom(chatroomId);
    console.log("Selected Chatroom ID:", chatroomId);

    // console.log("participants" + chatrooms[0].participants);

    if (chatroomId) {
      const fetchMessagesResponse = await fetchMessages(chatroomId);

      if (fetchMessagesResponse.success) {
        setMessages(fetchMessagesResponse.message);
      } else {
        console.error(
          "Failed to load messages:",
          fetchMessagesResponse.message
        );
      }
    }
  };

  return (
    <div className="flex h-full w-full">
      <div className="hidden w-64 border-r bg-background md:block w-4/12">
        <ChatRoomSideBar
          chatrooms={chatrooms}
          authenticatedUserId={authenticatedUserId}
          onSelectChatroom={handleSelectChatroom}
          allUsers={allUsers}
          allFollowerAndFollowing={allFollowerAndFollowing}
        />
      </div>
      <ChatRoomMainBar
        chatrooms={chatrooms}
        authenticatedUserId={authenticatedUserId}
        selectedChatroom={selectedChatroom}
        messages={messages}
      />
    </div>
  );
}
