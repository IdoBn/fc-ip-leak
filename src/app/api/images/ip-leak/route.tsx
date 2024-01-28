import { NextResponse, NextRequest } from "next/server";
import satori from "satori";
import sharp from "sharp";
import { join } from "path";
import * as fs from "fs";

const interRegPath = join(process.cwd(), "public/Inter-Regular.ttf");
let interReg = fs.readFileSync(interRegPath);

const interBoldPath = join(process.cwd(), "public/Inter-Bold.ttf");
let interBold = fs.readFileSync(interBoldPath);

export async function GET(req: NextRequest) {
  console.log("request", req);
  console.log("request", JSON.stringify(req));
  console.log("cookies", req.cookies);
  console.log("ip", req.ip);
  console.log("url", req.url);
  console.log("nextUrl", req.nextUrl);
  console.log("headers", req.headers);
  console.log("headers", req.headers);
  // const { query, headers } = req; // Extract query parameters and headers
  // console.log("query", query);
  // console.log("headers", headers);
  // const name = query.name;

  // Get the original IP address from the X-Forwarded-For header
  const originalIpAddress = req.headers.get("x-forwarded-for");
  const name = req.nextUrl.searchParams.get("name");
  console.log("originalIpAddress", originalIpAddress);

  const svg = await satori(
    <div
      style={{
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: "white",
        padding: 50,
        lineHeight: 1.2,
        fontSize: 24,
        color: "black",
      }}
    >
      <h1>Got you!</h1>
      <div style={{ display: "flex" }}>
        {" "}
        name: {name} IP: {originalIpAddress}{" "}
      </div>
    </div>,
    {
      width: 600,
      height: 400,
      fonts: [
        {
          name: "Inter",
          data: interReg,
          weight: 400,
          style: "normal",
        },
        {
          name: "Inter",
          data: interBold,
          weight: 800,
          style: "normal",
        },
      ],
    }
  );

  const img = await sharp(Buffer.from(svg))
    .resize(1200)
    .toFormat("png")
    .toBuffer();
  return new NextResponse(img, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "max-age=10",
    },
  });
}
