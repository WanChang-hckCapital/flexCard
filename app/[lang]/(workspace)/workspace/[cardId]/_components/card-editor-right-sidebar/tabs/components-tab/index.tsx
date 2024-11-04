"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { fetchAllCards } from "@/lib/actions/user.actions";
import { useEditor } from "@/lib/editor/editor-provider";
import { useState, useEffect, useRef } from "react";
import CardTemplate from "@/components/shared/template";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type Result = {
  cardId: string;
  title: string;
  creator: {
    accountname: string;
    image: string;
  };
  likes: {
    userId: string;
    accountname: string;
    binarycode: string;
  }[];
  followers: {
    accountname: string;
  }[];
  lineComponents: {
    content: string;
  };
  flexComponents: {
    content: string;
  };
  flexHtml: {
    content: string;
  };
}[];

function ComponentsTab() {
  const { state, dispatch } = useEditor();
  const [cards, setCards] = useState<Result | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function getCards() {
      try {
        const result = await fetchAllCards();
        setCards(result);
      } catch (error) {
        console.error("Failed to fetch cards", error);
      } finally {
        setLoading(false);
      }
    }
    getCards();
  }, []);

  const handleAddTemplate = (cardContent: string) => {
    dispatch({
      type: "LOAD_DATA",
      payload: {
        component: JSON.parse(cardContent),
        withLive: false,
      },
    });
  };

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <Accordion
      type="multiple"
      className="w-full px-4"
      defaultValue={["Templates"]}
    >
      <AccordionItem value="Templates" className="py-0 border-y-[1px]">
        <AccordionTrigger className="!no-underline">Templates</AccordionTrigger>
        <AccordionContent className="p-2">
          <button
            onClick={() => handleScroll("left")}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-gray-700 bg-opacity-50 hover:bg-opacity-80 rounded-full"
          >
            <ChevronLeft className="text-white" size={24} />
          </button>
          <div
            className="flex gap-4 overflow-x-auto max-w-[330px] items-center p-[10px]"
            ref={scrollRef}
          >
            {loading
              ? 
                Array.from({ length: 1 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    className="w-[300px] h-[452px] rounded-lg bg-gray-300 dark:bg-gray-700"
                  />
                ))
              :
                cards &&
                cards.map((card) => (
                  <div
                    key={card.cardId}
                    className="relative min-w-[300px] border rounded-lg shadow-lg hover:scale-105 transition-transform duration-200 dark:bg-gray-800 h-fit"
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center">
                      <Button
                        onClick={() =>
                          handleAddTemplate(card.flexComponents.content)
                        }
                        className="bg-white text-black font-semibold px-4 py-2"
                      >
                        Use Template
                      </Button>
                    </div>

                    <CardTemplate
                      id={card.cardId}
                      title={card.title}
                      creator={card.creator}
                      lineComponents={card.lineComponents.content}
                      flexHtml={card.flexHtml.content}
                    />
                  </div>
                ))}
          </div>
          <button
            onClick={() => handleScroll("right")}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-gray-700 bg-opacity-50 hover:bg-opacity-80 rounded-full"
          >
            <ChevronRight className="text-white" size={24} />
          </button>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default ComponentsTab;
