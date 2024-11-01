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
import { saveProfilePreferences } from "@/lib/actions/user.actions";
import Image from "next/image";

interface PreferencesModalProps {
  profileId: string;
  categories: { label: string; imageUrl: string }[];
}

const PreferencesModal: React.FC<PreferencesModalProps> = ({
  profileId,
  categories,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(true);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prevSelected) =>
      prevSelected.includes(category)
        ? prevSelected.filter((item) => item !== category)
        : [...prevSelected, category]
    );
  };

  const handleSubmit = async () => {
    if (selectedCategories.length > 0) {
      await saveProfilePreferences({
        profileId,
        categories: selectedCategories,
      });
    }
    setIsModalOpen(false);
  };

  const handleSkip = async () => {
    await saveProfilePreferences({ profileId, isSkip: true });
    setIsModalOpen(false);
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={() => setIsModalOpen(false)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Select Your Interests</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 p-4 max-h-96 overflow-y-auto">
          {categories.map(({ label, imageUrl }) => (
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
              <Image src={imageUrl} alt={label} width={60} height={60} />
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
            Save Preferences ({selectedCategories.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PreferencesModal;
