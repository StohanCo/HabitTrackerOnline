# HabitTrackerOnline

A full-featured online habit and finance tracker built with React + TypeScript + Vite.

## Features

### Habits Page
- GitHub-style calendar year view of habit activity
- Each habit has: name, description, purpose, final goal, frequency (daily/weekly/monthly), and colour
- **Done habits**: full colour on the calendar
- **Planned habits**: same colour at 40% opacity (clearly shows what is scheduled)
- **Multi-habit days**: multiple colour stripes in one cell
- Add / edit / delete habits
- Persistent storage (localStorage)

### Finance Page
- Annual savings goal with progress bar
- **Savings Steps** — e.g. "Skip coffee ($5/day)": auto-populates the entire year as saved days; skipped days are marked grey and excluded from the total
- **Expense Categories** — e.g. Food, Rent: set a monthly budget; confirmed days are green, over-budget months turn red on the calendar
- Log expense per category/date
- Full finance calendar (savings + expenses merged into one GitHub-style view)
- Monthly expense summary table with budget vs actual

### Profile Page
- Name, avatar (URL or initials), email, bio
- Personal goals list (e.g. "Stay Fit", "Buy a House")

## Tech Stack
- **React 19** + **TypeScript**
- **Vite 7** (build tool)
- **Tailwind CSS v4** (styling)
- **React Router v7** (routing)
- **Zustand** (state management, persisted to localStorage)
- **date-fns** (date utilities)
- **lucide-react** (icons)

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
