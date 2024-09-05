"use client";

import React, { useState, useEffect, useRef } from "react";
import ChatRoomSideBar from "./ChatRoomSideBar";
import ChatRoomMainBar from "./ChatRoomMainComponent";
import Spinner from "./Spinner";

interface Participant {
  _id: string;
  accountname: string;
  image: string;
  user: string;
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
  readStatus: { userId: string; readAt: string | null }[];
  imageAttach: string | null;
  imageSrc: string;
  fileAttach: string | null;
  fileSrc: string;
  fileName: string;
  locationLink: string | null;
  shopName: string | null;
  pictureLink: string | null;
  card: string | null;
  flexFormatHtmlContentText: string | null;
  youtubeMetadata?: {
    title: string;
    description: string;
    thumbnail: string;
    url: string;
  } | null;
  shopImage: string | null;
  siteName: string | null;
  shopDescription: string | null;
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
  const [receiverInfo, setReceiverInfo] = useState<Participant | null>(null);
  const [messageLoading, setMessageLoading] = useState<boolean>(false);
  const [skip, setSkip] = useState<number>(0); // number use to skip
  const chatWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newWs = new WebSocket("ws://localhost:8080");

    newWs.onopen = () => {
      console.log("WebSocket connection opened");
    };

    newWs.onmessage = (event) => {
      const receivedMessage = JSON.parse(event.data);

      console.log(receivedMessage.message);

      if (receivedMessage.type === "messages") {
        // trigger when the user initially load the message
        console.log("Received messages:", receivedMessage.messages);
        setMessageLoading(false);
        setMessages(receivedMessage.messages);
        setReceiverInfo(receivedMessage.receiverInfo);
      } else if (receivedMessage.type === "newMessage") {
        // trigger when send message send
        setMessages((prevMessages) => [
          ...prevMessages,
          receivedMessage.message,
        ]);
      } else if (receivedMessage.type === "messageSent") {
        // TODO - remove in future
        setMessages((prevMessages) => [
          ...prevMessages,
          receivedMessage.message,
        ]);
      } else if (receivedMessage.type === "readStatusUpdated") {
        // trigger when the user view the message
        setMessages((prevMessages) => {
          const messageExists = prevMessages.some(
            (msg) => msg._id === receivedMessage.message._id
          );

          if (messageExists) {
            return prevMessages.map((msg) =>
              msg._id === receivedMessage.message._id
                ? receivedMessage.message
                : msg
            );
          } else {
            return [...prevMessages, receivedMessage.message];
          }
        });
      } else if (receivedMessage.type === "error") {
        console.error("Error:", receivedMessage.message);
        setMessageLoading(false);
      }
    };

    newWs.onclose = () => {
      console.log("WebSocket connection closed");
    };

    newWs.onerror = (error) => {
      console.error("WebSocket error:", error);
      setMessageLoading(false);
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
    ws: WebSocket,
    skip: number
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      if (ws.readyState == WebSocket.OPEN) {
        const message = {
          type: "fetchMessages",
          chatroomId,
          authenticatedUserId,
          skip,
          limit: 20,
        };

        ws.send(JSON.stringify(message));

        const handleMessage = (event: MessageEvent) => {
          const receivedMessage = JSON.parse(event.data);

          if (receivedMessage.type === "messages") {
            setReceiverInfo(receivedMessage.receiverInfo);
            resolve(receivedMessage);
            // console.log("receivedMessage" + receivedMessage.userInfo);
            console.log("receivedMessage:" + receivedMessage.messages);

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
    console.log("Selected Chatroom ID:", chatroomId);
    setSelectedChatroom(chatroomId);
    setMessages([]);
    setSkip(0);
    setMessageLoading(true);
    // console.log("clear");

    if (chatroomId && ws) {
      try {
        const fetchMessagesResponse = await fetchMessagesWs(
          chatroomId,
          authenticatedUserId,
          ws,
          0
        );

        console.log("Messages fetched:", fetchMessagesResponse.messages);

        if (fetchMessagesResponse.success) {
          console.log("fetchMessagesResponse.messages");
          setSkip(20);

          // console.log("fetch message:" + fetchMessagesResponse.)
          setMessages(fetchMessagesResponse.messages);
        } else {
          console.error(
            "Failed to load messages:",
            fetchMessagesResponse.message
          );
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setMessageLoading(false);
      }
    }
  };

  return (
    <div className="flex h-full w-full">
      <div className="hidden w-64 border-r bg-background md:block">
        <ChatRoomSideBar
          chatrooms={chatrooms}
          authenticatedUserId={authenticatedUserId}
          onSelectChatroom={handleSelectChatroom}
          allUsers={allUsers}
          allFollowerAndFollowing={allFollowerAndFollowing}
        />
      </div>
      <div className="flex h-full w-full">
        {messageLoading ? (
          <Spinner />
        ) : (
          <ChatRoomMainBar
            chatrooms={chatrooms}
            authenticatedUserId={authenticatedUserId}
            selectedChatroom={selectedChatroom}
            allUsers={allUsers}
            messages={messages}
            ws={ws}
            receiverInfo={receiverInfo}
          />
        )}
      </div>
    </div>
  );
}
