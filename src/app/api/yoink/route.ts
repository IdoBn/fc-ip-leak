import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import {
  getSSLHubRpcClient,
  Message,
  UserDataType,
} from "@farcaster/hub-nodejs";

const HUB_URL = process.env["HUB_URL"] || "nemes.farcaster.xyz:2283";
const hubClient = getSSLHubRpcClient(HUB_URL);

export async function POST(req: NextRequest) {
  const {
    trustedData: { messageBytes },
  } = await req.json();
  const frameMessage = Message.decode(Buffer.from(messageBytes, "hex"));
  const validateResult = await hubClient.validateMessage(frameMessage);
  if (validateResult.isOk() && validateResult.value.valid) {
    const validMessage = validateResult.value.message;
    const fid = validMessage?.data?.fid ?? 0;

    const userDataResult = await hubClient.getUserDataByFid({ fid });
    if (userDataResult.isOk()) {
      const userData = userDataResult.value;
      let name = `FID #${fid}`;
      for (const message of userData.messages) {
        if (message?.data?.userDataBody?.type === UserDataType.USERNAME) {
          name = message.data.userDataBody.value;
          break;
        }
      }
      const flag = (await kv.get("flag")) as string;
      if (name.toString() !== flag.toString()) {
        await kv.set("flag", name);
        await kv.incr("yoinks");
        const key = `yoinks:${name}`;
        await kv.incr(key);
      }

      const imageUrl = `${process.env["HOST"]}/api/images/yoink?date=${Date.now()}`;
      return new NextResponse(
        `<!DOCTYPE html>
      <html>
        <head>
          <title>Yoinked!</title>
          <meta property="og:title" content="Yoinked!" />
          <meta property="og:image" content="${imageUrl}" />
          <meta name="fc:frame" content="vNext" />
          <meta name="fc:frame:image" content="${imageUrl}" />
        </head>
        <body>Hello World</body>
      </html>`,
        {
          status: 200,
          headers: {
            "Content-Type": "text/html",
          },
        }
      );
    } else {
      return new NextResponse("Internal server error", { status: 500 });
    }
  } else {
    return new NextResponse("Bad Request", { status: 401 });
  }
}

export const GET = POST;
