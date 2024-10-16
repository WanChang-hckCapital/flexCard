import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FlexCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: any[];
  onCardClick: (card: any) => void;
  dict: any;
}

const FlexCardModal: React.FC<FlexCardModalProps> = ({
  isOpen,
  onClose,
  cards,
  onCardClick,
  dict,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg overflow-hidden shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl dark:text-black font-bold">
            {dict.chatroom.message.flxbubble}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5 text-gray-500" />
          </Button>
        </div>

        <div className="p-4 overflow-y-auto overflow-x-hidden max-h-[70vh]">
          {cards.length > 0 ? (
            cards.map((card) => (
              <Card
                key={card._id}
                className="mb-4 transition-transform transform hover:scale-105"
                onClick={() => onCardClick(card)}
              >
                <CardHeader>
                  <CardTitle className="transition-transform transform hover:scale-105 hover:text-blue-500">
                    {card.title || "Untitled Card"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {card.flexHtml.content && (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: card.flexHtml.content,
                      }}
                      className="flex w-full flex-col items-center max-w-full mb-2"
                    ></div>
                  )}
                  {card.description && (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: card.description,
                      }}
                      className="flex w-full flex-col items-center max-w-full"
                    ></div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-black">
              {dict.chatroom.message.noflxbubblefound}
            </p>
          )}
        </div>
        <div className="p-4 border-t">
          <Button onClick={onClose}>
            {" "}
            {dict.chatroom.message.flxbubbleclose}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FlexCardModal;
