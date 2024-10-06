import { NextRequest, NextResponse } from "next/server";
import Negotiator from "negotiator";
import { match } from "@formatjs/intl-localematcher";

const availableLocales = ["en", "zh-TW"];
const defaultLocale = "en";

function getLocale(request: NextRequest) {
    const negotiator = new Negotiator({ headers: { "accept-language": request.headers.get("accept-language") || "" } });
    const preferredLanguages = negotiator.languages();
    
    const locale = match(preferredLanguages, availableLocales, defaultLocale);
    return locale;
}

export default function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const pathnameHasLocale = availableLocales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    if (!pathnameHasLocale) {
        const locale = getLocale(req);
        req.nextUrl.pathname = `/${locale}${pathname}`;

        return NextResponse.redirect(req.nextUrl);
    }

    let ipAddress = req.headers.get("x-real-ip") || "";

    if (!ipAddress) {
        const forwardedFor = req.headers.get("x-forwarded-for");
        if (forwardedFor) {
            ipAddress = forwardedFor.split(',')[0].trim();
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
        query: ipAddress
    };

    const response = NextResponse.next();

    response.headers.set("request-ip", ipAddress);
    response.headers.set("request-url", req.url);
    response.headers.set("request-geo", JSON.stringify(geoInfo));
    
    response.headers.set("Content-Language", pathnameHasLocale ? pathname.split('/')[1] : getLocale(req));

    return response;
}

export const config = {
    matcher: [
        '/((?!_next|assets|api).*)',
    ],
};
