# AI Development Quiz App

Educational quiz platform built with React + TypeScript to practice AI development concepts like agent design, prompt engineering, and model selection.

## Tech Stack

- Vite
- React + TypeScript
- React Router DOM
- Tailwind CSS v4
- React Context API
- localStorage persistence

## Run Locally

### 1) Install dependencies

```bash
npm install
```

### 2) Start development server

```bash
npm run dev
```

Open `http://localhost:5173`.

### 3) Build for production

```bash
npm run build
```

### 4) Preview production build

```bash
npm run preview
```

### 5) Run tests

```bash
npm run test
```

### 6) Run coverage

```bash
npm run test:coverage
```

## Project Structure

```text
src/
  api/
    quizData.ts              # Mock async quiz API + seeded categories
  components/
    layout/
      AppLayout.tsx          # Shared navbar/footer layout
  context/
    AppContext.tsx           # Global state (user + attempts)
  pages/
    HomePage.tsx             # Landing page
    QuizzesPage.tsx          # Quiz selection grid
    QuizPage.tsx             # Quiz runtime flow
    ResultsPage.tsx          # Result summary + answer review
    DashboardPage.tsx        # Stats, progress, recent activity
    ProfilePage.tsx          # Create profile, profile stats, reset actions
    NotFoundPage.tsx         # 404 fallback
  types/
    index.ts                 # App interfaces and types
  utils/
    storage.ts               # localStorage helpers and guards
  App.tsx                    # Route map
  main.tsx                   # App bootstrap + providers
```

## Feature Summary

- **Landing page** with hero CTA, conditional stats, and feature cards.
- **Quiz selection** with loading skeletons, card grid, and best score badges.
- **Quiz experience**:
  - Load quiz by route id
  - Shuffle question order
  - Track selected/submitted answers
  - Learn mode toggle
  - Immediate correctness + explanation feedback
  - Progress indicator and submit/next/finish controls
- **Results page**:
  - Score and performance summary
  - Performance message and progress bar
  - Retake / review / back actions
  - Expandable answer review
  - Missing-state fallback handling
- **Dashboard**:
  - Total attempts, average score, best scores
  - Quiz progress (overall + per quiz)
  - Recent activity list
  - Loading and empty states
- **Profile**:
  - Create profile flow for logged-out users
  - Logged-in profile info and stats
  - Reset quiz data
  - Logout
- **Persistence**:
  - User and attempts are stored in `localStorage`
  - Runtime type guards prevent broken state usage

## Notes

- This challenge implementation uses a mock API layer (`src/api/quizData.ts`) with asynchronous behavior.
- New quiz categories can be added by editing the quiz data source without changing UI logic.
