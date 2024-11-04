"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  saveProfilePreferences,
  fetchProfilePreferences,
} from "@/lib/actions/user.actions";
import { toast } from "sonner";

interface PreferencesComponentProps {
  profileId: string;
  categories: { label: string; emoji: string }[];
}

const PreferencesComponent: React.FC<PreferencesComponentProps> = ({
  profileId,
  categories,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [initialCategories, setInitialCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const preferences = await fetchProfilePreferences(profileId);
        setSelectedCategories(preferences.categories);
        setInitialCategories(preferences.categories);
      } catch (error: any) {
        toast.error("Error fetching preferences:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, [profileId]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prevSelected) =>
      prevSelected.includes(category)
        ? prevSelected.filter((item) => item !== category)
        : [...prevSelected, category]
    );
  };

  const handleSubmit = async () => {
    if (selectedCategories.length > 0) {
      try {
        await saveProfilePreferences({
          profileId,
          categories: selectedCategories,
        });
        toast.success("Preferences updated successfully!");
        setInitialCategories(selectedCategories);
      } catch (error) {
        console.error("Error saving preferences:", error);
        toast.error("Failed to update preferences. Please try again.");
      }
    }
  };

  const hasChanges = () => {
    if (selectedCategories.length !== initialCategories.length) {
      return true;
    }
    return selectedCategories.some(
      (category) => !initialCategories.includes(category)
    );
  };

  if (isLoading) {
    return <p>Loading preferences...</p>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold text-center mb-4">
        Modify Your Interests
      </h2>
      <div className="grid grid-cols-3 gap-4 p-4 max-h-[500px] overflow-y-auto">
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
      <div className="flex justify-center mt-8">
        <Button
          variant="purple"
          onClick={handleSubmit}
          disabled={!hasChanges() || selectedCategories.length === 0}
        >
          Update Preferences
        </Button>
      </div>
    </div>
  );
};

export default PreferencesComponent;
