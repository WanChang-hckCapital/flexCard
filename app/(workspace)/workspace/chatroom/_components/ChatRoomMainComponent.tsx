"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  SendIcon,
  PlusIcon,
  FileUp,
  FileDown,
  MessageCircleX,
  UserRoundX,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  getMutualFollowStatus,
  createOrGetChatroom,
} from "@/lib/actions/user.actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getChatroomParticipantsImage,
  getImage,
} from "@/lib/actions/user.actions";
import {
  CheckCheck,
  Check,
  Image,
  Plus,
  MapPin,
  CircleUserRound,
  File,
  Menu,
  LocateFixed,
  CircleEllipsis,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { X } from "lucide-react";
import MessageImageModel from "./MessageImageModal";
import { toast } from "sonner";
import { fetchAllCards } from "@/lib/actions/user.actions";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import LoadingSpinner from "./LoadingSpinner";
import {
  fetchPreviousMessage,
  leaveGroup,
  getInvitorList,
  inviteGroup,
  newAdminAppoint,
  dischargeAdmin,
  silentUser,
  unsilentUser,
  blockUser,
  unblockUser,
  searchMessage,
  checkBlockedStatus,
  removeUser,
} from "@/lib/actions/user.actions";
import GroupInfoSheet from "./GroupInfoSheet";
import PersonalInfoSheet from "./PersonalInfoSheet";
import { useRouter } from "next/navigation";
import ChatRoomSearchBar from "./ChatRoomSearchBar";
import FlexCardModal from "./FlexCardModal";

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

interface Participant {
  _id: string;
  participantId: string;
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
  facebookMetadata?: {
    title: string;
    description: string;
    thumbnail: string;
    url: string;
  } | null;
  shopImage: string | null;
  siteName: string | null;
  shopDescription: string | null;
}

interface OldMessage {
  success: boolean;
  message: string;
  messages: Message[];
}

interface ChatroomMainBarProps {
  chatrooms: Chatroom[];
  authenticatedUserId: string;
  selectedChatroom: string | null;
  selectedChatroomData: Chatroom | null;
  allUsers: any[];
  messages: Message[];
  ws: WebSocket | null;
  receiverInfo: Participant | null;
}

declare global {
  interface HTMLDivElement {
    _leaflet_id?: string;
  }
}

interface InvitableUser {
  _id: string;
  accountname: string;
  image?: string;
}

interface InvitableUserResponse {
  success: boolean;
  message: string;
  users: InvitableUser[];
}

interface SearchResult {
  _id: string;
  content: string;
  senderId: string;
  createdAt: string;
}

export default function ChatRoomMainBar({
  chatrooms,
  authenticatedUserId,
  selectedChatroom,
  selectedChatroomData,
  allUsers,
  messages,
  ws,
  receiverInfo,
}: ChatroomMainBarProps) {
  if (!selectedChatroom) {
    return (
      <div className="flex justify-center items-center h-screen text-xl w-full rounded-lg shadow-md p-6 text-center">
        Select a chatroom to start chatting.
      </div>
    );
  }

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const hasScrolled = useRef(false); // to prevent scrollto bottom for every messages is loaded

  const [messageContent, setMessageContent] = useState<string>("");
  const [currentMessages, setCurrentMessages] = useState<Message[]>(messages);
  const [participantImages, setParticipantImages] = useState<
    { participantId: string; image: string | null }[]
  >([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [locationPreview, setLocationPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentImageSrc, setCurrentImageSrc] = useState<string | null>(null);

  const [flexCards, setFlexCards] = useState<any[]>([]);
  const [isFlexCardModalOpen, setFlexCardModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const [lmarker, setLMarker] = useState<L.Marker | null>(null);
  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isMapVisible, setMapVisible] = useState(false);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [shopName, setShopName] = useState<string | null>(null);
  const [shopImage, setShopImage] = useState<string | null>(null);
  const [shopDescription, setShopDescription] = useState<string | null>(null);
  const [siteName, setSiteName] = useState<string | null>(null);

  const [isFetchingOlderMessages, setIsFetchingOlderMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  const [youtubeMetadata, setYoutubeMetadata] = useState<{
    title: string;
    description: string;
    thumbnail: string;
    url: string;
  } | null>(null);

  const [facebookMetadata, setFacebookMetadata] = useState<{
    title: string;
    description: string;
    thumbnail: string;
    url: string;
  } | null>(null);

  const [isGroupInfoSheetOpen, setGroupInfoSheetOpen] = useState(false);
  const [isPersonalInfoSheetOpen, setPersonalInfoSheetOpen] = useState(false);
  const [invitableUsers, setInvitableUsers] = useState<InvitableUser[]>([]);
  const [invitableUsersLoading, setInvitableUsersLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupImage, setGroupImage] = useState<string | null>(null);

  const [isSearchBarVisible, setIsSearchBarVisible] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // trigger when the user click on the search result
  const [highlightedMessageId, setHighlightedMessageId] = useState<
    string | null
  >(null);

  const [admins, setAdmins] = useState<string[]>(
    selectedChatroomData?.admin || []
  );

  const [allSilentUser, setAllSilentUser] = useState<
    { userId: string; silentUntil: string | null }[]
  >(selectedChatroomData?.silentUser || []);

  const [participants, setParticipants] = useState<any[]>(
    selectedChatroomData?.participants || []
  );

  const [isUserInGroup, setIsUserInGroup] = useState<boolean>(true);

  const router = useRouter();

  useEffect(() => {
    const fetchGroupImage = async () => {
      if (selectedChatroomData?.groupImage) {
        try {
          const response = await fetch(
            `/api/group-image-load/${selectedChatroomData.groupImage}`
          );
          if (response.ok) {
            const data = await response.json();
            setGroupImage(data.fileDataUrl);
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

  useEffect(() => {
    setCurrentMessages(messages);

    messages.forEach((message) => {
      message.readStatus.forEach((status) => {
        if (status.userId === authenticatedUserId && !status.readAt) {
          // console.log("yes, i seen the message");
          updateReadStatus(message._id, authenticatedUserId);
        } else {
          // console.log("i should not update the status");
        }
      });
    });
  }, [messages]);

  useEffect(() => {
    if (coordinates && locationPreview && mapRef.current) {
      const { latitude, longitude } = coordinates;

      if (mapRef.current && !mapRef.current._leaflet_id) {
        import("leaflet").then((L) => {
          const newMap = L.map(mapRef.current!).setView(
            [latitude, longitude],
            13
          );
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
          }).addTo(newMap);

          const newMarker = L.marker([latitude, longitude]).addTo(newMap);
          setLMarker(newMarker);
          setMap(newMap);
        });
      }
    }
  }, [coordinates, locationPreview, mapRef.current]);

  useEffect(() => {
    currentMessages.forEach((message) => {
      if (message.locationLink && mapRefs.current[message._id]) {
        const mapContainer = mapRefs.current[message._id];

        if (mapContainer) {
          const mapDiv = mapContainer as any;
          if (mapDiv._leaflet_id) {
            return;
          }

          const regex = /(-?\d+\.\d+),(-?\d+\.\d+)/;
          const match = message.locationLink.match(regex);

          if (match) {
            const latitude = parseFloat(match[1]);
            const longitude = parseFloat(match[2]);

            import("leaflet").then((L) => {
              const newMap = L.map(mapDiv).setView([latitude, longitude], 13);
              L.tileLayer(
                "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                {
                  attribution: "© OpenStreetMap contributors",
                }
              ).addTo(newMap);

              const svgIcon = `data:image/svg+xml;charset=UTF-8,
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin">
                    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
                    <circle cx="12" cy="10" r="3"/>
                </svg>`;
              const customIcon = L.icon({
                iconUrl: svgIcon,
              });

              L.marker([latitude, longitude], { icon: customIcon }).addTo(
                newMap
              );
            });
          }
        }
      }
    });
  }, [currentMessages]);

  useEffect(() => {
    const fetchParticipantImages = async () => {
      if (selectedChatroom) {
        const response = await getChatroomParticipantsImage(
          selectedChatroom,
          authenticatedUserId
        );
        if (response.success && response.images) {
          setParticipantImages(response.images);
        } else {
          console.error(
            "Failed to fetch participant images: ",
            response.message
          );
        }
      }
    };

    fetchParticipantImages();
  }, [selectedChatroom]);

  useEffect(() => {
    setCurrentMessages(messages);
  }, [messages]);

  // scroll to bottom
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight + 200;
    }
  };

  // only move this when the message load initially
  useEffect(() => {
    if (currentMessages.length === 20) {
      scrollToBottom();
    }
  }, [currentMessages]);

  const fetchOlderMessages = async () => {
    if (isFetchingOlderMessages || !hasMoreMessages) return;

    setIsFetchingOlderMessages(true);

    const scrollHeightBeforeFetch = chatContainerRef.current?.scrollHeight || 0;
    const scrollTopBeforeFetch = chatContainerRef.current?.scrollTop || 0;

    const currentLength = currentMessages.length;
    console.log("Fetching older messages, current length:", currentLength);

    try {
      const limit = 20;
      const skip = currentLength;
      const oldMessagesResponse: any = await fetchPreviousMessage(
        selectedChatroom!,
        authenticatedUserId,
        skip,
        limit
      );

      if (
        oldMessagesResponse.success &&
        oldMessagesResponse.messages.length > 0
      ) {
        setCurrentMessages((prevMessages) => [
          ...oldMessagesResponse.messages,
          ...prevMessages,
        ]);

        setTimeout(() => {
          if (chatContainerRef.current) {
            const scrollHeightAfterFetch =
              chatContainerRef.current.scrollHeight;
            chatContainerRef.current.scrollTop =
              scrollTopBeforeFetch +
              (scrollHeightAfterFetch - scrollHeightBeforeFetch);
          }
        }, 0);

        if (oldMessagesResponse.messages.length < limit) {
          setHasMoreMessages(false);
        }
      } else {
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error("Error fetching older messages:", error);
    } finally {
      setIsFetchingOlderMessages(false);
    }
  };

  const handleScroll = () => {
    if (chatContainerRef.current && chatContainerRef.current.scrollTop === 0) {
      fetchOlderMessages();
    }
  };

  // Attach and detach the scroll event listener
  useEffect(() => {
    chatContainerRef.current?.addEventListener("scroll", handleScroll);
    return () =>
      chatContainerRef.current?.removeEventListener("scroll", handleScroll);
  }, [hasMoreMessages, isFetchingOlderMessages]);

  const handleDestinationSelect = () => {
    setMapVisible(true);
  };

  const updateReadStatus = (messageId: string, userId: string) => {
    console.log("Updating read status...");
    if (ws && ws.readyState === WebSocket.OPEN) {
      const readStatusUpdate = {
        type: "updateReadStatus",
        messageId,
        userId,
        readAt: new Date().toISOString(),
      };
      ws.send(JSON.stringify(readStatusUpdate));
      console.log("Read status updated:", readStatusUpdate);
    } else {
      console.error("WebSocket is not open, cannot update read status.");
    }
  };

  const getMutualStatus = async (
    authenticatedUserId: string,
    targetUserId: string
  ) => {
    try {
      const mutualStatus = await getMutualFollowStatus(
        authenticatedUserId,
        targetUserId
      );

      if (mutualStatus.success) {
        console.log("Mutual Follow Status:", mutualStatus);
      } else {
        console.error(
          "Error fetching mutual follow status:",
          mutualStatus.message
        );
      }

      return mutualStatus;
    } catch (error) {
      console.error("Error in getMutualStatus:", error);
      return { success: false, message: "Error occurred", mutualFollow: false };
    }
  };

  const sendMessageHandler = async (
    senderId: string,
    chatroomId: string,
    content: string,
    ws: WebSocket,
    youtubeMetadata?: {
      title: string;
      description: string;
      thumbnail: string;
      url: string;
    } | null,
    facebookMetadata?: {
      title: string;
      description: string;
      thumbnail: string;
      url: string;
    } | null
  ) => {
    if (!ws) return;

    const blockedStatus = await checkBlockedStatus(receiverInfo?._id || "");

    if (
      Array.isArray(blockedStatus?.blockedAccounts) &&
      blockedStatus.blockedAccounts.length > 0
    ) {
      const isBlocked = blockedStatus.blockedAccounts.some(
        (account) => account._id === authenticatedUserId
      );

      if (isBlocked) {
        toast.error("You are blocked by this user. Cannot send messages.");
        return;
      }
    } else {
      console.warn(
        "Blocked accounts not found or the user has no blocked accounts."
      );
    }

    let fileObjectId: string | null = null;
    let imageSrc: string = "";
    let imageObjectId: string | null = null;
    let fileName: string = "";
    let fileSrc: string = "";
    let locationLink: string | null = "";
    let pictureLink: string | null = "";

    const cardData = selectedCard ? selectedCard : null;
    const cardId = cardData?.cardId ? cardData?.cardId : null;
    const cardFlexHtml = cardData?.flexHtml.content
      ? cardData.flexHtml.content
      : null;

    if (!youtubeMetadata) {
      youtubeMetadata =
        (await fetchMetadataForYoutubeContent(content)) || undefined;
    }

    if (!facebookMetadata) {
      facebookMetadata =
        (await fetchMetadataForFacebookContent(content)) || undefined;
    }

    const sendMessage = (
      imageObjectId: string | null = null,
      fileObjectId: string | null = null,
      locationLink: string | null = null,
      shopName: string | null = null,
      pictureLink: string | null = null,
      shopImage: string | null = null,
      siteName: string | null = null,
      shopDescription: string | null = null
    ) => {
      try {
        if (ws && ws.readyState === WebSocket.OPEN) {
          const message = {
            type: "sendMessage",
            senderId,
            chatroomId,
            content,
            imageAttach: imageObjectId,
            fileAttach: fileObjectId,
            readStatus: receiverInfo
              ? [{ userId: receiverInfo._id, readAt: null }]
              : [],
            fileName,
            locationLink,
            shopName,
            pictureLink,
            card: cardId,
            cardFlexHtml,
            youtubeMetadata: youtubeMetadata || null,
            facebookMetadata: facebookMetadata || null,
            shopImage,
            siteName,
            shopDescription,
          };

          console.log("send message:" + JSON.stringify(message));

          // For frontend display
          const newMessage: Message = {
            _id: Date.now().toString(),
            senderId,
            content,
            imageAttach: imageObjectId,
            createdAt: new Date().toISOString(),
            sender: {
              _id: senderId,
              image: null,
            },
            readStatus: receiverInfo
              ? [{ userId: receiverInfo._id, readAt: null }]
              : [],
            imageSrc,
            fileAttach: fileObjectId,
            fileSrc,
            fileName,
            locationLink,
            shopName,
            pictureLink,
            card: cardId,
            flexFormatHtmlContentText: cardFlexHtml,
            youtubeMetadata: youtubeMetadata
              ? {
                  title: youtubeMetadata.title,
                  description: youtubeMetadata.description,
                  thumbnail: youtubeMetadata.thumbnail,
                  url: youtubeMetadata.url,
                }
              : null,
            facebookMetadata: facebookMetadata
              ? {
                  title: facebookMetadata.title,
                  description: facebookMetadata.description,
                  thumbnail: facebookMetadata.thumbnail,
                  url: facebookMetadata.url,
                }
              : null,
            shopImage,
            siteName,
            shopDescription,
          };

          // console.log("frontend messgae:" + JSON.stringify(newMessage));

          setCurrentMessages((prevMessages) => [...prevMessages, newMessage]);

          ws.send(JSON.stringify(message));

          console.log("Message sent via WebSocket!");
        } else {
          console.error("WebSocket is not open. Cannot send message.");
        }
      } catch (error) {
        console.error("Failed to send message:", error);
      }

      setMessageContent("");
      setImagePreview(null);
      setFilePreview(null);
      setLocationPreview(null);
      setShopName(null); // Clear the shop name
      setShopImage(null);
      setSiteName(null);
      setShopDescription(null);
      setSelectedCard(null);
      handleRemoveMap(); // close the google map
      setYoutubeMetadata(null);
      setFacebookMetadata(null);

      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setFileName("");
    };

    try {
      const hasContent = content.trim() !== "";
      const hasImage = imageInputRef.current?.files?.[0] != null;
      const hasFile = fileInputRef.current?.files?.[0] != null;
      const isLocation = locationPreview != null;

      const hasShopName = shopName != null;
      const hasPictureLink = shopImage != null;

      if (hasContent || hasImage || hasFile || isLocation || cardData) {
        if (hasImage) {
          const file = imageInputRef.current?.files![0];
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch("/api/uploadMessageImage", {
            method: "POST",
            body: formData,
          });

          if (response.ok) {
            const result = await response.json();
            imageObjectId = result.fileId;
            imageSrc = URL.createObjectURL(file);
          } else {
            console.error("Failed to upload image. Status:", response.status);
          }
        }
        if (hasFile) {
          const file = fileInputRef.current?.files![0];
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch("/api/uploadMessageFile", {
            method: "POST",
            body: formData,
          });

          if (response.ok) {
            const result = await response.json();
            fileObjectId = result.fileId;
            fileName = file.name;
          } else {
            console.error("Failed to upload file. Status:", response.status);
          }
        }
        if (isLocation) {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                locationLink = `https://maps.google.com/?q=${latitude},${longitude}`;
                sendMessage(imageObjectId, fileObjectId, locationLink);
              },
              (error) => {
                console.error("Error getting location:", error);
                alert("Unable to retrieve your location. Please try again.");
              }
            );
          } else {
            alert("Geolocation is not supported by this browser.");
          }
        }
        sendMessage(
          imageObjectId,
          fileObjectId,
          locationLink,
          shopName,
          pictureLink,
          shopImage,
          siteName,
          shopDescription
        );
      } else {
        toast.error("Message cannot be empty!!");
      }
    } catch (error) {
      console.error("Error processing file or sending message:", error);
    }
  };

  const formatMessageTime = (dateString: string): string => {
    const messageDate = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - messageDate.getTime()) / 1000
    );
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} second${diffInSeconds === 1 ? "" : "s"} ago`;
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
    } else {
      const day = messageDate.getDate();
      const month = messageDate
        .toLocaleString("en-US", { month: "short" })
        .toUpperCase();
      const time = messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      return `${day} ${month} AT ${time}`;
    }
  };

  const viewSeenTime = () => {
    console.log("seen time");
  };

  // to choose photo to upload
  const handlePhotoUploadClick = () => {
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };

  // preview image save
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          //set the image preview
          setImagePreview(reader.result);
        } else {
          console.error("Unexpected file data type:", typeof reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // preview file uplaod
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log(file);
    if (file) {
      setFilePreview(file.name);
      setFileName(file.name);
    }
  };

  // preview the location
  const handleLocationPreview = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationLink = `https://maps.google.com/?q=${latitude},${longitude}`;
          setLocationPreview(locationLink);
          setCoordinates({ latitude, longitude });

          if (mapRef.current) {
            if (map) {
              map.remove();
              setMap(null);
            }

            import("leaflet").then((L) => {
              if (mapRef.current) {
                const newMap = L.map(mapRef.current).setView(
                  [latitude, longitude],
                  13
                );
                L.tileLayer(
                  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                  {
                    attribution: "© OpenStreetMap contributors",
                  }
                ).addTo(newMap);

                const newMarker = L.marker([latitude, longitude]).addTo(newMap);
                setLMarker(newMarker);
                setMap(newMap);
              }
            });
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to retrieve your location. Please try again.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  // to view file upload
  const handleFileUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // remove preview image, preview file, preview location
  const removeFileUpload = () => {
    setImagePreview(null);
    setFilePreview(null);
    setLocationPreview(null);
    setSelectedCard(null);

    if (map) {
      map.remove();
      setMap(null);
    }

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // get all cards
  const handleFetchAllCards = async () => {
    try {
      const response = await fetchAllCards();

      if (response) {
        // console.log("All cards:", response);
        setFlexCards(response);
        setFlexCardModalOpen(true);
      } else {
        console.error("Failed to fetch cards:");
      }
    } catch (error) {
      console.error("Error during card fetch:", error);
    }
  };

  const handleImageClick = (imageSrc: string) => {
    setCurrentImageSrc(imageSrc);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentImageSrc(null);
  };

  const handleRemoveMap = () => {
    setMapVisible(false);
    setMarker(null);
  };

  const fetchMetadataForYoutubeContent = async (content: string) => {
    const youtubeLinkPattern =
      /https:\/\/www\.youtube\.com\/watch\?v=[A-Za-z0-9_-]+/;
    const match = content.match(youtubeLinkPattern);

    if (match) {
      const youtubeUrl = match[0];
      try {
        const response = await fetch(
          `/api/fetch-meta?url=${encodeURIComponent(youtubeUrl)}`
        );
        const { metaTags, error } = await response.json();

        if (error) {
          console.error("Failed to fetch metadata:", error);
          return null;
        }

        return {
          title: metaTags["og:title"] || metaTags["title"] || "Untitled",
          description:
            metaTags["og:description"] ||
            metaTags["description"] ||
            "No description",
          thumbnail: metaTags["og:image"] || "",
          url: youtubeUrl,
        };
      } catch (error) {
        console.error("Error fetching metadata:", error);
        return null;
      }
    }
    return null;
  };

  const fetchMetadataForFacebookContent = async (content: string) => {
    const facebookPostPattern =
      /https:\/\/www\.facebook\.com\/[A-Za-z0-9\.]+\/posts\/[A-Za-z0-9]+/;
    const match = content.match(facebookPostPattern);

    if (match) {
      const youtubeUrl = match[0];
      try {
        const response = await fetch(
          `/api/fetch-meta?url=${encodeURIComponent(youtubeUrl)}`
        );
        const { metaTags, error } = await response.json();

        if (error) {
          console.error("Failed to fetch metadata:", error);
          return null;
        }

        return {
          title: metaTags["og:title"] || metaTags["title"] || "Untitled",
          description:
            metaTags["og:description"] ||
            metaTags["description"] ||
            "No description",
          thumbnail: metaTags["og:image"] || "",
          url: youtubeUrl,
        };
      } catch (error) {
        console.error("Error fetching metadata:", error);
        return null;
      }
    }
    return null;
  };

  const handlePaste = async (
    event: React.ClipboardEvent<HTMLTextAreaElement>
  ) => {
    const pasteData = event.clipboardData.getData("Text");

    const youtubeLinkPattern =
      /https:\/\/www\.youtube\.com\/watch\?v=[A-Za-z0-9_-]+/;
    const googleMapsLinkPattern = /https:\/\/maps\.app\.goo\.gl\/[A-Za-z0-9]+/;

    const facebookPostPattern =
      /https:\/\/www\.facebook\.com\/share\/p\/[A-Za-z0-9]+/;

    let metadataUpdated = false;

    if (youtubeLinkPattern.test(pasteData)) {
      const youtubeUrl = pasteData.match(youtubeLinkPattern)?.[0];
      if (youtubeUrl) {
        try {
          const response = await fetch(
            `/api/fetch-meta?url=${encodeURIComponent(youtubeUrl)}`
          );
          const { metaTags, error } = await response.json();
          if (error) {
            console.error("Failed to fetch metadata:", error);
            return;
          }

          const metadata = {
            title: metaTags["og:title"] || metaTags["title"] || "Untitled",
            description:
              metaTags["og:description"] ||
              metaTags["description"] ||
              "No description",
            thumbnail: metaTags["og:image"] || "",
            url: youtubeUrl,
          };

          setYoutubeMetadata(metadata);
          metadataUpdated = true;
        } catch (error) {
          console.error("Error fetching YouTube metadata:", error);
        }
      }
    } else if (googleMapsLinkPattern.test(pasteData)) {
      const googleMapsUrl = pasteData.match(googleMapsLinkPattern)?.[0];
      if (googleMapsUrl) {
        try {
          const apiResponse = await fetch(
            `/api/resolve-url?url=${encodeURIComponent(googleMapsUrl)}`
          );
          const { resolvedUrl, image, siteName, description, error } =
            await apiResponse.json();

          if (error) {
            console.error("Failed to resolve URL:", error);
            return;
          }

          setShopImage(image);
          setSiteName(siteName);
          setShopDescription(description);

          const shopNameMatch = resolvedUrl.match(/place\/([^\/?]+)/);
          if (shopNameMatch) {
            const extractedShopName = decodeURIComponent(
              shopNameMatch[1].replace(/\+/g, " ")
            );
            setShopName(extractedShopName);
          } else {
            console.error("Shop name could not be extracted from the URL.");
          }

          metadataUpdated = true;
        } catch (error) {
          console.error(
            "Error resolving URL or fetching place details:",
            error
          );
        }
      }
    } else if (facebookPostPattern.test(pasteData)) {
      const facebookPostUrl = pasteData.match(facebookPostPattern)?.[0];
      if (facebookPostUrl) {
        try {
          const response = await fetch(
            `/api/fetch-meta?url=${encodeURIComponent(facebookPostUrl)}`
          );
          const { metaTags, error } = await response.json();

          if (error) {
            console.error("Failed to fetch metadata:", error);
            return;
          }

          const metadata = {
            title: metaTags["og:title"] || "Untitled",
            description: metaTags["og:description"] || "No description",
            thumbnail: metaTags["og:image"] || "",
            url: facebookPostUrl,
          };

          setFacebookMetadata(metadata);
          metadataUpdated = true;
        } catch (error) {
          console.error("Error fetching Facebook metadata:", error);
        }
      }
    }

    if (!metadataUpdated) {
      setMessageContent((prevContent) => prevContent + pasteData);
    }

    event.preventDefault(); // Prevent default pasting behavior
  };

  const getChatroomInfo = () => {
    setGroupInfoSheetOpen(true);
  };

  const getContactInfo = () => {
    setPersonalInfoSheetOpen(true);
  };

  // leave the group
  const leaveGroupHandler = async () => {
    try {
      const chatroomId = selectedChatroomData?.chatroomId || "";

      const response = await leaveGroup(chatroomId, authenticatedUserId);

      if (response.success) {
        setIsUserInGroup(false);
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {}
  };

  const viewProfileHandler = (participantId: string) => {
    router.push(`/profile/${participantId}`);
  };

  const loadInvitorList = async () => {
    try {
      setInvitableUsersLoading(true);
      const chatroomId = selectedChatroomData?.chatroomId || "";

      const response: InvitableUserResponse = await getInvitorList(
        chatroomId,
        authenticatedUserId
      );

      // console.log()

      if (response.success) {
        setInvitableUsers(response.users);
        console.log("Users to invite:", response.users);
      } else {
        toast.error(response.message);
        console.error(response.message);
      }
    } catch (error: any) {
      console.error("Error loading invitable users:", error);
    } finally {
      setInvitableUsersLoading(false);
    }
  };

  const handleInvitorChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    userId: string
  ) => {
    if (e.target.checked) {
      setSelectedUsers((prevSelected) => [...prevSelected, userId]);
    } else {
      setSelectedUsers((prevSelected) =>
        prevSelected.filter((id) => id !== userId)
      );
    }
  };

  const inviteUserHandler = async () => {
    const chatroomId = selectedChatroomData?.chatroomId || "";

    if (!selectedUsers || selectedUsers.length === 0) {
      toast("No users selected to invite.");
      return;
    }

    try {
      const response = await inviteGroup(chatroomId, selectedUsers);
      if (response.success) {
        toast.success(response.message);

        const newParticipants = response.newParticipants || [];

        setParticipants((prev) => [...prev, ...newParticipants]);
        setSelectedUsers([]);
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      toast("An error occured.");
    }
  };

  const handleAppointAdmin = async (participantId: string) => {
    const chatroomId = selectedChatroomData?.chatroomId || "";

    try {
      const response = await newAdminAppoint(
        chatroomId,
        authenticatedUserId,
        participantId
      );
      if (response.success) {
        toast.success(response.message);
        setAdmins((prev) => [...prev, participantId]);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("An error occurred while appointing the user as admin.");
      console.error(error);
    }
  };

  const dischargeAppointAdmin = async (dischargeId: string) => {
    const chatroomId = selectedChatroomData?.chatroomId || "";

    try {
      const response = await dischargeAdmin(
        chatroomId,
        authenticatedUserId,
        dischargeId
      );
      if (response.success) {
        toast.success(response.message);
        setAdmins((prev) => prev.filter((id) => id !== dischargeId));
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("An error occurred while discharging the user.");
      console.error(error);
    }
  };

  const silentHandler = async (
    silentTargetId: string,
    silentDuration: number | null
  ) => {
    const chatroomId = selectedChatroomData?.chatroomId || "";
    try {
      const isIndefinite = silentDuration === null;

      const response = await silentUser(
        chatroomId,
        authenticatedUserId,
        silentTargetId,
        isIndefinite ? 0 : silentDuration,
        isIndefinite
      );
      if (response.success) {
        toast.success(response.message);
        const silentUntil = isIndefinite
          ? null
          : new Date(Date.now() + silentDuration * 86400000).toISOString();

        const newSilentUser = {
          userId: silentTargetId,
          silentUntil: silentUntil,
        };
        setAllSilentUser((prev) => [...prev, newSilentUser]);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("An error occurred while silenting the user.");
      console.error(error);
    }
  };

  const unsilentHandler = async (silentTargetId: string) => {
    const chatroomId = selectedChatroomData?.chatroomId || "";
    try {
      const response = await unsilentUser(
        chatroomId,
        authenticatedUserId,
        silentTargetId
      );
      if (response.success) {
        toast.success(response.message);
        setAllSilentUser((prev) =>
          prev.filter((user) => user.userId !== silentTargetId)
        );
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("An error occurred while unsilencing the user.");
      console.error(error);
    }
  };

  const blockUserHandler = async (blockUserId: string) => {
    try {
      const response = await blockUser(authenticatedUserId, blockUserId);
      if (response.success) {
        // console.log("User blocked successfully");
        toast.success(response.message);
      } else {
        console.error(response.message);
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error blocking user:", error);
    }
  };

  const unblockUserHandler = async (blockUserId: string) => {
    try {
      const response = await unblockUser(authenticatedUserId, blockUserId);
      if (response.success) {
        // console.log("User unblocked successfully");
        toast.success(response.message);
      } else {
        console.error(response.message);
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error unblocking user:", error);
    }
  };

  const isUserSilenced = selectedChatroomData?.silentUser.find(
    (silentUser) =>
      silentUser.userId === authenticatedUserId &&
      (silentUser.silentUntil === null ||
        new Date(silentUser.silentUntil) > new Date())
  );

  // show the search bar
  const toggleSearchBar = () => {
    setIsSearchBarVisible((prevState) => !prevState);
  };

  // onchange event to search message in chatroom
  const handleSearchClick = async (keyword: string) => {
    setSearchKeyword(keyword);

    if (keyword.trim() !== "") {
      const result = await searchMessage(
        selectedChatroomData?.chatroomId || "",
        keyword
      );
      if (result.success) {
        setSearchResults(result?.data || []);
      } else {
        setSearchResults([]);
        setHighlightedMessageId(null);
      }
    } else {
      setSearchResults([]);
      setHighlightedMessageId(null);
    }
  };

  const handleSearchResultClick = (messageId: string) => {
    setHighlightedMessageId(messageId);
  };

  const handleRemoveMember = async (removeUserId: string) => {
    const chatroomId = selectedChatroomData?.chatroomId || "";
    console.log("removeUserId");
    console.log(removeUserId);
    try {
      const response = await removeUser(
        chatroomId,
        authenticatedUserId,
        removeUserId
      );

      if (response.success) {
        toast.success(response.message);
        setParticipants((prevParticipants) =>
          prevParticipants.filter((p) => p.participantId !== removeUserId)
        );
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      toast.error("An error occurred while removing the user:", error);
    }
  };

  return (
    <>
      <div className="flex flex-col w-full">
        <div className="sticky top-0 z-10 w-full shadow-sm p-2">
          <div className="flex justify-between h-14 items-center px-4">
            {isSearchBarVisible && (
              <div className="flex items-center flex-1 mr-4 relative">
                <div className="flex-grow">
                  <ChatRoomSearchBar
                    value={searchKeyword}
                    onSearchClick={handleSearchClick}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2"
                  onClick={() => {
                    toggleSearchBar();
                    setSearchKeyword(""); // Clear search keyword
                    setSearchResults([]); // Clear search results
                    setHighlightedMessageId(null); // Clear highlighted message
                  }}
                >
                  <X className="w-5 h-5 text-gray-500" />
                </Button>

                {searchKeyword.trim() !== "" && (
                  <div className="absolute top-full mt-2 w-full bg-white border border-gray-300 shadow-lg rounded-lg z-10">
                    {searchResults.length > 0 ? (
                      searchResults.map((message) => (
                        <div
                          className="flex justify-between"
                          onClick={() => handleSearchResultClick(message._id)}
                        >
                          <div
                            key={message._id}
                            className="p-2 text-black hover:bg-gray-100"
                          >
                            {message.content}
                          </div>
                          <div className="p-2 text-black hover:bg-gray-100">
                            {formatMessageTime(message.createdAt)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="p-2 text-gray-500">No messages found</p>
                    )}
                  </div>
                )}
              </div>
            )}
            <div className="ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto rounded-full"
                  >
                    <CircleEllipsis />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-white shadow-lg rounded-md w-48 py-1"
                >
                  <DropdownMenuItem
                    className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 px-4 py-3 h-12 cursor-pointer text-black"
                    onClick={
                      selectedChatroomData?.type === "GROUP"
                        ? getChatroomInfo
                        : getContactInfo
                    }
                  >
                    {selectedChatroomData?.type === "GROUP"
                      ? "Group Info"
                      : "Contact Info"}
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 px-4 py-3 h-12 cursor-pointer text-black">
                    Mute Motification
                  </DropdownMenuItem> */}
                  <DropdownMenuItem
                    className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 px-4 py-3 h-12 cursor-pointer text-black"
                    onClick={toggleSearchBar}
                  >
                    Search In Chat
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        <div
          className="flex-1 overflow-auto p-4 md:p-6 mt-12"
          ref={chatContainerRef}
        >
          {isFetchingOlderMessages && <LoadingSpinner />}
          {currentMessages.length > 0 ? (
            currentMessages.map((message: Message) => {
              const isHighlighted = message._id === highlightedMessageId;

              const senderImage = participantImages.find(
                (img) => img.participantId === message.senderId
              )?.image;

              return (
                <div
                  key={message._id}
                  className={`flex items-start mb-3 ${
                    message.senderId === authenticatedUserId
                      ? "justify-end"
                      : "justify-start"
                  } ${
                    isHighlighted
                      ? "bg-yellow-100 border-2 border-yellow-400 text-black transition-all duration-300"
                      : ""
                  }`}
                >
                  {message.senderId !== authenticatedUserId && (
                    <Avatar className="h-8 w-8 border mr-4">
                      <AvatarImage src={senderImage || ""} />
                      <AvatarFallback>?</AvatarFallback>
                    </Avatar>
                  )}
                  {message.imageAttach && message.imageSrc && (
                    <>
                      <div className="mb-2">
                        <img
                          src={message.imageSrc}
                          alt="Attached"
                          className="max-h-[300px] max-w-[300px] rounded-md border border-white cursor-pointer"
                          onClick={() => handleImageClick(message.imageSrc)}
                        />
                      </div>
                      <MessageImageModel
                        isOpen={isModalOpen}
                        imageSrc={currentImageSrc || ""}
                        onClose={handleCloseModal}
                      />
                    </>
                  )}
                  {message.fileAttach && message.fileSrc && (
                    <div className="flex flex-col mb-2">
                      <div className="flex items-start gap-2 mb-2">
                        <div className="flex-shrink-0"></div>
                        <a
                          href={message.fileSrc}
                          download={message.fileName}
                          className="block max-w-full rounded-md cursor-pointer"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center justify-start w-full text-left text-blue-600 hover:text-black"
                          >
                            {message.fileName || "Download File"}
                          </Button>
                        </a>
                      </div>

                      <img
                        src={message.fileSrc}
                        alt={message.fileName}
                        className="max-h-[150px] max-w-[150px] rounded-md border border-gray-300"
                      />
                    </div>
                  )}
                  {message.locationLink && (
                    <>
                      <a
                        href={message.locationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block max-w-full rounded-md cursor-pointer"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center justify-start w-full text-left text-blue-600 hover:text-black"
                        >
                          {/* <MapPin className="mr-2 h-5 w-5 text-red-500" /> */}
                          View Location
                        </Button>
                        <div
                          ref={(el) => (mapRefs.current[message._id] = el)}
                          className="h-[200px] w-full rounded-md mt-2"
                        ></div>
                      </a>
                    </>
                  )}
                  {message.shopName && (
                    <div className="flex justify-center mb-4">
                      <Card className="shadow-lg relative w-full max-w-md md:max-w-lg sm:max-w-sm min-h-[250px] md:min-h-[350px]">
                        <a
                          href={message.content || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block cursor-pointer"
                        >
                          <div className="block cursor-pointer">
                            <CardHeader className="p-4">
                              <div className="flex items-center">
                                <CardTitle className="text-base font-semibold text-blue-600 hover:text-gray-600">
                                  {message.shopName}
                                </CardTitle>
                              </div>
                            </CardHeader>
                            {message.shopImage && (
                              <CardContent className="p-0">
                                <img
                                  src={message.shopImage}
                                  alt={message.shopName || ""}
                                  className="rounded-t-md w-full h-[200px] sm:h-[150px] object-cover"
                                />
                              </CardContent>
                            )}
                            <CardContent className="p-4">
                              {message.siteName && (
                                <p className="text-gray-500 text-sm mb-2 hover:text-gray-600">
                                  {message.siteName}
                                </p>
                              )}
                              {message.shopDescription && (
                                <p className="text-gray-700 hover:text-gray-600">
                                  {message.shopDescription}
                                </p>
                              )}
                            </CardContent>
                          </div>
                        </a>
                      </Card>
                    </div>
                  )}
                  {message.youtubeMetadata && (
                    <div className="flex justify-center mb-4">
                      <Card className="shadow-lg relative w-full max-w-md md:max-w-lg sm:max-w-sm min-h-[250px] md:min-h-[350px]">
                        <a
                          href={message.youtubeMetadata.url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block cursor-pointer"
                        >
                          <div className="block cursor-pointer">
                            <CardHeader className="p-4">
                              <div className="flex items-center">
                                <CardTitle className="text-base font-semibold text-blue-600 hover:text-gray-600">
                                  {message.youtubeMetadata.title}
                                </CardTitle>
                              </div>
                            </CardHeader>
                            {message.youtubeMetadata.thumbnail && (
                              <CardContent className="p-0">
                                <img
                                  src={message.youtubeMetadata.thumbnail}
                                  alt={message.youtubeMetadata.thumbnail || ""}
                                  className="rounded-t-md w-full h-[200px] sm:h-[150px] object-cover"
                                />
                              </CardContent>
                            )}
                            <CardContent className="p-4">
                              {message.youtubeMetadata.description && (
                                <p className="text-gray-500 text-sm mb-2 hover:text-gray-600">
                                  {message.youtubeMetadata.description}
                                </p>
                              )}
                            </CardContent>
                          </div>
                        </a>
                      </Card>
                    </div>
                  )}
                  {message.facebookMetadata && (
                    <div className="flex justify-center mb-4">
                      <Card className="shadow-lg relative w-full max-w-md md:max-w-lg sm:max-w-sm min-h-[250px] md:min-h-[350px]">
                        <a
                          href={message.facebookMetadata.url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block cursor-pointer"
                        >
                          <div className="block cursor-pointer">
                            <CardHeader className="p-4">
                              <div className="flex items-center">
                                <CardTitle className="text-base font-semibold text-blue-600 hover:text-gray-600">
                                  {message.facebookMetadata.title}
                                </CardTitle>
                              </div>
                            </CardHeader>
                            {message.facebookMetadata.thumbnail && (
                              <CardContent className="p-0">
                                <img
                                  src={message.facebookMetadata.thumbnail}
                                  alt={message.facebookMetadata.thumbnail || ""}
                                  className="rounded-t-md w-full h-[200px] sm:h-[150px] object-cover"
                                />
                              </CardContent>
                            )}
                            <CardContent className="p-4">
                              {message.facebookMetadata.description && (
                                <p className="text-gray-500 text-sm mb-2 hover:text-gray-600">
                                  {message.facebookMetadata.description}
                                </p>
                              )}
                            </CardContent>
                          </div>
                        </a>
                      </Card>
                    </div>
                  )}

                  <div className="flex justify-between max-h-[400px]">
                    <div className="flex flex-col justify-center items-center my-2">
                      {message.flexFormatHtmlContentText && (
                        <Link href={`/cards/${message.card}`}>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: message.flexFormatHtmlContentText,
                            }}
                            className="text-center text-gray-800 font-medium cursor-pointer hover:underline"
                          ></div>
                        </Link>
                      )}
                    </div>
                  </div>

                  <div
                    className={`max-w-[75%] rounded-lg p-3 text-sm ${
                      message.senderId === authenticatedUserId
                        ? isHighlighted
                          ? "bg-yellow-100 text-black"
                          : ""
                        : isHighlighted
                        ? "bg-yellow-100 text-black"
                        : ""
                    } transition-all duration-300`}
                  >
                    <div className="flex justify-between items-center">
                      {!message.youtubeMetadata &&
                        !message.shopName &&
                        !message.facebookMetadata && (
                          <p className="text-base flex-1">{message.content}</p>
                        )}
                      {message.readStatus &&
                        message.readStatus.length > 0 &&
                        message.senderId === authenticatedUserId && (
                          <div className="flex items-center ml-2">
                            {message.readStatus.map((status) => (
                              <span key={status.userId} className="ml-1">
                                {status.readAt ? (
                                  <CheckCheck
                                    onClick={viewSeenTime}
                                    className="w-4 h-4 text-green-400 curosr-pointer"
                                  />
                                ) : (
                                  <Check className="w-4 h-4 text-gray-400" />
                                )}
                              </span>
                            ))}
                          </div>
                        )}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {formatMessageTime(message.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center">
              {selectedChatroomData && selectedChatroomData.type == "GROUP" && (
                <>
                  <Avatar className="h-[200px] w-[200px]  mb-4 border">
                    <AvatarImage
                      src={groupImage ? groupImage : "/assets/users.svg"}
                      alt={selectedChatroomData?.name || "Group Image"}
                    />
                    <AvatarFallback>?</AvatarFallback>
                  </Avatar>
                  <p>{selectedChatroomData.name}</p>
                  <Button className="mt-2">
                    You were added at{" "}
                    {new Date(
                      selectedChatroomData.createdAt
                    ).toLocaleDateString()}
                  </Button>
                </>
              )}
              {selectedChatroomData &&
                selectedChatroomData.type == "PERSONAL" && (
                  <>
                    {selectedChatroomData.participants
                      .filter(
                        (participant) =>
                          participant.participantId !== authenticatedUserId
                      )
                      .map((participant) => (
                        <div
                          key={participant.participantId}
                          className="flex flex-col items-center"
                        >
                          <Avatar className="h-[200px] w-[200px] mb-4 border">
                            <AvatarImage src={participant.image || ""} />
                            <AvatarFallback>
                              {participant.accountname.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <p>{participant.accountname}</p>
                          <Button
                            onClick={() =>
                              viewProfileHandler(participant.participantId)
                            }
                            className="mt-2"
                          >
                            View Profile
                          </Button>
                        </div>
                      ))}
                  </>
                )}
            </div>
          )}
        </div>

        <PersonalInfoSheet
          isOpen={isPersonalInfoSheetOpen}
          onClose={() => setPersonalInfoSheetOpen(false)}
          selectedChatroomData={selectedChatroomData}
          authenticatedUserId={authenticatedUserId}
          blockUserHandler={blockUserHandler}
          unblockUserHandler={unblockUserHandler}
        />

        <GroupInfoSheet
          participants={participants}
          isGroupInfoSheetOpen={isGroupInfoSheetOpen}
          setGroupInfoSheetOpen={setGroupInfoSheetOpen}
          selectedChatroomData={selectedChatroomData}
          authenticatedUserId={authenticatedUserId}
          invitableUsers={invitableUsers}
          invitableUsersLoading={invitableUsersLoading}
          handleInvitorChange={handleInvitorChange}
          inviteUserHandler={inviteUserHandler}
          handleAppointAdmin={handleAppointAdmin}
          dischargeAppointAdmin={dischargeAppointAdmin}
          silentHandler={silentHandler}
          unsilentHandler={unsilentHandler}
          leaveGroupHandler={leaveGroupHandler}
          loadInvitorList={loadInvitorList}
          admins={admins}
          allSilentUser={allSilentUser}
          handleRemoveMember={handleRemoveMember}
        />

        <div className="border-t px-4 py-3 md:px-6 flex items-center">
          {!isUserInGroup ? (
            <p className="text-gray-500 text-sm">
              You have left the group. You cannot send messages.
            </p>
          ) : (
            <>
              <div className="mr-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    {!isUserSilenced && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto rounded-full"
                      >
                        <PlusIcon className="h-5 w-5" />
                      </Button>
                    )}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-black text-white border border-gray-100 rounded-lg shadow-md p-2 w-[200px] "
                  >
                    <DropdownMenuItem
                      className="flex items-center text-2xl p-3"
                      onClick={handlePhotoUploadClick}
                    >
                      <Image className="mr-2 h-5 w-5" />
                      Photo
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center text-2xl p-3"
                      onClick={handleFileUploadClick}
                    >
                      <File className="mr-2 h-5 w-5" />
                      File
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center text-2xl p-3"
                      onClick={handleLocationPreview}
                    >
                      <MapPin className="mr-2 h-5 w-5" />
                      Current Location
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center text-2xl p-3"
                      onClick={handleFetchAllCards}
                    >
                      <Menu className="mr-2 h-5 w-5" />
                      FlexCard
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="relative flex-grow">
                {imagePreview && (
                  <div className="relative max-h-[150px] max-w-[150px] mb-4 self-center">
                    <img
                      src={imagePreview}
                      alt="Selected"
                      className="max-h-[150px] max-w-[150px] border border-gray-300 mr-4 mb-4"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 rounded-full p-1"
                    >
                      <X
                        className="w-4 h-4 text-gray-500"
                        onClick={removeFileUpload}
                      ></X>
                    </Button>
                  </div>
                )}
                {filePreview && (
                  <div className="relative max-w-full mb-4 self-center">
                    <div className="border border-gray-300 p-2 rounded-md">
                      <span>{filePreview}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-0 right-0 rounded-full p-1"
                        onClick={removeFileUpload}
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </Button>
                    </div>
                  </div>
                )}
                {locationPreview && (
                  <div className="relative max-w-full mb-4 self-center">
                    <div className="border border-gray-300 p-2 rounded-md">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center"
                        onClick={() => window.open(locationPreview, "_blank")}
                      >
                        {locationPreview}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-0 right-0 rounded-full p-1"
                        onClick={removeFileUpload}
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </Button>
                    </div>
                    <div
                      ref={mapRef}
                      className="h-[200px] w-full rounded-md"
                    ></div>
                  </div>
                )}
                {selectedCard && (
                  <div className="mb-4 border border-gray-300 p-4 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={removeFileUpload}
                      >
                        <X className="w-5 h-5 text-gray-500" />
                      </Button>
                    </div>
                    <div className="flex justify-between max-h-[400px] overflow-y-auto">
                      <div className="flex flex-col justify-center items-center my-2 w-1/2">
                        <h3 className="text-lg font-bold mb-2">
                          {selectedCard.title}
                        </h3>
                        <h3 className="text-lg font-bold mb-2">
                          {selectedCard.cardId}
                        </h3>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: selectedCard.flexHtml.content,
                          }}
                          className="text-center"
                        ></div>
                      </div>
                      <div className="w-1/2 ml-4">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: selectedCard.description,
                          }}
                          className="text-sm text-gray-600"
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                {isMapVisible && (
                  <div>
                    <div
                      ref={mapRef}
                      style={{ width: "100%", height: "400px" }}
                    ></div>
                    <button onClick={handleRemoveMap}>Close Map</button>
                  </div>
                )}

                {shopName && (
                  <div className="flex justify-end mb-4">
                    <Card className="shadow-lg relative inline-block max-w-md">
                      <button
                        onClick={() => {
                          setShopName(null);
                          setShopImage(null);
                          setSiteName(null);
                          setShopDescription(null);
                        }}
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                      >
                        &times;
                      </button>
                      <div className="block cursor-pointer">
                        <CardHeader className="p-4">
                          <div className="flex items-center">
                            <MapPin className="mr-2 h-5 w-5 text-red-500" />
                            <CardTitle className="text-lg font-semibold text-blue-600">
                              {shopName}
                            </CardTitle>
                          </div>
                        </CardHeader>
                        {shopImage && (
                          <CardContent className="p-0">
                            <img
                              src={shopImage}
                              alt={shopName || ""}
                              className="rounded-t-md w-full h-auto"
                            />
                          </CardContent>
                        )}
                        <CardContent className="p-4">
                          {siteName && (
                            <p className="text-gray-500 text-sm mb-2">
                              {siteName}
                            </p>
                          )}
                          {shopDescription && (
                            <p className="text-gray-700">{shopDescription}</p>
                          )}
                        </CardContent>
                      </div>
                    </Card>
                  </div>
                )}

                {youtubeMetadata && (
                  <Card className="mb-4 shadow-lg relative">
                    <button
                      onClick={() => setYoutubeMetadata(null)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    >
                      &times;
                    </button>
                    <a
                      href={youtubeMetadata.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full cursor-pointer"
                    >
                      <CardHeader className="p-4">
                        <div className="flex items-center">
                          <img
                            src={youtubeMetadata.thumbnail}
                            alt="Thumbnail"
                            className="h-10 w-10 mr-2"
                          />
                          <CardTitle className="text-lg font-semibold text-blue-600 hover:text-gray-600">
                            {youtubeMetadata.title}
                          </CardTitle>
                        </div>
                        <CardDescription>
                          {youtubeMetadata.description}
                        </CardDescription>
                      </CardHeader>
                    </a>
                  </Card>
                )}
                {facebookMetadata && (
                  <Card className="mb-4 shadow-lg relative">
                    <button
                      onClick={() => setFacebookMetadata(null)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    >
                      &times;
                    </button>
                    <a
                      href={facebookMetadata.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full cursor-pointer"
                    >
                      <CardHeader className="p-4">
                        <div className="flex items-center">
                          <img
                            src={facebookMetadata.thumbnail}
                            alt="Thumbnail"
                            className="h-10 w-10 mr-2"
                          />
                          <CardTitle className="text-lg font-semibold text-blue-600 hover:text-gray-600">
                            {facebookMetadata.title}
                          </CardTitle>
                        </div>
                        <CardDescription>
                          {facebookMetadata.description}
                        </CardDescription>
                      </CardHeader>
                    </a>
                  </Card>
                )}

                {!isUserSilenced ? (
                  <div className="relative flex items-center">
                    <Textarea
                      placeholder="Type your message..."
                      className="min-h-[36px] h-[36px] line-height w-full rounded-2xl text-black resize-none pr-16 overflow-hidden leading-[15px]"
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      onPaste={handlePaste}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() => {
                        if (ws) {
                          sendMessageHandler(
                            authenticatedUserId,
                            selectedChatroom,
                            messageContent,
                            ws,
                            youtubeMetadata,
                            facebookMetadata
                          );
                        } else {
                          console.error(
                            "WebSocket connection is not available."
                          );
                        }
                      }}
                    >
                      <SendIcon className="w-4 h-4" />
                    </Button>
                  </div>
                ) : isUserSilenced.silentUntil === null ? (
                  <p className="text-red-500 text-sm">
                    You are silenced indefinitely.
                  </p>
                ) : (
                  <div>
                    <p className="text-red-500 text-sm">
                      You are silenced until{" "}
                      {new Date(isUserSilenced.silentUntil).toLocaleString()}.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        <input
          type="file"
          ref={imageInputRef}
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleImageChange}
        />
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>
      <FlexCardModal
        isOpen={isFlexCardModalOpen}
        onClose={() => setFlexCardModalOpen(false)}
        cards={flexCards}
        onCardClick={(card) => {
          console.log("Card clicked:", card);
          setSelectedCard(card);
          setFlexCardModalOpen(false);
        }}
      />
    </>
  );
}
