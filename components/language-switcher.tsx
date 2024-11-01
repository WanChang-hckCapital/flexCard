"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { updateUserLanguagePreference } from "@/lib/actions/user.actions";

const LanguageSwitcher = ({dict, authActiveProfileId}: any) => {
  const router = useRouter();
  const pathname = usePathname();
  const availableLocales = ["en", "zh-TW"];

  const switchLocale = async (newLocale: string) => {
    const pathWithoutLocale = pathname.replace(/^\/(en|zh-TW)/, "");
    
    if (authActiveProfileId) {
      try {
        await updateUserLanguagePreference(authActiveProfileId, newLocale);
      } catch (error) {
        console.error("Failed to update language preference", error);
      }
    }

    document.cookie = `language=${newLocale}; path=/; max-age=31536000`;
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="w-full">{dict.header.language}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {availableLocales.map((loc) => (
          <DropdownMenuItem key={loc} onClick={() => switchLocale(loc)}>
            {loc === "en" ? "English" : "中文"}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
