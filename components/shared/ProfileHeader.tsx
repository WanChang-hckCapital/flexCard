import Link from "next/link";
import Image from "next/image";
import FollowButton from "../buttons/follow-button";
import UnFollowButton from "../buttons/unfollow-button";
import VisitWebButton from "../buttons/visitweb-button";

interface Props {
  accountId: string;
  authUserId: string;
  accountName: string;
  imgUrl?: string;
  shortdescription?: string;
  usertype: string;
  cards: Number;
  followers: string[];
  following: string[];
  webUrl: string; //changelater
}

function ProfileHeader({
  accountId,
  authUserId,
  accountName,
  imgUrl,
  shortdescription,
  usertype,
  cards,
  followers,
  following,
  webUrl
}: Props) {
  const isFollowing = following.includes(accountId);
  const isDifferentUser = accountId !== authUserId;
  const isOrganization = usertype.toUpperCase() == 'ORGANIZATION';

  return (
    <div className='flex w-full flex-col justify-center'>
      <div className='flex items-center justify-center'>
        <div className='flex items-center gap-8'>
          <div className='relative h-24 w-24 object-cover'>
            {
              imgUrl ? (
                <Image
                  src={imgUrl}
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

          <div className='flex-1 justify-center min-w-80'>
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
                {followers.length.toString()} Followers
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
                  <FollowButton authUserId={authUserId} accountId={accountId} method="FOLLOW" />
                )
                 : (
                  <UnFollowButton authUserId={authUserId} accountId={accountId} method="UNFOLLOW" />
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
