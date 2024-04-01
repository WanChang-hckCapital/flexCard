import Link from "next/link";
import Image from "next/image";

interface Props {
  accountId: string;
  authUserId: string;
  accountName: string;
  imgUrl?: string;
  shortdescription?: string;
  usertype: string;
  cards:Number;
  followers:Number;
  following:Number;
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
  following
}: Props) {
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

          <div className='flex-1 justify-center'>
            <h2 className='text-left text-heading3-bold text-light-1'>
              {
                accountName ? (
                  accountName
                ) : (
                  "Nickname"
                )
              }
            </h2>
            <div className="flex flex-row gap-6 mt-2">
              <p>
                {cards.toString()} Card
              </p>
              <p>
                {followers.toString()} Followers
              </p>
              <p>
                {following.toString()} Following
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
          </div>
        </div>
        {accountId === authUserId && usertype !== "ORGANIZATION" && (
          <Link href='/profile/edit'>
            <div className='flex cursor-pointer gap-3 rounded-lg bg-white-3 px-4 py-2'>
              <Image
                src='/assets/edit.svg'
                alt='logout'
                width={16}
                height={16}
              />

              <p className='text-light-2 max-sm:hidden'>Edit</p>
            </div>
          </Link>
        )}
      </div>

      <div className='mt-12 h-0.5 w-full bg-white-3' />
    </div>
  );
}

export default ProfileHeader;
