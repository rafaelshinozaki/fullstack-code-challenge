# AI Development Quiz App

Educational quiz platform focused on AI development topics (agents, prompt engineering, model selection).

## Tech Stack

- Vite
- React + TypeScript
- Tailwind CSS v4
- React Router DOM
- React Context API
- localStorage persistence

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Build

```bash
npm run build
npm run preview
```

## App Routes

- `/` - Landing page (hero, CTA, features, optional user stats)
- `/quizzes` - Quiz categories grid with best score per category
- `/quiz/:id` - Quiz experience (submit, feedback, explanation, next/finish)
- `/results/:id` - Score summary + expandable answer review
- `/dashboard` - Attempts, average/best score, progress, recent activity
- `/profile` - Profile creation/view + reset local data

## Core Features

- Multi-category quiz dataset (3 categories, 5 questions each)
- Question shuffling per quiz run
- Immediate answer feedback and explanation toggle
- Progress tracking during quiz
- Attempt persistence with score history
- Best score and recent activity tracking
- Retake and review flow from results
- Responsive layout and page sections
- Loading, empty, and missing-data fallback states

## Persistence Model

`localStorage` keys:

- `quiz_app_user`: persisted `UserProfile` (username, createdAt, attempts)
- `quiz_app_session`: reserved for in-progress session support

Attempts include:

- quiz identity and title
- score, total, percentage
- question-level answer records
- completion timestamp

## Project Structure

```text
src/
  api/
    quizData.ts
  components/
    layout/
      AppLayout.tsx
  context/
    AppContext.tsx
  pages/
    HomePage.tsx
    QuizzesPage.tsx
    QuizPage.tsx
    ResultsPage.tsx
    DashboardPage.tsx
    ProfilePage.tsx
  router/
    AppRoutes.tsx
  types/
    index.ts
  utils/
    storage.ts
  App.tsx
  main.tsx
  index.css
```

## Notes

- Data source is a mock API module (`src/api/quizData.ts`) for easy migration to a real backend later.
- Profile reset clears all local quiz data from the browser.
