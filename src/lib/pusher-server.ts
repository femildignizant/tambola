import Pusher from "pusher";

const appId = process.env.PUSHER_APP_ID;
const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
const secret = process.env.PUSHER_SECRET;
const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

if (!appId || !key || !secret || !cluster) {
  console.warn("Pusher environment variables are missing");
}

export const pusherServer = new Pusher({
  appId: appId || "default_app_id",
  key: key || "default_key",
  secret: secret || "default_secret",
  cluster: cluster || "mt1",
  useTLS: true,
});
