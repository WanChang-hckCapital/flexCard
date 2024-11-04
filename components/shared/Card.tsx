"use client";

import { useEffect, useState } from "react";
import { getLikeCount, updateCardLikes } from "@/lib/actions/user.actions";
import { toast } from "sonner";
import ShareDialog from "./share-dialog";
import { Heart, Share2 } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

interface Props {
  id: string;
  title: string;
  authActiveProfileId?: string;
  creator: {
    accountname: string;
    image: string;
  };
  likes: Like[];
  followers: {
    accountname: string;
    image: string;
  }[];
  lineComponents: string;
  flexHtml: string;
}

interface Like {
  profileId: string;
  accountname: string;
  binarycode: string;
}

function Card({
  id,
  title,
  authActiveProfileId,
  creator,
  likes,
  lineComponents,
  flexHtml,
}: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const [likesData, setLikesData] = useState<Like[]>(likes);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [likeCount, setLikeCount] = useState<number>(likes.length);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likeButtonDisabled, setLikeButtonDisabled] = useState(false);

  const shareUrl = process.env.NEXT_PUBLIC_BASE_URL + `/cards/${id}`;

  useEffect(() => {
    if (authActiveProfileId) {

      const userHasLiked = likes.some(
        (like) => like.profileId === authActiveProfileId
      );

      setIsLiked(userHasLiked);
    }
  }, [authActiveProfileId, likes]);

  useEffect(() => {
    const fetchLikeCount = async () => {
      try {
        const result = await getLikeCount(id);
        if (result.success) {
          setLikeCount(result.likes);
        }
      } catch (error) {
        console.error("Error fetching like count:", error);
      }
    };

    fetchLikeCount();
  }, [id]);

  const handleShareClick = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleUpdateLikeButtonClick = async () => {
    if (!authActiveProfileId) {
      toast.error("You need to login first before actions.");
      return;
    }

    setLikeButtonDisabled(true);

    const initialIsLiked = isLiked;
    const initialLikeCount = likeCount;

    const newLikeCount = initialIsLiked
      ? Math.max(0, initialLikeCount - 1)
      : initialLikeCount + 1;
    setLikeCount(newLikeCount);
    setIsLiked(!initialIsLiked);

    try {
      const updatedCard = await updateCardLikes({
        authActiveProfileId: authActiveProfileId,
        cardId: id,
      });
      if (updatedCard.success) {
        setLikeCount(updatedCard.data?.length || 0);
        setIsLiked(!initialIsLiked);
      } else {
        setLikeCount(initialLikeCount);
        setIsLiked(initialIsLiked);
        toast.error(updatedCard.message);
      }

      if (updatedCard.reachedLimit) {
        setLikeButtonDisabled(true);
      } else {
        setLikeButtonDisabled(false);
      }
    } catch (error) {
      setLikeCount(initialLikeCount);
      setIsLiked(initialIsLiked);
      console.error("Error updating likes:", error);
      toast.error("Error updating likes. Please try again later.");
      setLikeButtonDisabled(false);
    }
  };

  return (
    <article
      className={`relative flex w-full max-w-full flex-col rounded-xl ${
        likes ? "px-0 xs:px-1 xs:py-1" : "bg-dark-2 p-7"
      } overflow-hidden`}
    >
      <div
        className="flex items-start justify-between"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex w-full flex-1 flex-wrap gap-4">
          <div className="flex w-full flex-col items-center">
            {id ? (
              <>
                <div className="relative w-full max-w-full overflow-hidden">
                  <div
                    dangerouslySetInnerHTML={{ __html: flexHtml }}
                    className="flex w-full flex-col items-center max-w-full"
                  />
                  {isHovered && (
                    <Link
                      className="absolute inset-0 flex max-w-full cursor-pointer"
                      href={`/cards/${id}`}
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="bg-gray-600">
                No cards found, Please create a card.
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-around items-center p-2">
        <div className="flex items-center">
          <Button
            variant="none_bg"
            size="icon"
            disabled={likeButtonDisabled}
            onClick={handleUpdateLikeButtonClick}
          >
            {isLiked ? (
              <Heart
                fill="#F47983"
                strokeWidth={0}
                className="cursor-pointer"
              />
            ) : (
              <Heart className="cursor-pointer" />
            )}
          </Button>
          <span className="ml-2">{likeCount}</span>
        </div>
        <div className="flex items-center">
          <Share2 className="cursor-pointer" onClick={handleShareClick} />
          <span className="ml-2">0</span>
        </div>
      </div>
      {isDialogOpen && (
        <ShareDialog
          url={shareUrl}
          lineComponents={lineComponents}
          userImageUrl={creator.image}
          onClose={handleCloseDialog}
        />
      )}
    </article>
  );
}

export default Card;
