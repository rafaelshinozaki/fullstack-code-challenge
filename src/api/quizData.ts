import type { Quiz, QuizCategory } from '../types'

// ─── Quiz Data ────────────────────────────────────────────────────────────────

const agentFundamentals: Quiz = {
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
      explanation: 'Summarization and chunking help fit relevant information within context limits.',
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
}

const promptEngineering: Quiz = {
  id: 'prompt-engineering',
  title: 'Prompt Engineering',
  description: 'Master the art of crafting effective prompts for large language models',
  questions: [
    {
      id: 1,
      question: 'Which prompting technique asks the model to reason step-by-step before answering?',
      options: [
        'Zero-shot prompting',
        'Few-shot prompting',
        'Chain-of-thought prompting',
        'Instruction tuning',
      ],
      correctAnswer: 2,
      explanation:
        "Chain-of-thought prompting encourages the model to show its reasoning process, which improves accuracy on complex tasks — often triggered with phrases like 'Let's think step by step.'",
    },
    {
      id: 2,
      question: "What does 'temperature' control in a language model's output?",
      options: [
        'The speed of token generation',
        'The randomness and creativity of the response',
        'The maximum length of the output',
        'The language the model responds in',
      ],
      correctAnswer: 1,
      explanation:
        'Temperature scales the probability distribution over next tokens. A higher value (e.g. 1.0+) produces more varied and creative output; a lower value (e.g. 0.1) makes output more deterministic.',
    },
    {
      id: 3,
      question: 'Few-shot prompting works by:',
      options: [
        'Fine-tuning the model on a small dataset',
        'Reducing the model size to save memory',
        'Providing example input-output pairs inside the prompt',
        'Limiting the number of tokens in the response',
      ],
      correctAnswer: 2,
      explanation:
        'Few-shot prompting includes concrete examples of the desired task directly in the prompt, guiding the model without any weight updates.',
    },
    {
      id: 4,
      question: 'Which of the following is a risk of overly verbose system prompts?',
      options: [
        'Faster response times',
        'Reduced context available for the conversation',
        'More accurate outputs',
        'Lower API costs',
      ],
      correctAnswer: 1,
      explanation:
        'Every token in the system prompt consumes part of the context window, leaving less space for the conversation history and potentially truncating important information.',
    },
    {
      id: 5,
      question: "What is a 'hallucination' in the context of LLMs?",
      options: [
        'A visual artifact in image generation',
        'When the model refuses to answer a question',
        'Confident generation of factually incorrect or fabricated information',
        'An unusually slow inference response',
      ],
      correctAnswer: 2,
      explanation:
        "Hallucination refers to the model producing plausible-sounding but incorrect or entirely fabricated content — a key reliability challenge in production AI systems.",
    },
  ],
}

const modelSelection: Quiz = {
  id: 'model-selection',
  title: 'Model Selection',
  description: 'Learn how to choose the right AI model for any task or deployment scenario',
  questions: [
    {
      id: 1,
      question:
        'Which factor is MOST important when choosing between a large and a small language model for a production feature?',
      options: [
        'The model release date',
        'The model logo and branding',
        'Latency, cost, and accuracy trade-offs for the specific task',
        'The number of parameters published in the paper',
      ],
      correctAnswer: 2,
      explanation:
        'Production decisions should weigh latency requirements, per-token cost, and task-specific accuracy. A smaller, faster model often outperforms a larger one on a narrow, well-defined task.',
    },
    {
      id: 2,
      question: "What is 'fine-tuning' a language model?",
      options: [
        'Running the model on specialised hardware',
        'Adjusting model weights on a task-specific dataset after pre-training',
        'Writing a detailed system prompt',
        'Compressing the model to reduce file size',
      ],
      correctAnswer: 1,
      explanation:
        'Fine-tuning continues training the model on curated, domain-specific data to improve performance on a target task while retaining general knowledge from pre-training.',
    },
    {
      id: 3,
      question: 'Retrieval-Augmented Generation (RAG) is primarily used to:',
      options: [
        'Speed up model inference',
        'Generate synthetic training data',
        'Reduce model parameter count',
        'Ground model responses in up-to-date external knowledge',
      ],
      correctAnswer: 3,
      explanation:
        'RAG retrieves relevant documents at inference time and injects them into the prompt, allowing the model to answer questions about information beyond its training cut-off.',
    },
    {
      id: 4,
      question: 'Which metric best measures a text classification model\'s performance when classes are imbalanced?',
      options: [
        'Accuracy',
        'F1 Score',
        'Parameter count',
        'Token throughput',
      ],
      correctAnswer: 1,
      explanation:
        'F1 score balances precision and recall, making it a better metric than raw accuracy when one class dominates the dataset.',
    },
    {
      id: 5,
      question: 'Quantisation of a language model primarily achieves:',
      options: [
        'Improved factual accuracy',
        'Larger context window support',
        'Reduced memory footprint and faster inference at the cost of minor accuracy loss',
        'Automatic fine-tuning on user data',
      ],
      correctAnswer: 2,
      explanation:
        'Quantisation reduces numerical precision of weights (e.g. from float32 to int8), significantly cutting VRAM usage and increasing throughput, usually with minimal impact on output quality.',
    },
  ],
}

// ─── Registry ─────────────────────────────────────────────────────────────────

const quizRegistry: Quiz[] = [agentFundamentals, promptEngineering, modelSelection]

export const categories: QuizCategory[] = quizRegistry.map((quiz) => ({
  id: quiz.id,
  title: quiz.title,
  description: quiz.description,
  questionCount: quiz.questions.length,
  available: true,
  colorKey:
    quiz.id === 'agent-fundamentals'
      ? 'primary'
      : quiz.id === 'prompt-engineering'
        ? 'success'
        : 'warning',
}))

// ─── Simulated async API ───────────────────────────────────────────────────────

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchQuizzes(): Promise<Quiz[]> {
  await delay(120)
  return quizRegistry
}

export async function fetchQuizById(id: string): Promise<Quiz> {
  await delay(80)
  const quiz = quizRegistry.find((q) => q.id === id)
  if (!quiz) throw new Error(`Quiz not found: "${id}"`)
  return quiz
}

export async function fetchCategories(): Promise<QuizCategory[]> {
  await delay(80)
  return categories
}
