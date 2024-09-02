"use client"

import Image from "next/image";
import VisitWebButton from "../buttons/visitweb-button";
import { fetchMember } from "@/lib/actions/admin.actions";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { updateMemberFollow } from "@/lib/actions/user.actions";
import { RiUserUnfollowLine } from "react-icons/ri";

interface Props {
  accountId: string;
  authActiveProfileId?: string;
  accountName: string;
  imgUrl?: string;
  shortdescription?: string;
  usertype: string;
  cards: Number;
  followers: string[];
  following: string[];
  webUrl: string; //changelater
  initialFollowingStatus: boolean;
}

function ProfileHeader({
  accountId,
  authActiveProfileId,
  accountName,
  imgUrl,
  shortdescription,
  usertype,
  cards,
  followers,
  following,
  webUrl,
  initialFollowingStatus
}: Props) {

  const [isFollowing, setIsFollowing] = useState<boolean>(initialFollowingStatus);
  const [followersLength, setFollowersLength] = useState<number>(followers.length);

  const isDifferentUser = accountId !== authActiveProfileId;
  const isOrganization = usertype.toUpperCase() == 'ORGANIZATION';

  const handleButtonClick = async (method: 'FOLLOW' | 'UNFOLLOW') => {
    if (!authActiveProfileId) {
      toast.error('You need to login first before action.');
      return;
    }

    try {
      const response = await updateMemberFollow({ authActiveProfileId, accountId, method });
      if (response.success === true){
        const { updatedFollowing, updateFollower } = response.data;
        if (method === "FOLLOW" && updatedFollowing.includes(accountId.toString())) {
          setIsFollowing(true);
        }else{
          setIsFollowing(false);
        }
        setFollowersLength(updateFollower.length);
      }else{
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('Failed to do action, please try again.');
    }
  };

  return (
    <div className='flex w-full flex-col justify-center mt-12 sm:mt-6'>
      <div className='flex items-center justify-center'>
        <div className='flex items-center gap-8 max-sm:gap-4'>
          <div className='relative h-24 w-24 object-cover'>
            {
              imgUrl ? (
                <Image
                  src={imgUrl.toString()}
                  alt='User Profile Image'
                  fill
                  className='rounded-full object-cover shadow-2xl'
                />
              ) : (
                <Image
                  src={'/logo.png'}
                  alt='Logo'
                  fill
                  className='rounded-full object-cover shadow-2xl'
                />
              )
            }
          </div>

          <div className='flex-1 justify-center min-w-60'>
            <div className="flex justify-between items-center">
              <h2 className='flex row text-left text-heading3-bold text-light-1 gap-2'>
                {
                  accountName ? (
                    accountName
                  ) : (
                    "Nickname"
                  )
                }
                {
                  usertype == "ORGANIZATION" && (
                    <Image
                      src='/assets/verified.svg'
                      alt='logout'
                      width={24}
                      height={24}
                    />
                  )
                }
              </h2>
              {/* <div className='justify-center'>
                {accountId == authUserId && (
                  <Link href='/profile/edit'>
                    <div className='flex cursor-pointer gap-3 rounded-lg outline px-3 py-1'>
                      <div className="md:hidden">
                        <Image
                          src='/assets/edit.svg'
                          alt='logout'
                          width={20}
                          height={20}
                        />
                      </div>
                      <p className='text-light-2 max-md:hidden'>Edit Profile</p>
                    </div>
                  </Link>
                )}
              </div> */}
            </div>
            <div className="flex flex-row gap-6 mt-2">
              <p>
                {cards.toString()} Card
              </p>
              <p>
                {followersLength.toString()} Followers
              </p>
              <p>
                {following.length.toString()} Following
              </p>
            </div>
            {/* <p className='text-base-medium text-white-1'>
              @
              {
                accountName ? (
                  accountName
                ) : (
                  "Nickname"
                )
              }
            </p> */}
            <p className='mt-2 max-w-lg text-base-regular text-light-2'>
              {
                shortdescription ? (
                  shortdescription
                ) : (
                  "Short Descriptions"
                )
              }
            </p>
            <div className="flex row gap-3 pt-5">
              {isDifferentUser && (
                !isFollowing ? (
                  // <FollowButton authUserId={authUserId} accountId={accountId} method="FOLLOW" />
                  <Button
                    className='px-3 w-full '
                    variant='sky'
                    onClick={() => handleButtonClick('FOLLOW')}
                  >
                    <Image
                      width={16}
                      height={16}
                      className="rounded-full mr-3"
                      src='/assets/user.svg'
                      alt='profile icon'
                    />
                    Follow
                  </Button>
                )
                  : (
                    // <UnFollowButton authUserId={authUserId} accountId={accountId} method="UNFOLLOW" />
                    <Button
                      className="px-3 w-full"
                      variant="ghost"
                      onClick={() => handleButtonClick('UNFOLLOW')}
                    >
                      <RiUserUnfollowLine className='mr-3' />
                      Unfollow
                    </Button>
                  )
              )}
              {isDifferentUser && isOrganization && (
                <VisitWebButton url={webUrl} />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className='mt-12 h-0.5 bg-gray-900 mx-36' />
    </div>
  );
}

export default ProfileHeader;
