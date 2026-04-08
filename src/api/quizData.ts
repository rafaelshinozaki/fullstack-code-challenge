import type { Quiz } from '../types'

const QUIZ_DATA: Quiz[] = [
  {
    id: 'agent-fundamentals',
    title: 'Agent Fundamentals',
    description: 'Test your knowledge of AI agent design and implementation',
    questions: [
      {
        id: 1,
        question: 'What is the primary purpose of an AI agent?',
        options: [
          'To replace human workers',
          'To autonomously perform tasks and make decisions',
          'To store large amounts of data',
          'To create visual interfaces',
        ],
        correctAnswer: 1,
        explanation:
          'AI agents are designed to autonomously perform tasks and make decisions based on their environment and goals.',
      },
      {
        id: 2,
        question: 'Which component is essential for an AI agent to learn from experience?',
        options: [
          'A graphical user interface',
          'A feedback mechanism',
          'A database connection',
          'A payment processor',
        ],
        correctAnswer: 1,
        explanation:
          'A feedback mechanism allows agents to learn from their actions and improve over time.',
      },
      {
        id: 3,
        question: "What is 'context window' in relation to AI models?",
        options: [
          'The browser window where AI runs',
          'The maximum amount of text a model can process at once',
          'The time period for model training',
          'The user interface for model configuration',
        ],
        correctAnswer: 1,
        explanation:
          'The context window defines how much information an AI model can consider in a single interaction.',
      },
      {
        id: 4,
        question: 'Which strategy helps manage limited context windows?',
        options: [
          'Adding more servers',
          'Using larger fonts',
          'Summarization and chunking',
          'Increasing screen resolution',
        ],
        correctAnswer: 2,
        explanation:
          'Summarization and chunking help fit relevant information within context limits.',
      },
      {
        id: 5,
        question: "What is 'prompt engineering'?",
        options: [
          'Building physical AI hardware',
          'Designing effective instructions for AI models',
          'Creating user interfaces',
          'Managing cloud infrastructure',
        ],
        correctAnswer: 1,
        explanation:
          'Prompt engineering is the practice of designing and optimizing inputs to get desired outputs from AI models.',
      },
    ],
  },
  {
    id: 'prompt-engineering',
    title: 'Prompt Engineering',
    description: 'Practice writing robust prompts and guardrails for LLM apps',
    questions: [
      {
        id: 1,
        question: 'Which prompt pattern best reduces hallucinations in factual tasks?',
        options: [
          'Ask for confident answers only',
          'Request chain-of-thought in final output',
          'Ask the model to cite allowed sources and say when unknown',
          'Increase temperature to 1.0',
        ],
        correctAnswer: 2,
        explanation:
          'Grounding responses in allowed sources and handling uncertainty explicitly reduces unsupported claims.',
      },
      {
        id: 2,
        question: 'What is the main benefit of giving the model role and task constraints?',
        options: [
          'Lower API cost automatically',
          'More predictable structure and behavior',
          'Guaranteed correctness',
          'No need for testing',
        ],
        correctAnswer: 1,
        explanation:
          'Explicit role and constraints improve consistency and reduce ambiguous outputs.',
      },
      {
        id: 3,
        question: 'When should you prefer few-shot prompting?',
        options: [
          'When output format matters and examples clarify expectations',
          'When model context is full',
          'Only for image generation',
          'Never, because examples bias the model',
        ],
        correctAnswer: 0,
        explanation:
          'Few-shot examples are useful when style, structure, or transformation behavior must be demonstrated.',
      },
      {
        id: 4,
        question: 'Which is the strongest delimiter strategy for mixed user content?',
        options: [
          'No delimiters to keep prompts short',
          'Use clear section markers and quoted blocks',
          'Use only emojis to separate parts',
          'Put everything in one paragraph',
        ],
        correctAnswer: 1,
        explanation:
          'Clear boundaries between instructions and user data reduce prompt injection risk and parsing errors.',
      },
      {
        id: 5,
        question: 'What should happen after prompt changes are deployed?',
        options: [
          'Assume quality is improved',
          'Run regression evaluations on key scenarios',
          'Delete old prompts immediately',
          'Disable logging',
        ],
        correctAnswer: 1,
        explanation:
          'Prompt updates can create regressions, so evaluation against representative test cases is essential.',
      },
    ],
  },
  {
    id: 'model-selection',
    title: 'Model Selection',
    description: 'Choose the right model for quality, speed, and cost trade-offs',
    questions: [
      {
        id: 1,
        question: 'Which factor is most important for real-time chat UX?',
        options: ['Token latency', 'Model logo', 'Parameter count only', 'Training dataset size'],
        correctAnswer: 0,
        explanation:
          'Fast first-token and steady token throughput are critical for responsive interactive experiences.',
      },
      {
        id: 2,
        question: 'Why might a smaller model be preferred in production?',
        options: [
          'It always has better reasoning',
          'Lower cost and faster response for simple tasks',
          'It never requires monitoring',
          'It supports every modality automatically',
        ],
        correctAnswer: 1,
        explanation:
          'Smaller models are often sufficient for narrow tasks and can significantly improve latency and cost.',
      },
      {
        id: 3,
        question: 'What is a practical approach for model routing?',
        options: [
          'Use one model for every request',
          'Route by task complexity and fallback on failure',
          'Always route to the most expensive model',
          'Randomly choose a model each time',
        ],
        correctAnswer: 1,
        explanation:
          'Adaptive routing lets teams optimize quality and spend while maintaining reliability.',
      },
      {
        id: 4,
        question: 'Which metric best captures cost efficiency?',
        options: ['Prompt length only', 'Cost per successful task outcome', 'GPU memory usage only', 'Uptime only'],
        correctAnswer: 1,
        explanation:
          'Business value comes from successful outcomes, so evaluate cost relative to task success quality.',
      },
      {
        id: 5,
        question: 'Before switching models, what should teams do first?',
        options: [
          'Change prompts and architecture simultaneously',
          'Run side-by-side evaluation on the same benchmark set',
          'Disable guardrails',
          'Ignore previous telemetry',
        ],
        correctAnswer: 1,
        explanation:
          'Controlled A/B evaluation with stable prompts and datasets gives trustworthy comparisons.',
      },
    ],
  },
]

const API_DELAY_MS = 200

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export async function fetchQuizzes(): Promise<Quiz[]> {
  await delay(API_DELAY_MS)
  return structuredClone(QUIZ_DATA)
}

export async function fetchQuizById(quizId: string): Promise<Quiz | null> {
  await delay(API_DELAY_MS)
  const quiz = QUIZ_DATA.find((item) => item.id === quizId)
  return quiz ? structuredClone(quiz) : null
}
