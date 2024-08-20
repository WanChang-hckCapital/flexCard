"use client";

import React, { useState, useEffect } from "react";
import ChatRoomSideBar from "./ChatRoomSideBar";
import ChatRoomMainBar from "./ChatRoomMainComponent";

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
  sender: {
    _id: string;
    image: string | null;
  };
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
  allUsers: any[];
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
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const newWs = new WebSocket("ws://localhost:8080");

    newWs.onopen = () => {
      console.log("WebSocket connection opened");
    };

    newWs.onmessage = (event) => {
      const receivedMessage = JSON.parse(event.data);

      if (receivedMessage.type === "messages") {
        console.log("Received messages:", receivedMessage.messages);
        // console.log("receivedMessage" + receivedMessage.userInfo.image);

        console.log("userifo image" + receivedMessage?.userInfo?.image);
        setMessages(receivedMessage.messages);
        // setUserImg(receivedMessage?.userInfo?.image);
      } else if (receivedMessage.type === "newMessage") {
        console.log("New message received:", receivedMessage.message);
        setMessages((prevMessages) => [
          ...prevMessages,
          receivedMessage.message,
        ]);
      } else if (receivedMessage.type === "error") {
        console.error("Error:", receivedMessage.message);
      }
    };

    newWs.onclose = () => {
      console.log("WebSocket connection closed");
    };

    newWs.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    setWs(newWs);

    return () => {
      if (newWs) {
        newWs.close();
      }
    };
  }, []);

  function fetchMessagesWs(
    chatroomId: string,
    authenticatedUserId: string,
    ws: WebSocket
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      if (ws.readyState == WebSocket.OPEN) {
        const message = {
          type: "fetchMessages",
          chatroomId,
          authenticatedUserId,
        };

        ws.send(JSON.stringify(message));

        const handleMessage = (event: MessageEvent) => {
          const receivedMessage = JSON.parse(event.data);

          if (receivedMessage.type === "messages") {
            resolve(receivedMessage);
            // console.log("receivedMessage" + receivedMessage.userInfo);
            ws.removeEventListener("message", handleMessage);
          } else if (receivedMessage.type === "error") {
            reject(receivedMessage.message);
            ws.removeEventListener("message", handleMessage);
          } else if (receivedMessage.type === "newMessage") {
            console.log("New message received:", receivedMessage.message);
            setMessages((prevMessages) => [
              ...prevMessages,
              receivedMessage.message,
            ]);
          }
        };
      } else {
        console.error("WebSocket is not open");
      }
    });
  }

  const handleSelectChatroom = async (chatroomId: string) => {
    setSelectedChatroom(chatroomId);
    console.log("Selected Chatroom ID:", chatroomId);

    setMessages([]);
    console.log("clear");

    if (chatroomId && ws) {
      try {
        const fetchMessagesResponse = await fetchMessagesWs(
          chatroomId,
          authenticatedUserId,
          ws
        );

        console.log("Messages fetched:", fetchMessagesResponse.messages);

        if (fetchMessagesResponse.success) {
          console.log("fetchMessagesResponse.messages");
          setMessages(fetchMessagesResponse.messages);
        } else {
          console.error(
            "Failed to load messages:",
            fetchMessagesResponse.message
          );
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
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
        allUsers={allUsers}
        messages={messages}
        ws={ws}
      />
    </div>
  );
}
