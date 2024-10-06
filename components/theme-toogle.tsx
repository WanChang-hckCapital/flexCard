"use client"

import { useTheme } from "@/app/context/theme-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ThemeToggle = ( {dict}: any ) => {
  const { theme, setTheme } = useTheme();

  const handleChange = (value: string) => {
    setTheme(value as "light" | "dark" | "system");
  };

  return (
    <div>
      <label htmlFor="theme" className="sr-only">{dict.userSettings.theme.choice}:</label>
      <Select value={theme} onValueChange={handleChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={dict.userSettings.theme.choice} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">{dict.userSettings.theme.light}</SelectItem>
          <SelectItem value="dark">{dict.userSettings.theme.dark}</SelectItem>
          <SelectItem value="system">{dict.userSettings.theme.system}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ThemeToggle;
