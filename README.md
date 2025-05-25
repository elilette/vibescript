# VibeScript 📱✨

A mobile app that uses AI-powered graphology analysis to reveal personality insights from handwriting samples, designed specifically for GenZ users.

## 🎯 Features

- **🖋️ Handwriting Analysis**: Upload or capture handwriting samples for AI-powered personality analysis
- **🧠 Personality Insights**: Get detailed personality trait scores including creativity, emotional intelligence, leadership, and more
- **📊 Progress Tracking**: Monitor your personality journey with stats and streak tracking
- **📝 Daily Journal**: Record thoughts and mood scores to track personal growth
- **🏆 Achievement System**: Unlock badges and milestones as you explore your personality
- **🎨 Beautiful UI**: Modern gradient design with smooth animations and intuitive navigation

## 🛠️ Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Navigation**: React Navigation 6
- **Styling**: React Native StyleSheet with Linear Gradients
- **Icons**: Expo Vector Icons (Ionicons)
- **Image Handling**: Expo Image Picker & Camera
- **State Management**: React Context + useReducer

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd VibeScript
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Supabase**

   - Create a new project at [supabase.com](https://supabase.com)
   - Get your project URL and anon key
   - Update `src/services/supabase.ts` with your credentials:
     ```typescript
     const supabaseUrl = "YOUR_SUPABASE_URL"
     const supabaseAnonKey = "YOUR_SUPABASE_ANON_KEY"
     ```

4. **Run the app**

   ```bash
   # For iOS
   npm run ios

   # For Android
   npm run android

   # For web
   npm run web
   ```

## 📱 App Structure

```
src/
├── components/          # Reusable UI components
│   ├── GradientBackground.tsx
│   └── Navigation.tsx
├── screens/             # Main app screens
│   ├── HomeScreen.tsx
│   ├── UploadScreen.tsx
│   ├── AnalysisScreen.tsx
│   ├── JournalScreen.tsx
│   └── ProfileScreen.tsx
├── context/             # State management
│   └── AppContext.tsx
├── services/            # External services
│   └── supabase.ts
├── types/               # TypeScript definitions
│   └── index.ts
└── utils/               # Helper functions
```

## 🎨 Key Features Explained

### Handwriting Analysis

- Users can take photos or upload images of their handwriting
- AI processes the handwriting to extract personality traits
- Results include scores for creativity, emotional intelligence, leadership, etc.

### Personality Dashboard

- Visual progress bars showing trait scores
- Overall personality score calculation
- Insights and interpretations based on analysis

### Journal System

- Daily mood tracking with percentage scores
- Text entries for thoughts and reflections
- Historical view of personal growth over time

### Achievement System

- Unlockable badges for milestones (first analysis, streaks, etc.)
- Visual feedback for user engagement
- Progress tracking for long-term goals

## 🔧 Customization

### Adding New Personality Traits

1. Update the `PersonalityTrait` interface in `src/types/index.ts`
2. Add the new trait to mock data in screens
3. Update analysis algorithms to include the new trait

### Modifying UI Colors

The app uses a consistent color scheme defined in the gradient backgrounds:

- Primary: Purple gradient (`#5B21B6` to `#3B82F6`)
- Accent: Pink (`#EC4899`)
- Success: Green (`#10B981`)
- Warning: Orange (`#F59E0B`)

### Adding New Features

1. Create new components in `src/components/`
2. Add new screens to `src/screens/`
3. Update navigation in `src/components/Navigation.tsx`
4. Add any new types to `src/types/index.ts`

## 📊 Database Schema (Supabase)

### Users Table

```sql
create table users (
  id uuid references auth.users primary key,
  email text unique not null,
  name text not null,
  avatar_url text,
  created_at timestamp with time zone default now(),
  total_analyses integer default 0,
  current_streak integer default 0,
  average_score integer default 0
);
```

### Analyses Table

```sql
create table analyses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) not null,
  image_url text not null,
  personality_traits jsonb not null,
  overall_score integer not null,
  analysis_text text,
  created_at timestamp with time zone default now()
);
```

### Journal Entries Table

```sql
create table journal_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) not null,
  content text not null,
  mood_score integer not null,
  created_at timestamp with time zone default now(),
  date text not null
);
```

## 🚀 Deployment

### Expo Build

```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android
```

### App Store Deployment

1. Configure app.json with proper bundle identifiers
2. Add app icons and splash screens
3. Build and submit through Expo or EAS Build
4. Follow platform-specific guidelines for review

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Expo team for the amazing development platform
- Supabase for the backend infrastructure
- React Navigation for smooth navigation experience
- The open-source community for various packages and inspiration

---

**VibeScript** - Discover your personality through the art of handwriting ✨
