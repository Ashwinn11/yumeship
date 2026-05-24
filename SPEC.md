# YumeShip — Screens & Features Spec

## What Is This App

YumeShip is a private scrapbook for **yumeshippers** — people who form personal emotional/romantic relationships with fictional characters. The fictional character is called an **F/O (Fictional Other)**. The user represents themselves via a **Self-Insert (S/I)** — either themselves directly or an OC.

This is a deeply private, personal practice. The app must feel like a safe, intimate journal — not a social network.

**Key community terms the app uses:**
- **F/O** — the fictional character you have a relationship with
- **S/I** — your self-insert character (you in their world)
- **Headcanons** — personal interpretations of how an F/O thinks/acts/feels with you
- **Sharing NG / Welcome / Mirror** — whether the user is open to "doubles" (others who ship the same character)
- **Polycule** — a group ship with multiple F/Os
- **Storyline** — chronological timeline of milestones in the relationship

---

## App Structure

**4 tabs:**
1. Home (Ships)
2. Templates
3. Upcoming (Anniversaries)
4. Settings

---

## Tab 1 — Home (Ships)

### 1.1 Home Screen
The main screen. Displays all the user's F/Os as a grid of cards.

**What it shows:**
- Cover image of the F/O (user-set)
- F/O name
- Fandom / source media
- Relationship type badge (Romantic / Platonic / Familial)
- Pin indicator for pinned ships
- Polycule indicator if this F/O belongs to one

**Actions available:**
- Tap a card → opens F/O Detail
- Long press → pin/unpin, delete
- Search bar at top to filter by name or fandom
- Sort options: newest, oldest, alphabetical, pinned first
- "+" button → Add New F/O

---

### 1.2 Add / Edit F/O Screen
A form to create or edit an F/O profile.

**Fields:**
- Cover photo (pick from library or camera)
- Name (text)
- Fandom / source media (text — e.g. "Genshin Impact", "Haikyuu!!")
- Relationship type (picker: Romantic / Platonic / Familial)
- Your nickname for them (optional — e.g. "my love", "big brother")
- Sharing preference (picker: Sharing NG / Sharing Welcome / Mirror-sharing)
- Tags (free-form chips — e.g. "comfort character", "main F/O", "childhood")
- Personal notes (multi-line text)
- Relationship start date (date picker — used for anniversary tracking)

---

### 1.3 F/O Detail Screen
The hub for one F/O. Uses a **tab bar** across the top with 7 tabs:

> Profile · Albums · Scenarios · Storyline · Messages · Outfits · Dates

---

#### Tab A — Profile
Full profile view for the F/O.

**Sections:**
- **Header** — large cover image, name, fandom, relationship type, sharing preference
- **About** — personal notes the user wrote
- **Headcanons** — list of personal headcanons grouped by category. Categories: Personality, Habits, Favorites, How We Met, In Their World, Random. Each headcanon is a short text entry. User can add, edit, reorder, delete.
- **Aesthetic Board** — a 3-column photo grid of vibe/mood images. User picks images from library. Not for photo albums (those are Tab B) — this is for aesthetic/mood reference (color palettes, vibes, fan art inspiration).
- **Playlist** — a list of songs that remind the user of this F/O. Each entry has: song title, artist (optional), personal note about why this song fits (optional). User manually enters song info — no streaming API needed.

---

#### Tab B — Albums
Photo storage organized into named albums.

**Album list view:**
- Grid of album cover thumbnails
- Album title + photo count
- "+" to create new album (enter a name)
- Long press album → rename, delete

**Inside an album:**
- Photo grid (3-column)
- Tap photo → full-screen viewer with caption
- "+" button → multi-select photo picker from library (up to 20 at a time)
- Long press photo → add/edit caption, delete

**Context:** Users save fan art, screenshots, edits, selfship aesthetics here. Albums are organized by the user (e.g. "Fan Art", "Date Outfits", "Canon Screenshots").

---

#### Tab C — Scenarios
A place to write short stories and imagined moments with the F/O.

**List view:**
- List of scenarios showing title + first line preview + date written
- "+" to create new
- Swipe to delete

**Scenario Editor:**
- Title field
- Large multi-line text body (the scenario/story)
- Date written (auto-set, editable)
- Word count shown

**Context:** Scenarios are short fan-fiction style pieces the user writes to themselves — imagined conversations, dates, moments. These are private and never shared from the app.

---

#### Tab D — Storyline
A chronological timeline of milestones and events in the relationship.

**Timeline view:**
- Vertical scrolling timeline sorted by date
- Each event shown as a card: emoji + title + date + short description
- "+" to add new event

**Event editor (sheet):**
- Emoji picker
- Title (e.g. "First meeting", "Confession", "One year anniversary")
- Date (date picker)
- Description (multi-line text)

**Context:** This is like a relationship journal timeline. Users log milestones: "The day I found my F/O", "First scenario written", "Our anniversary", "The day I imagined our first date."

---

#### Tab E — Messages
An iMessage-style chat interface where users write imagined conversations with their F/O.

**Thread list:**
- List of conversation threads, each with a name
- "+" to create a new thread (enter a thread title, e.g. "Good morning texts", "After the battle")
- Swipe to delete thread

**Inside a thread:**
- Chat bubble UI: user messages on the right, F/O messages on the left
- Text input bar at the bottom with send button
- Toggle to switch which side you're typing for (your message vs. F/O's message)
- Messages are stored permanently — this is a written log, not live AI chat

**Context:** Users write both sides of a conversation — they're the author of a private script. There is NO AI. The user types everything. This is a creative writing/journaling feature styled as a chat.

---

#### Tab F — Outfits
Save and organize outfit ideas or pairings with the F/O.

**Outfit grid:**
- 2-column grid of outfit cards
- Each card shows image thumbnail + outfit title + occasion tag
- "+" to add new outfit
- Tap to view detail / edit

**Outfit editor (sheet):**
- Photo (pick from library or leave blank)
- Title (e.g. "Summer date", "Matching pajamas", "Gala night")
- Occasion tag (picker: Casual / Date / Matching / Formal / Other)
- Notes (optional description)

**Context:** Users imagine what they and their F/O would wear together. Some users do this via mood boards (aesthetic board in Profile), others want a specific "outfit diary" with occasion context.

---

#### Tab G — Dates
Anniversary and special date tracker for this F/O.

**List view:**
- List of dates sorted by next upcoming occurrence
- Shows: title, original date, days until next occurrence
- Toggle for notification on/off per entry
- "+" to add new date

**Date editor (sheet):**
- Title (e.g. "Our anniversary", "Day I found them", "First scenario")
- Date (date picker)
- Repeat yearly (toggle)
- Notify me (toggle — schedules a local notification if enabled)

**Context:** Users want to be reminded of their ship anniversaries privately. All notifications are local (no server). Notification text is discreet and doesn't reveal the app's purpose on the lock screen.

---

## Tab 2 — Templates

A gallery of fill-in templates that produce a rendered card the user can screenshot/save.

### Template Browser
- Grid of template types with preview thumbnail
- 9 template types:

| Template | Purpose |
|----------|---------|
| **Meet My F/O** | Introduction profile: name, fandom, type, first impression, why I love them |
| **F/O Infodump** | Deep dive: personality, appearance, quirks, favorites, 5 headcanons |
| **This or That** | 10 preference pairs about the F/O (coffee/tea, morning/night, etc.) |
| **Headcanons List** | Category-grouped list of personal headcanons |
| **Selfship Q&A** | 10 classic community questions answered |
| **Valentine's** | Love letter + favorite memory + 5 things I love about them |
| **F/Ovember** | Gratitude list (November tradition in the community) |
| **Milestone** | Celebrate an anniversary: message + best memories + next chapter |
| **Polycule Intro** | Introduce a polycule: group name, members, dynamics, notes |

### Template Filler
- Selecting a template opens a form with all fields for that template
- User fills in each field (text inputs, multi-line areas)
- "Preview" button → renders as a styled card
- Rendered card can be saved to Photos library

### Template Result Card
- A rendered visual card with all filled content
- Designed to look like a scrapbook/journal page
- Save to Photos button

---

## Tab 3 — Upcoming (Anniversaries)

A global view of all upcoming dates across ALL F/Os.

**What it shows:**
- Chronological list of upcoming anniversary dates from all ships
- Each row: F/O name + date title + date + days until
- Tapping a row goes to that F/O's Dates tab
- Filter: show only next 30 days / all upcoming / all time

**Context:** Users may have many F/Os each with multiple dates. This gives a unified view so they never miss a ship anniversary.

---

## Tab 4 — Settings

### App Lock
- Toggle: Enable App Lock (Face ID / Touch ID / passcode fallback)
- When enabled: app shows a lock screen whenever it comes to foreground
- Lock timeout: immediately / after 1 min / after 5 min

### Notifications
- Master toggle: Allow notifications
- List of all scheduled notifications
- "Cancel all" option

### Data
- Storage used (approximate)
- Export all data (JSON — future feature, placeholder for now)
- Delete all data (with confirmation prompt)

### Premium (Placeholder)
- "YumeShip Pro" — cloud sync coming soon
- What Pro will include: sync across devices, cloud backup

### About
- App version
- Feedback link (mailto)

---

## Tech Stack

| Layer | Library | Purpose |
|-------|---------|---------|
| **Framework** | React Native + Expo SDK | Cross-platform (iOS + Android from one codebase) |
| **Navigation** | expo-router (file-based) | Tab + stack navigation, deep linking |
| **Local DB** | expo-sqlite + Drizzle ORM | Relational local storage — F/Os, albums, messages, etc. |
| **Image storage** | expo-file-system | Save photo files to app's document directory |
| **Image picker** | expo-image-picker | Pick from library or camera |
| **Notifications** | expo-notifications | Local push notifications for anniversaries |
| **App lock** | expo-local-authentication | Face ID / Touch ID / passcode fallback |
| **State** | Zustand | Lightweight global state (lock state, active F/O, etc.) |
| **Future sync** | Supabase or Firebase (premium) | Cloud backup / cross-device sync |

- Local-first — all data stays on device in SQLite
- No AI, no backend, no accounts, no social features in MVP
- Cross-platform: iOS primary target, Android compatible by default with Expo
