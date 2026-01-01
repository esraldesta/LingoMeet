# Setup Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- npm or yarn package manager

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/talk_db

# BetterAuth
BETTER_AUTH_SECRET=your-secret-key-here-change-in-production
BETTER_AUTH_URL=http://localhost:3000

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SIGNALING_URL=http://localhost:3001

# Signaling Server
SIGNALING_PORT=3001

# Optional: Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Generate a secret key:**
```bash
openssl rand -base64 32
```

### 3. Create Database

```bash
# Create database
createdb talk_db

# Or using psql
psql -U postgres
CREATE DATABASE talk_db;
```

### 4. Set Up Database with Prisma

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push
```

BetterAuth will automatically create its required tables when you first run the application.

### 5. (Optional) Open Prisma Studio

To view and manage your database:

```bash
npm run db:studio
```

### 6. Start the Application

```bash
npm run dev
```

PeerJS handles WebRTC signaling automatically, so no separate server is needed!

### 7. Access the Application

- Frontend: http://localhost:3000

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running
- Check your DATABASE_URL format: `postgresql://user:password@host:port/database`
- Verify database exists

### BetterAuth Issues

- Make sure BETTER_AUTH_SECRET is set
- Check that BETTER_AUTH_URL matches your app URL
- BetterAuth tables should be created automatically on first run

### WebRTC Issues

- PeerJS uses its own signaling servers (0.peerjs.com by default)
- Check browser console for WebRTC errors
- Make sure you're using HTTPS in production (required for WebRTC)
- For production, consider hosting your own PeerJS server

### Port Conflicts

- If port 3000 is in use, Next.js will suggest another port
- Update NEXT_PUBLIC_APP_URL and BETTER_AUTH_URL accordingly

## Next Steps

1. Create your first account
2. Create a room
3. Invite others to join
4. Start practicing languages!
