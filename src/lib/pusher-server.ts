import Pusher from "pusher";

const pusher =
  process.env.PUSHER_APP_ID &&
  process.env.PUSHER_SECRET &&
  process.env.NEXT_PUBLIC_PUSHER_KEY &&
  process.env.NEXT_PUBLIC_PUSHER_CLUSTER
    ? new Pusher({
        appId: process.env.PUSHER_APP_ID,
        key: process.env.NEXT_PUBLIC_PUSHER_KEY,
        secret: process.env.PUSHER_SECRET,
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
        useTLS: true,
      })
    : null;

export { pusher };

export function getLobbyChannelName(code: string): string {
  return `private-lobby-${code.toUpperCase()}`;
}
