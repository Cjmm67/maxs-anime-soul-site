# Max's Anime Soul Site — With Parental Controls

Max's anime website featuring Gojo-sensei AI chatbot with full parental controls.

## Features

✅ **PIN-protected chat access** — Max needs a 4-digit PIN to chat  
✅ **Parent dashboard** — View chat history, usage stats, welfare alerts  
✅ **Daily time limits** — Set max chat time per day (default: 30 minutes)  
✅ **Content filtering** — Input/output filters + welfare alerts for concerning messages  
✅ **Chat logging** — All conversations stored in Redis for 30 days  

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Then fill in:

- `MAX_PIN` — 4-digit PIN for Max to access chat (default: 1234)
- `PARENT_PASSWORD` — Password for parent dashboard (default: parent123)
- `ANTHROPIC_API_KEY` — Get from https://console.anthropic.com
- `UPSTASH_REDIS_REST_URL` — Get from https://console.upstash.com
- `UPSTASH_REDIS_REST_TOKEN` — Get from https://console.upstash.com
- `DAILY_LIMIT_SECONDS` — Max chat time per day in seconds (1800 = 30 min)

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Deploy to Vercel

```bash
vercel --prod
```

Make sure to add all environment variables in Vercel dashboard.

## Usage

### For Max (the kid)

1. Visit the site
2. Enter the 4-digit PIN
3. Chat with Gojo-sensei about anime!

### For Parents

1. Visit `/parent` route
2. Enter parent password
3. View:
   - Chat history by date
   - Message counts
   - Welfare alerts (if any)
   - Filter blocks

## Parental Controls

### PIN Gate

- Max must enter a 4-digit PIN before chatting
- PIN is stored as environment variable (never in client code)
- Session expires after 4 hours

### Usage Limits

- Default: 30 minutes of chat time per day
- Tracks actual API response time + 10 seconds per interaction
- Resets at midnight Singapore time
- Gojo gives a friendly message when limit is reached

### Content Filtering

**Input filter** blocks:
- Personal information requests
- Inappropriate topics
- Harmful content

**Output filter** sanitizes:
- URLs and links
- Personal information
- Inappropriate content

### Welfare Alerts

System logs and alerts parents if Max mentions:
- **Tier 2**: Bullying, feeling sad/scared, school problems
- **Tier 3**: Self-harm, abuse, serious distress

Parents see these in the dashboard with full context.

## File Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Main site (PIN gate + chat)
│   ├── globals.css             # Global styles
│   ├── components/
│   │   ├── PinGate.tsx         # PIN entry screen
│   │   ├── ChatWindow.tsx      # Main chat UI
│   │   ├── ChatBubble.tsx      # Individual message bubble
│   │   └── BreakReminder.tsx   # Break reminder popup
│   ├── parent/
│   │   ├── page.tsx            # Parent dashboard
│   │   └── layout.tsx          # Parent layout
│   └── api/
│       ├── auth/route.ts       # PIN verification
│       ├── chat/route.ts       # Chat with Claude + filters
│       └── parent/
│           └── logs/route.ts   # Parent dashboard API
└── lib/
    ├── redis.ts                # Upstash Redis client
    ├── logger.ts               # Chat logging
    ├── input-filter.ts         # Input content filter
    ├── output-filter.ts        # Output content filter
    ├── welfare.ts              # Welfare alert system
    ├── usage-limiter.ts        # Daily time limits
    └── system-prompt.ts        # Gojo persona + safety rules
```

## Customization

### Change PIN

Edit `.env.local`:
```env
MAX_PIN=5678
```

### Change Daily Limit

Edit `.env.local` (in seconds):
```env
DAILY_LIMIT_SECONDS=3600  # 1 hour
```

### Change Parent Password

Edit `.env.local`:
```env
PARENT_PASSWORD=newsecurepassword
```

### Customize Gojo's Personality

Edit `src/lib/system-prompt.ts`

## Tech Stack

- **Next.js 14** — React framework with App Router
- **TypeScript** — Type safety
- **Anthropic Claude** — AI chatbot (Haiku model)
- **Upstash Redis** — Chat logging and usage tracking
- **Vercel** — Deployment

## Support

For issues or questions, contact the developer.

---

**Created by Max** — Age 11, Singapore  
*The Creative Legend* ⚡
