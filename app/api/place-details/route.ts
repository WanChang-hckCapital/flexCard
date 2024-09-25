// import { NextRequest, NextResponse } from "next/server";

// export async function GET(request: NextRequest) {
//   const { searchParams } = new URL(request.url);
//   const query = searchParams.get("query");
//   const location = searchParams.get("location");
//   const radius = searchParams.get("radius");

//   console.log(location);
//   console.log(radius);
//   if (!query) {
//     return NextResponse.json(
//       { error: "Query parameter is required" },
//       { status: 400 }
//     );
//   }

//   try {
//     const apiKey = process.env.NEXT_PUBLIC_GOOGLEMAPS_API_KEY;
//     let apiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
//       query
//     )}&key=${apiKey}`;

//     if (location) {
//       apiUrl += `&location=${location}`;
//     }
//     if (radius) {
//       apiUrl += `&radius=${radius}`;
//     }

//     const response = await fetch(apiUrl);
//     const data = await response.json();

//     return NextResponse.json(data, { status: 200 });
//   } catch (error) {
//     console.error("Error fetching place details:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch place details" },
//       { status: 500 }
//     );
//   }
// }

// just a dummy function to simulate async operation
import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const queryParam = searchParams.get("param");

        if (!queryParam) {
            return NextResponse.json(
                { success: false, message: "Missing required query parameter 'param'" },
                { status: 400 }
            );
        }

        const data = dummyOperation(queryParam);

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message || "An error occurred" },
            { status: 500 }
        );
    }
}

function dummyOperation(param: string) {
    return { message: `You passed: ${param}` };
}
