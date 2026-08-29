# Realtime Collab Board

Collaborative sticky notes with **live cursors** powered by Partykit WebSockets.

- **Live:** [realtime-collab-pink.vercel.app](https://realtime-collab-pink.vercel.app)
- **Portfolio:** [portfolio-hub-flax.vercel.app](https://portfolio-hub-flax.vercel.app)

## Features

- Shared sticky notes board (add, edit, sync)
- Live cursor presence with user labels
- Multi-user realtime sync via Partykit
- Matching portfolio design system

## Stack

- Next.js 16 · Partykit · partysocket · TypeScript · Tailwind v4

## Local Development

Terminal 1 — Partykit server:
```bash
npx partykit dev
```

Terminal 2 — Next.js:
```bash
npm run dev
```

Open two browser tabs at http://localhost:3000 to see realtime sync.

## Deploy

1. Deploy Partykit: `npx partykit deploy`
2. Set `NEXT_PUBLIC_PARTYKIT_HOST` in Vercel to your Partykit host
3. Deploy Next.js: `vercel --prod`

## License

MIT
