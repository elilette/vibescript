# Supabase Usage Guide

## Setup Complete ✅

Your Supabase integration is now properly set up! Here's how to use it:

## Configuration

- ✅ Supabase CLI installed and linked to cloud project
- ✅ Environment variables configured (make sure your `.env` file has the correct values)
- ✅ TypeScript types generated from your database schema

## How to Use Supabase (The Right Way)

### 1. Database Operations

```typescript
import { supabase } from "../services/supabase"

// Create a new record
const { data, error } = await supabase
  .from("your_table")
  .insert({ column1: "value1", column2: "value2" })

// Read data
const { data, error } = await supabase
  .from("your_table")
  .select("*")
  .eq("id", 123)

// Update a record
const { data, error } = await supabase
  .from("your_table")
  .update({ column1: "new_value" })
  .eq("id", 123)

// Delete a record
const { error } = await supabase.from("your_table").delete().eq("id", 123)
```

### 2. Authentication

```typescript
import { authService } from "../services/auth"

// Sign up
const { data, error } = await authService.signUp(
  "email@example.com",
  "password"
)

// Sign in
const { data, error } = await authService.signIn(
  "email@example.com",
  "password"
)

// Sign out
await authService.signOut()

// Get current user
const { user } = await authService.getCurrentUser()

// Listen to auth changes
authService.onAuthStateChange((event, session) => {
  console.log("Auth event:", event, session)
})
```

### 3. Storage (File Uploads)

```typescript
import { supabase } from "../services/supabase"

// Upload a file
const { data, error } = await supabase.storage
  .from("bucket-name")
  .upload("path/to/file.jpg", file)

// Download a file
const { data, error } = await supabase.storage
  .from("bucket-name")
  .download("path/to/file.jpg")

// Get public URL
const { data } = supabase.storage
  .from("bucket-name")
  .getPublicUrl("path/to/file.jpg")
```

### 4. Real-time Subscriptions

```typescript
import { supabase } from "../services/supabase"

// Subscribe to changes
const subscription = supabase
  .channel("custom-all-channel")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "your_table" },
    (payload) => {
      console.log("Change received!", payload)
    }
  )
  .subscribe()

// Unsubscribe when component unmounts
subscription.unsubscribe()
```

## Next Steps

1. **Create your database schema** in the Supabase Dashboard
2. **Update your types** by running: `supabase gen types typescript --linked > src/types/database.ts`
3. **Create storage buckets** for file uploads in the Dashboard
4. **Set up Row Level Security (RLS)** policies for your tables
5. **Configure authentication providers** if needed (Google, GitHub, etc.)

## Best Practices

- ✅ Always check for errors in your responses
- ✅ Use TypeScript types for better development experience
- ✅ Keep your API keys in environment variables
- ✅ Use Row Level Security for data protection
- ✅ Create specific service files for different features (auth, posts, etc.)
- ❌ Don't create generic wrapper functions around Supabase
- ❌ Never commit secrets to your repository

## Useful Commands

```bash
# Generate types from your database
supabase gen types typescript --linked > src/types/database.ts

# Pull schema changes from cloud
supabase db pull

# Reset local database (if using local development)
supabase db reset

# View logs
supabase logs
```
