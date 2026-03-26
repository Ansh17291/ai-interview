import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";
import { type } from "os";
import { z } from "zod";

export const mappings = {
  "react.js": "react",
  reactjs: "react",
  react: "react",
  "next.js": "nextjs",
  nextjs: "nextjs",
  next: "nextjs",
  "vue.js": "vuejs",
  vuejs: "vuejs",
  vue: "vuejs",
  "express.js": "express",
  expressjs: "express",
  express: "express",
  "node.js": "nodejs",
  nodejs: "nodejs",
  node: "nodejs",
  mongodb: "mongodb",
  mongo: "mongodb",
  mongoose: "mongoose",
  mysql: "mysql",
  postgresql: "postgresql",
  sqlite: "sqlite",
  firebase: "firebase",
  docker: "docker",
  kubernetes: "kubernetes",
  aws: "aws",
  azure: "azure",
  gcp: "gcp",
  digitalocean: "digitalocean",
  heroku: "heroku",
  photoshop: "photoshop",
  "adobe photoshop": "photoshop",
  html5: "html5",
  html: "html5",
  css3: "css3",
  css: "css3",
  sass: "sass",
  scss: "sass",
  less: "less",
  tailwindcss: "tailwindcss",
  tailwind: "tailwindcss",
  bootstrap: "bootstrap",
  jquery: "jquery",
  typescript: "typescript",
  ts: "typescript",
  javascript: "javascript",
  js: "javascript",
  "angular.js": "angular",
  angularjs: "angular",
  angular: "angular",
  "ember.js": "ember",
  emberjs: "ember",
  ember: "ember",
  "backbone.js": "backbone",
  backbonejs: "backbone",
  backbone: "backbone",
  nestjs: "nestjs",
  graphql: "graphql",
  "graph ql": "graphql",
  apollo: "apollo",
  webpack: "webpack",
  babel: "babel",
  "rollup.js": "rollup",
  rollupjs: "rollup",
  rollup: "rollup",
  "parcel.js": "parcel",
  parceljs: "parcel",
  npm: "npm",
  yarn: "yarn",
  git: "git",
  github: "github",
  gitlab: "gitlab",
  bitbucket: "bitbucket",
  figma: "figma",
  prisma: "prisma",
  redux: "redux",
  flux: "flux",
  redis: "redis",
  selenium: "selenium",
  cypress: "cypress",
  jest: "jest",
  mocha: "mocha",
  chai: "chai",
  karma: "karma",
  vuex: "vuex",
  "nuxt.js": "nuxt",
  nuxtjs: "nuxt",
  nuxt: "nuxt",
  strapi: "strapi",
  wordpress: "wordpress",
  contentful: "contentful",
  netlify: "netlify",
  vercel: "vercel",
  "aws amplify": "amplify",
};
export const interviewMetadataSchema = z.object({
  role: z.string(),
  level: z.string(),
  type: z.string(),
  techStack: z.array(z.string()),
  numQuestions: z.number(),
  score: z.number().min(0).max(100),
  summary: z.string(),
});

export const interviewer: CreateAssistantDTO = {
  name: "Interviewer",
  firstMessage:
    "Hello! Thank you for taking the time to speak with me today. I'm excited to learn more about you and your experience.",
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "en",
  },
  voice: {
    provider: "11labs",
    voiceId: "sarah",
    stability: 0.4,
    similarityBoost: 0.8,
    speed: 0.9,
    style: 0.5,
    useSpeakerBoost: true,
  },
  model: {
    provider: "openai",
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are a professional job interviewer conducting a real-time voice interview with a candidate for a {{level}} {{role}} role. The focus of this technical interview is on his tech stack: {{techstack}}. Your goal is to assess their qualifications, motivation, and fit for the role.
- You are currently interviewing for the {{role}} position.

Interview Guidelines:
Follow the structured question flow:
{{questions}}

Engage naturally & react appropriately:
Listen actively to responses and acknowledge them before moving forward.
Ask brief follow-up questions if a response is vague or requires more detail.
Keep the conversation flowing smoothly while maintaining control.
Be professional, yet warm and welcoming:

Use official yet friendly language.
Keep responses concise and to the point (like in a real voice interview).
Avoid robotic phrasing—sound natural and conversational.
Answer the candidate’s questions professionally:

If asked about the role, company, or expectations, provide a clear and relevant answer.
If unsure, redirect the candidate to HR for more details.

Conclude the interview properly:
Thank the candidate for their time.
Inform them that the company will reach out soon with feedback.
End the conversation on a polite and positive note.


- Be sure to be professional and polite.
- Keep all your responses short and simple. Use official language, but be kind and welcoming.
- This is a voice conversation, so keep your responses short, like in a real conversation. Don't ramble for too long.`,
      },
    ],
  },
};

export const feedbackSchema = z.object({
  totalScore: z.number().min(0).max(100),
  categoryScores: z.array(
    z.object({
      name: z.enum([
        "Communication Skills",
        "Technical Knowledge",
        "Problem Solving",
        "Cultural Fit",
        "Confidence and Clarity",
      ]),
      score: z.number().min(0).max(100),
      comment: z.string(),
    })
  ).length(5),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  keyPoints: z.array(z.string()),
  finalAssessment: z.string(),
  recommendation: z.enum(["Strong Hire", "Hire", "Leaning Hire", "Leaning No Hire", "No Hire"]),
  technicalDepth: z.number().min(0).max(100),
  behavioralTraits: z.array(z.string()),
});

export const quizSchema = z.object({
  title: z.string(),
  questions: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()).length(4),
      correctAnswer: z.number().min(0).max(3),
    })
  ),
});

export const interviewCovers = [
  "/adobe.png",
  "/amazon.png",
  "/facebook.png",
  "/hostinger.png",
  "/pinterest.png",
  "/quora.png",
  "/reddit.png",
  "/skype.png",
  "/spotify.png",
  "/telegram.png",
  "/tiktok.png",
  "/yahoo.png",
];

export const SAMPLE_QUIZZES: Partial<Quiz>[] = [
  {
    id: "amazon-sample",
    title: "Amazon SDE Mock Quiz",
    role: "Software Development Engineer",
    level: "Mid-Level",
    company: "Amazon",
    techstack: ["Java", "Distributed Systems", "AWS"],
    questions: [
      {
        question: "Which of the following is an Amazon Leadership Principle?",
        options: [
          "Move Fast and Break Things",
          "Customer Obsession",
          "Don't Be Evil",
          "Connect the World"
        ],
        correctAnswer: 1
      },
      {
        question: "What AWS service is best suited for decoupled, highly scalable message queuing?",
        options: [
          "Amazon SQS",
          "Amazon SNS",
          "Amazon RDS",
          "AWS Lambda"
        ],
        correctAnswer: 0
      }
    ]
  },
  {
    id: "microsoft-sample",
    title: "Microsoft Azure Developer Quiz",
    role: "Cloud Developer",
    level: "Senior",
    company: "Microsoft",
    techstack: ["C#", ".NET", "Azure"],
    questions: [
      {
        question: "Which service is used for serverless computing in Microsoft Azure?",
        options: [
          "Azure Functions",
          "Azure Virtual Machines",
          "Azure App Service",
          "Azure SQL Database"
        ],
        correctAnswer: 0
      }
    ]
  },
  {
    id: "google-sample",
    title: "Google Software Engineer Quiz",
    role: "Software Engineer",
    level: "Mid-Level",
    company: "Google",
    techstack: ["C++", "Python", "GCP", "Algorithms"],
    questions: [
      {
        question: "Which distributed storage system was created by Google to handle structured data?",
        options: [
          "HDFS",
          "Bigtable",
          "DynamoDB",
          "Cassandra"
        ],
        correctAnswer: 1
      },
      {
        question: "Which algorithmic technique is commonly used to find the shortest path in a weighted graph without negative weights?",
        options: [
          "Bellman-Ford",
          "Depth First Search",
          "Dijkstra's Algorithm",
          "Floyd-Warshall"
        ],
        correctAnswer: 2
      }
    ]
  },
  {
    id: "meta-sample",
    title: "Meta Frontend Engineer Quiz",
    role: "Frontend Engineer",
    level: "Senior",
    company: "Meta",
    techstack: ["React", "JavaScript", "GraphQL"],
    questions: [
      {
        question: "How does React internally track elements across re-renders for list mapping?",
        options: [
          "DOM traversing",
          "State referencing",
          "Using the 'key' attribute",
          "Index polling"
        ],
        correctAnswer: 2
      }
    ]
  },
  {
    id: "apple-sample",
    title: "Apple iOS Engineer Quiz",
    role: "iOS Engineer",
    level: "Mid-Level",
    company: "Apple",
    techstack: ["Swift", "Objective-C", "iOS SDK"],
    questions: [
      {
        question: "Which memory management model does Swift primarily use?",
        options: [
          "Garbage Collection",
          "Manual Memory Management",
          "Automatic Reference Counting (ARC)",
          "RAII"
        ],
        correctAnswer: 2
      }
    ]
  }
];

export const dummyInterviews: Interview[] = [
  {
    id: "quick-frontend",
    userId: "system",
    role: "Frontend Developer",
    type: "Technical",
    techstack: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    level: "Mid-Level",
    questions: [
      "Explain the Virtual DOM and how React reconciliation works.",
      "How do you manage state in a large-scale React application?",
      "Can you describe a challenging bug you fixed related to Next.js SSR?"
    ],
    finalized: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "quick-backend",
    userId: "system",
    role: "Backend Developer",
    type: "Technical",
    techstack: ["Node.js", "Express", "PostgreSQL", "Redis"],
    level: "Mid-Level",
    questions: [
      "How does the Node.js event loop work?",
      "Describe a strategy for caching API responses using Redis.",
      "Explain indexing in PostgreSQL and how it improves query performance."
    ],
    finalized: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "quick-devops",
    userId: "system",
    role: "DevOps Engineer",
    type: "Technical",
    techstack: ["Docker", "Kubernetes", "AWS", "CI/CD"],
    level: "Senior",
    questions: [
      "Explain the difference between a virtual machine and a container.",
      "How do you manage secrets in a Kubernetes cluster?",
      "Walk me through a zero-downtime deployment pipeline."
    ],
    finalized: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "quick-pm",
    userId: "system",
    role: "Product Manager",
    type: "Behavioral",
    techstack: ["Agile", "Scrum", "Jira"],
    level: "Mid-Level",
    questions: [
      "Tell me about a time you had to pivot a product roadmap.",
      "How do you handle stakeholders with conflicting priorities?",
      "Describe a successful product launch you led."
    ],
    finalized: false,
    createdAt: new Date().toISOString(),
  },

  // 👇 Keep ONE user-specific example from your side
  {
    id: "user-1",
    userId: "user1",
    role: "Frontend Developer",
    type: "Technical",
    techstack: ["React"],
    level: "Junior",
    questions: ["What is React?"],
    finalized: false,
    createdAt: "2024-03-15T10:00:00Z",
  }
];