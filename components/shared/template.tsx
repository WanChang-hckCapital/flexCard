"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Props {
  id: string;
  title: string;
  creator: {
    accountname: string;
    image: string;
  };
  lineComponents: string;
  flexHtml: string;
}

function CardTemplate({ id, title, creator, lineComponents, flexHtml }: Props) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <article
      className={`relative flex w-full max-w-full flex-col rounded-xl ${
        lineComponents ? "px-0 xs:px-1 xs:py-1" : "bg-dark-2 p-7"
      } overflow-hidden`}
    >
      <div className="flex items-center justify-center p-2 border-b dark:border-gray-700 border-gray-200">
        <Image
          src={creator.image}
          alt={creator.accountname}
          width={40}
          height={40}
          className="rounded-full h-10 w-10"
        />
        <div className="ml-2 text-center">
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-gray-500 text-sm">{creator.accountname}</p>
        </div>
      </div>
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
    </article>
  );
}

export default CardTemplate;
