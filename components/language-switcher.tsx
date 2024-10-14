"use client";

import { useRouter } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';

const LanguageSwitcher = () => {
  const router = useRouter();
  const availableLocales = ['en', 'zh-TW'];

  const switchLocale = (newLocale: string) => {
    const currentPath = window.location.pathname;
    const pathWithoutLocale = currentPath.replace(/^\/(en|zh-TW)/, '');
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
            {loc === 'en' ? 'English' : '中文'}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
