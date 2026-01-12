# HabitFlow

A simple yet powerful habit tracking web application built with Next.js, TypeScript, and Supabase.

## Features

- 🔐 **Authentication**: Email/password, magic link, and Google OAuth
- 📝 **Habit Management**: Create, update, and delete habits with custom frequency and settings
- ✅ **Daily Check-ins**: One-click habit completion with undo support
- 🔥 **Streak Tracking**: Automatic streak calculation and motivation
- 📅 **Calendar View**: Visual representation of habit completion over time
- 📊 **Analytics Dashboard**: Insights into habit performance and trends
- 🎨 **Modern UI**: Built with Chakra UI and Tailwind CSS
- 🌙 **Dark Mode**: Toggle between light and dark themes
- 🔔 **Notifications**: Email and push notification support (ready to configure)

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Chakra UI** - Component library
- **Tailwind CSS** - Utility-first styling
- **TanStack Query** - Data fetching and caching
- **Zustand** - State management
- **Recharts** - Data visualization
- **date-fns** - Date manipulation

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - Real-time subscriptions
  - Row Level Security (RLS)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd habitflow
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase/schema.sql`
3. Enable authentication providers:
   - Go to Authentication > Providers
   - Enable Email and Google OAuth (optional)
4. Get your credentials:
   - Go to Settings > API
   - Copy `Project URL` and `anon public` key

### 4. Configure environment variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
habitflow/
├── app/
│   ├── (auth)/           # Authentication routes
│   │   ├── login/
│   │   └── signup/
│   ├── dashboard/        # Main dashboard
│   ├── habits/           # Habit management
│   │   └── new/
│   ├── calendar/         # Calendar view
│   ├── analytics/        # Analytics dashboard
│   ├── settings/         # User settings
│   ├── api/              # API routes
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page (redirects to dashboard)
│   ├── providers.tsx     # App providers
│   └── globals.css       # Global styles
├── components/           # Reusable components
├── hooks/                # Custom React hooks
│   ├── useAuth.ts
│   └── useHabits.ts
├── lib/                  # Utility functions
│   ├── supabase.ts       # Supabase client
│   └── habits.ts         # Habit utilities
├── types/                # TypeScript types
│   └── index.ts
├── supabase/
│   └── schema.sql        # Database schema
└── public/               # Static assets
```

## Database Schema

### Tables

- **users**: Extended user profiles
- **habits**: User habits with frequency and settings
- **habit_logs**: Check-in records
- **categories**: Habit categories
- **notifications**: User notifications
- **achievements**: User achievements and badges

### Row Level Security (RLS)

All tables have RLS enabled to ensure users can only access their own data.

## Key Features

### Authentication

The app uses Supabase Auth for secure authentication:

- Email/password login
- Magic link authentication
- Google OAuth integration
- Session management

### Habit Management

Users can:

- Create habits with custom frequency (daily/weekly)
- Set reminder times
- Choose colors and icons
- Track streaks automatically

### Daily Check-ins

- One-click habit completion
- Undo check-ins on the same day
- Automatic streak calculation
- Progress tracking

### Analytics

- Completion rate tracking
- Weekly consistency metrics
- Best performing habits
- Day-of-week analysis
- 30-day trends

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- AWS Amplify
- Self-hosted

## Future Enhancements

- [ ] AI-powered habit suggestions
- [ ] Social features and challenges
- [ ] Mobile app (React Native)
- [ ] Offline support (PWA)
- [ ] Advanced gamification
- [ ] Habit templates
- [ ] Export data functionality
- [ ] Premium tier with advanced features

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues and questions, please open an issue on GitHub.
