import { NextRequest, NextResponse } from "next/server";
import Negotiator from "negotiator";
import { match } from "@formatjs/intl-localematcher";

const availableLocales = ["en", "zh-TW"];
const defaultLocale = "en";

function getStoredLocale(req: NextRequest) {
  const cookieLocale = req.cookies.get("language")?.value;

  if (cookieLocale && availableLocales.includes(cookieLocale)) {
    return cookieLocale;
  }

  const negotiator = new Negotiator({
    headers: { "accept-language": req.headers.get("accept-language") || "" },
  });
  const preferredLanguages = negotiator.languages();
  return match(preferredLanguages, availableLocales, defaultLocale);
}

export default function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const pathnameHasLocale = availableLocales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    const locale = getStoredLocale(req);

    const newPathname = `/${locale}${pathname}`;
    const newUrl = req.nextUrl.clone();
    newUrl.pathname = newPathname;
    newUrl.search = search;

    return NextResponse.redirect(newUrl);
  }

  let ipAddress = req.headers.get("x-real-ip") || "";

  if (!ipAddress) {
    const forwardedFor = req.headers.get("x-forwarded-for");
    if (forwardedFor) {
      ipAddress = forwardedFor.split(",")[0].trim();
    }
  }

  if (!ipAddress) {
    ipAddress = req.ip || "Unknown";
  }

  const geoInfo = {
    country: req.geo?.country || "Unknown",
    region: req.geo?.region || "Unknown",
    city: req.geo?.city || "Unknown",
    lat: req.geo?.latitude || "Unknown",
    lon: req.geo?.longitude || "Unknown",
    query: ipAddress,
  };

  const response = NextResponse.next();

  response.headers.set("request-ip", ipAddress);
  response.headers.set("request-url", req.url);
  response.headers.set("request-geo", JSON.stringify(geoInfo));

  response.headers.set(
    "Content-Language",
    pathnameHasLocale ? pathname.split("/")[1] : getStoredLocale(req)
  );

  return response;
}

export const config = {
  matcher: ["/((?!_next|assets|api).*)"],
};
