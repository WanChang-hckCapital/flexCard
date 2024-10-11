"use server";
const dictionaries: Record<string, () => Promise<Record<string, any>>> = {
  en: () =>
    import("@/public/dictionaries/en.json").then((module) => module.default),
  "zh-TW": () =>
    import("@/public/dictionaries/zh-TW.json").then((module) => module.default),
};
export const getDictionary = async (
  locale: string
): Promise<Record<string, any>> => {
  const dictionaryLoader = dictionaries[locale];
  if (!dictionaryLoader) {
    throw new Error(`No dictionary found for locale: ${locale}`);
  }
  return dictionaryLoader();
};