"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Card } from "@/types";
import { upsertCardContent } from "@/lib/actions/workspace.actions";
import { useRouter } from "next/navigation";

interface CategoryModalProps {
  profileId: string;
  categories: { label: string; emoji: string }[];
  cardDetails: Card;
  strFlexFormatHtml: string;
  strLineFlexMessage: string;
  htmlFormat: string;
  onClose: () => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  profileId,
  categories,
  cardDetails,
  strFlexFormatHtml,
  strLineFlexMessage,
  htmlFormat,
  onClose,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const router = useRouter();

  const toggleCategory = (category: string) => {
    setSelectedCategories((prevSelected) =>
      prevSelected.includes(category)
        ? prevSelected.filter((item) => item !== category)
        : [...prevSelected, category]
    );
  };

  const handleSubmit = async () => {
    if (selectedCategories.length === 0) {
      toast.error("Please select at least one category.");
      return;
    }

    const essentialCardDetails = {
      cardID: cardDetails.cardID,
      title: cardDetails.title,
      status: cardDetails.status,
      description: cardDetails.description,
      categories: selectedCategories,
    };

    try {

      const result = await upsertCardContent(
        profileId,
        essentialCardDetails,
        strFlexFormatHtml,
        strLineFlexMessage,
        htmlFormat,
        selectedCategories
      );

      if (result && result.message == "success") {
        toast.success("Card and categories saved successfully!");
        setIsModalOpen(false);
        onClose();
        router.push(`/profile/${profileId}`);
      }
    } catch (error) {
      toast.error("Error saving card. Please try again.");
    }
  };

  const handleSkip = async () => {
    try {
      const essentialCardDetails = {
        cardID: cardDetails.cardID,
        title: cardDetails.title,
        status: cardDetails.status,
        description: cardDetails.description,
      };
      const result = await upsertCardContent(
        profileId,
        essentialCardDetails,
        strFlexFormatHtml,
        strLineFlexMessage,
        htmlFormat
      );

      if (result && result.message == "success") {
        toast.success("You may modify categories later in the settings page.");
        setIsModalOpen(false);
        onClose();
        router.push(`/profile/${profileId}`);
      }
    } catch (error) {
      toast.error("Error saving card. Please try again.");
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={() => setIsModalOpen(false)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Select Your Categories</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 p-4 max-h-96 overflow-y-auto">
          {categories.map(({ label, emoji }) => (
            <div
              key={label}
              className={`border rounded-lg p-4 flex flex-col items-center justify-between cursor-pointer ${
                selectedCategories.includes(label) ? "bg-gray-500" : ""
              }`}
              onClick={() => toggleCategory(label)}
            >
              <Checkbox
                className="self-end"
                id={label}
                checked={selectedCategories.includes(label)}
                onCheckedChange={() => toggleCategory(label)}
              />
              <div className="text-[36px]">{emoji}</div>
              <div className="mt-2 text-center">
                <p>{label}</p>
              </div>
            </div>
          ))}
        </div>
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleSkip}>
            Skip
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedCategories.length === 0}
          >
            Save Categories ({selectedCategories.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryModal;
