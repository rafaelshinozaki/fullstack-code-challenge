# AI Dev Quiz

An educational quiz application for testing and reinforcing knowledge of AI software development concepts — agents, prompt engineering, model selection, and more.

---

## Features

- **Three quiz categories** — Agent Fundamentals, Prompt Engineering, Model Selection (5 questions each)
- **Randomised question order** for replayability on every attempt
- **Learn Mode** — shows the explanation as a hint before answering
- **Instant feedback** — correct/incorrect highlighting + explanation after each submission
- **Persistent progress** — profile and all attempts stored in `localStorage`
- **Dashboard** — tracks attempt history, average score, best scores, and recent activity
- **Responsive layout** — mobile (375 px), tablet (768 px), and desktop (1024 px+)
- **Accessible** — semantic HTML, ARIA roles/labels, keyboard-navigable

---

## Tech Stack

| Layer | Technology |
|---|---|
| Build | [Vite 6](https://vitejs.dev/) |
| UI | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/vite`) |
| Routing | [React Router DOM v7](https://reactrouter.com/) |
| State | React Context API + `useReducer` |
| Persistence | Browser `localStorage` |
| Testing | [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/) + jsdom |
| Font | [Inter](https://fonts.google.com/specimen/Inter) (Google Fonts) |

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm 9 or later

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
```

Output is written to `dist/`. Preview the production build with:

```bash
npm run preview
```

---

## Running Tests

```bash
# Run all tests (watch mode)
npm test

# Single run with verbose output
npx vitest run --reporter=verbose

# Coverage report (HTML + terminal)
npm run test:coverage
```

Coverage output is written to `coverage/`.

---

## Project Structure

```
quiz-app-front/
├── public/                     # Static assets
├── src/
│   ├── api/
│   │   ├── quizData.ts         # Mock API — fetchQuizzes(), fetchQuizById()
│   │   └── __tests__/
│   │       └── quizData.test.ts
│   ├── components/
│   │   └── layout/
│   │       └── Layout.tsx      # Sticky navbar + footer shell
│   ├── context/
│   │   └── AppContext.tsx      # Global state (profile, attempts) + useApp() hook
│   ├── pages/
│   │   ├── Home/               # Landing page — hero, stats, quiz cards
│   │   ├── QuizSelect/         # Browse and pick a quiz
│   │   ├── Quiz/               # Interactive quiz experience
│   │   ├── Results/            # Score card + answer review
│   │   ├── Dashboard/          # Progress overview and recent activity
│   │   ├── Profile/            # Create or manage user profile
│   │   └── NotFound/           # 404 fallback
│   │       └── __tests__/      # Component tests (per page)
│   ├── test/
│   │   ├── fixtures.ts         # Shared mock data + makeAppContext() factory
│   │   ├── setup.ts            # Jest-DOM matchers + localStorage reset
│   │   └── helpers/
│   │       └── renderWithProviders.tsx  # renderInRouter / renderAtRoute
│   ├── types/
│   │   └── index.ts            # All TypeScript interfaces (Quiz, Question, etc.)
│   ├── utils/
│   │   ├── categoryMeta.ts     # Emoji + colour tokens per quiz category
│   │   ├── scoring.ts          # calculateScore, getFeedbackLabel, getFeedbackClasses
│   │   ├── storage.ts          # localStorage helpers (getUser, saveAttempt, …)
│   │   └── __tests__/
│   │       └── storage.test.ts
│   ├── App.tsx                 # Route definitions
│   ├── main.tsx                # App entry point
│   └── index.css               # Tailwind + custom @theme tokens
├── index.html
├── vite.config.ts
├── vitest.config.ts
├── tsconfig.app.json
└── package.json
```

---

## Data Model

```ts
interface Quiz {
  id: string
  title: string
  description: string
  category: string
  questions: Question[]
}

interface Question {
  id: string
  text: string
  options: string[]
  correctAnswer: number   // index into options[]
  explanation: string
}

interface QuizAttempt {
  id: string
  quizId: string
  quizTitle: string
  category: string
  score: number           // percentage 0–100
  correctAnswers: number
  totalQuestions: number
  feedback: FeedbackLabel
  answers: UserAnswer[]
  completedAt: string     // ISO 8601
}

interface UserProfile {
  username: string
  createdAt: string       // ISO 8601
}
```

---

## Environment Notes

- No backend required — all data lives in `localStorage` under the key `quiz_app_store`.
- The mock API simulates a ~300 ms network delay to exercise loading states.
- `clearAllData()` (in `src/utils/storage.ts`) wipes the store; a "Reset Profile" button on the Profile page exposes this in the UI.
