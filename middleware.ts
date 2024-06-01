import { NextRequest, NextResponse } from "next/server";

export default function middleware(req: NextRequest) {
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
    response.headers.set('request-ip', ipAddress);
    response.headers.set('request-url', req.url);
    response.headers.set('request-geo', JSON.stringify(geoInfo));

    return response;
}