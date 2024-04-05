"use client"

import Image from "next/image";
import Link from "next/link";

import { formatDateString } from "@/lib/utils";
import { useState } from "react";

interface Props {
  id: string;
  title: string;
  currentUserId: string;
  status: string;
  creator: {
    username: string;
    image: string;
    id: string;
  };
  likes: {
    image: string;
  }[];
  components: string;
  createdAt: string;
}

function Card({
  id,
  title,
  currentUserId,
  status,
  likes,
  components,
  createdAt,
}: Props) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <article
      className={`relative flex w-full flex-col rounded-xl ${likes ? "px-0 xs:px-1 xs:py-1" : "bg-dark-2 p-7"
        }`}
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
                  <div className="relative w-full">
                    <div
                      dangerouslySetInnerHTML={{ __html: components }}
                      className='flex w-full flex-col items-center'
                    />
                    {isHovered && (
                      <div className="absolute inset-0 bg-black opacity-30 flex flex-col justify-between">
                        <p className="text-base text-light-2 px-3 py-2">{title}</p>
                        <div className="flex justify-end pr-2 pb-2">
                          <div className="rounded-full bg-white p-1 mr-1">
                            <Image
                              src='/assets/share.svg'
                              alt='heart'
                              width={24}
                              height={24}
                              className='cursor-pointer object-contain'
                            />
                          </div>
                          <div className="rounded-full bg-white p-1">
                            <Image
                              src='/assets/heart-gray.svg'
                              alt='heart'
                              width={24}
                              height={24}
                              className='cursor-pointer object-contain'
                            />
                          </div>
                        </div>
                        <div className="flex justify-start pl-2 pb-2 absolute bottom-0 left-0">
                          <p className='mt-1 text-subtle-medium text-white-1'>
                            {likes.length} lik{likes.length > 1 ? "es" : "e"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-gray-600">
                  hi
                </div>
              )
            }
          </div>

          {/* <div className='flex w-full flex-col'>
            <div className={`${likes && "mb-10"} mt-5 flex flex-col gap-3`}>
              {likes && likes.length > 0 && (
                <Link href={`/card/${id}`}>
                  <p className='mt-1 text-subtle-medium text-gray-1'>
                    {likes.length} lik{likes.length > 1 ? "es" : "e"}
                  </p>
                </Link>
              )}
            </div>
          </div> */}
        </div>
      </div>

      {/* {!likes && likes.length > 0 && (
        <div className='ml-1 mt-3 flex items-center gap-2'>
          {likes.slice(0, 2).map((likes, index) => (
            <Image
              key={index}
              src={comment.author.image}
              alt={`user_${index}`}
              width={24}
              height={24}
              className={`${index !== 0 && "-ml-5"} rounded-full object-cover`}
            />
          ))}

          <Link href={`/thread/${id}`}>
            <p className='mt-1 text-subtle-medium text-gray-1'>
              {comments.length} repl{comments.length > 1 ? "ies" : "y"}
            </p>
          </Link>
        </div>
      )}

      {!likes && community && (
        <Link
          href={`/communities/${community.id}`}
          className='mt-5 flex items-center'
        >
          <p className='text-subtle-medium text-gray-1'>
            {formatDateString(createdAt)}
            {community && ` - ${community.name} Community`}
          </p>

          <Image
            src={community.image}
            alt={community.name}
            width={14}
            height={14}
            className='ml-1 rounded-full object-cover'
          />
        </Link>
      )} */}
    </article>
  );
}

export default Card;
