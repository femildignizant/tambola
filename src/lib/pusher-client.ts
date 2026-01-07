import Pusher from "pusher-js";

const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

if (!key) {
  console.warn("NEXT_PUBLIC_PUSHER_KEY is not defined");
}

if (!cluster) {
  console.warn("NEXT_PUBLIC_PUSHER_CLUSTER is not defined");
}

export const pusherClient = new Pusher(key || "default_key", {
  cluster: cluster || "mt1",
});
