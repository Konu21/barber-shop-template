import { NextResponse } from "next/server";

export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /

User-agent: *
Disallow: /dashboard/
Disallow: /api/
Disallow: /booking/cancel/
Disallow: /booking/modify/

Sitemap: ${
    process.env.NEXT_PUBLIC_BASE_URL || "https://your-domain.vercel.app"
  }/sitemap.xml`;

  return new NextResponse(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
