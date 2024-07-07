"use client"

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
  authenticatedUserId?: string;
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
  userId: string;
  accountname: string;
  binarycode: string;
}

function Card({
  id,
  title,
  authenticatedUserId,
  creator,
  likes,
  lineComponents,
  flexHtml
}: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const [likesData, setLikesData] = useState<Like[]>(likes);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [likeCount, setLikeCount] = useState<number>(likes.length);
  const [isLiked, setIsLiked] = useState<boolean>(likes.some(like => like.userId === authenticatedUserId));
  const [likeButtonDisabled, setLikeButtonDisabled] = useState(false);

  const shareUrl = process.env.NEXT_PUBLIC_BASE_URL + `/cards/${id}`;

  useEffect(() => {
    const fetchLikeCount = async () => {
      try {
        const result = await getLikeCount(id);
        if (result.success) {
          setLikeCount(result.likes);
        }
      } catch (error) {
        console.error('Error fetching like count:', error);
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

  // const handleUpdateLikeButtonClick = async () => {
  //   if (!authenticatedUserId) {
  //     toast.error("You need to login first before actions.");
  //     return;
  //   }

  //   try {
  //     const updatedCard = await updateCardLikes({ authUserId: authenticatedUserId, cardId: id });
  //     if (updatedCard.success === true) {
  //       // setLikesData(updatedCard.data || []);
  //       setLikeCount(updatedCard.data?.length || 0);
  //       setIsLiked(!isLiked);
  //     } else {
  //       toast.error(updatedCard.message);
  //     }
  //   } catch (error) {
  //     console.error('Error updating member likes:', error);
  //   }
  // };

  const handleUpdateLikeButtonClick = async () => {
    if (!authenticatedUserId) {
      toast.error("You need to login first before actions.");
      return;
    }

    const initialIsLiked = isLiked;
    const initialLikeCount = likeCount;
    const newLikeCount = initialIsLiked ? Math.max(0, initialLikeCount - 1) : initialLikeCount + 1;
    setLikeCount(newLikeCount);
    setIsLiked(!initialIsLiked);

    try {
      const updatedCard = await updateCardLikes({ authUserId: authenticatedUserId, cardId: id });
      if (updatedCard.success === true) {
        setLikeCount(updatedCard.data?.length || 0);
        setIsLiked(!initialIsLiked);
      } else {
        setLikeCount(initialLikeCount);
        setIsLiked(initialIsLiked);
        toast.error(updatedCard.message);
      }

      if (updatedCard.reachedLimit === true) {
        setLikeButtonDisabled(true);
      }
    } catch (error) {
      setLikeCount(initialLikeCount);
      setIsLiked(initialIsLiked);
      console.error('Error updating member likes:', error);
      toast.error('Error updating likes. Please try again later.');
    }
  };

  const tempUrl =
    `<div class="max-w-full overflow-hidden" style="margin-left: 8px; margin-right: 8px; direction: undefined">
      <div class="component-container relative bg-white overflow-hidden mt-2 border-x border-t rounded-t-lg">
          <div
              style="background-color: undefined; justify-content: center; margin-top: undefined; top: 0; left: 0; right: 0; bottom: 0">
              <div
                  style="display: inline-block; width: 300px; height: 300px; background-image: url(https://t4.ftcdn.net/jpg/02/74/09/93/240_F_274099332_K8UURabl8CcuKtJlqj0wtLo5g2KONmXY.jpg); background-size: cover; background-repeat: no-repeat; background-position: center; overflow: hidden">
              </div>
          </div>
      </div>
      <div
          class="component-container relative mb-2 p-4 border-b border-x rounded-b-lg shadow-lg bg-white overflow-hidden">
          <p
              style="color: #FFCCCC; text-align: center; letter-spacing: undefined; font-weight: undefined; font-size: undefined; font-style: undefined; text-decoration: undefined; margin-top: undefined; top: undefined; left: undefined; right: undefined; bottom: undefined">
              Meow</p>
          <div
              style="background-color: #880808; color: white; height: 40px; padding: 10px 20px; border-radius: 5px; width: 100%; text-align: center; margin-top: 10px; top: undefined; left: undefined; right: undefined; bottom: undefined">
              <a href="https://www.google.com" style="color: inherit; text-decoration: none;">New Button</a>
          </div>
      </div>
    </div>`;

  return (
    <article
      className={`relative flex w-full max-w-full flex-col rounded-xl ${likes ? "px-0 xs:px-1 xs:py-1" : "bg-dark-2 p-7"} overflow-hidden`}
    >
      <div
        className="flex items-start justify-between"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className='flex w-full flex-1 flex-wrap gap-4'>
          <div className='flex w-full flex-col items-center'>
            {
              id ? (
                <>
                  <div className="relative w-full max-w-full overflow-hidden">
                    <div
                      dangerouslySetInnerHTML={{ __html: flexHtml }}
                      className='flex w-full flex-col items-center max-w-full'
                    />
                    {/* {isHovered && (
                      <div 
                        className="absolute inset-0 bg-black opacity-50 flex flex-col justify-between max-w-full cursor-pointer"
                        onClick={handleNavigateToCardDetail}
                        >
                        <p className="text-[18px] text-light-2 px-3 py-5 max-w-full truncate">{title}</p>
                        <div className="flex justify-end pr-2 pb-2 max-w-full">
                          <div
                            onClick={handleShareClick}
                            className="rounded-full bg-white p-1 mr-1 hover:scale-110">
                            <Image
                              src='/assets/share.svg'
                              alt='share'
                              width={24}
                              height={24}
                              className='cursor-pointer object-contain'
                            />
                          </div>
                          <div
                            onClick={handleUpdateLikeButtonClick}
                            className="rounded-full bg-white p-1 hover:scale-110">
                            <Image
                              src='/assets/heart-gray.svg'
                              alt='heart'
                              width={24}
                              height={24}
                              className='cursor-pointer object-contain'
                            />
                          </div>
                        </div>
                        <div className="flex justify-start pl-2 pb-2 absolute bottom-2 left-2">
                          {likesData.slice(-5).map((like, index) => (
                            <div key={index} className="object-cover max-w-full self-center">
                              <Image
                                src={like.binarycode}
                                alt={like.accountname}
                                width={28}
                                height={28}
                                className="rounded-full"
                              />
                            </div>
                          ))}
                          <p className='mt-1 text-[18px] text-white-1'>
                            {likesData.length} lik{likesData.length > 1 ? "es" : "e"}
                          </p>
                        </div>
                      </div>
                    )}
                    {isDialogOpen && <ShareDialog url={shareUrl} lineComponents={lineComponents} userImageUrl={creator.image} onClose={handleCloseDialog} />} */}
                    {isHovered && (
                      <Link className="absolute inset-0 flex max-w-full cursor-pointer" href={`/cards/${id}`} />
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-gray-600">
                  No cards found, Please create a card.
                </div>
              )
            }
          </div>
        </div>
      </div>
      <div className="flex justify-around items-center p-2">
        <div className="flex items-center">
          <Button variant="none_bg" size="icon" disabled={likeButtonDisabled} onClick={handleUpdateLikeButtonClick}>
            {isLiked ? (
              <Heart fill="#F47983" strokeWidth={0} className="cursor-pointer" />
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
        <ShareDialog url={shareUrl} lineComponents={lineComponents} userImageUrl={creator.image} onClose={handleCloseDialog} />
      )}
    </article>
  );
}

export default Card;
