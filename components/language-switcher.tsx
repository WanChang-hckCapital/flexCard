"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

const LanguageSwitcher = () => {
  const router = useRouter();
  const pathname = usePathname();
  const availableLocales = ["en", "zh-TW"];

  const switchLocale = (newLocale: string) => {
    const pathWithoutLocale = pathname.replace(/^\/(en|zh-TW)/, "");
    document.cookie = `language=${newLocale}; path=/; max-age=31536000`;
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Switch Language</Button>
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
