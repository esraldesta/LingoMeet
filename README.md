# Talk - Language Practice Platform

A real-time language practice platform built with Next.js, WebRTC, and BetterAuth.

## Features

- **Real-time Video/Audio Communication**: Practice languages with other learners using WebRTC
- **Room Management**: Create and join conversation rooms
- **User Types**: Support for general users, teachers, and AI practice rooms
- **Authentication**: Secure authentication with BetterAuth
- **Subscription System**: Free first month, then subscription-based

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Authentication**: BetterAuth
- **Database**: PostgreSQL with Prisma ORM
- **Real-time Communication**: WebRTC, PeerJS
- **Video/Audio**: MediaStream API

## Setup

1. **Install Dependencies**

```bash
npm install
```

2. **Set Up Environment Variables**

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/talk_db
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# PeerJS (optional - defaults to 0.peerjs.com)
NEXT_PUBLIC_PEERJS_HOST=0.peerjs.com
NEXT_PUBLIC_PEERJS_PORT=443

# Optional: Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

3. **Set Up Database with Prisma**

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push
```

BetterAuth will automatically create its required tables on first run.

4. **Start the Development Server**

```bash
npm run dev
```

PeerJS handles WebRTC signaling automatically, so no separate signaling server is needed!

## Project Structure

```
talk/
├── app/
│   ├── api/
│   │   ├── auth/          # BetterAuth routes
│   │   └── rooms/         # Room API endpoints
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── room/              # Video room pages
│   └── layout.tsx
├── components/
│   ├── providers/         # React providers
│   └── video-room.tsx     # WebRTC video component
├── lib/
│   ├── auth.ts           # BetterAuth configuration
│   └── db.ts             # Prisma client
└── prisma/
    └── schema.prisma     # Prisma schema
```

## Features in Development

- [ ] Teacher dashboard with student management
- [ ] Progress tracking for students
- [ ] AI-powered conversation practice
- [ ] Text chat in rooms
- [ ] Room scheduling
- [ ] Subscription payment integration
- [ ] Advanced moderation features

## License

MIT
