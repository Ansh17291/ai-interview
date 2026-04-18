export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Quiz {
  id: string;
  title: string;
  role: string;
  level: string;
  company?: string;
  questions: QuizQuestion[];
  techstack: string[];
  createdAt: string;
  userId: string;
}

export interface QuizResult {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  userAnswers: (number | null)[];
  createdAt: string;
}

export interface SaveQuizResultParams {
  quizId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  userAnswers: (number | null)[];
}
export interface Feedback {
  id: string;
  userId: string;
  interviewId: string;
  totalScore: number;
  categoryScores: Array<{
    name: string;
    score: number;
    comment: string;
  }>;
  strengths: string[];
  areasForImprovement: string[];
  keyPoints: string[];
  transcript: { role: string; content: string }[];
  finalAssessment: string;
  recommendation: string;
  technicalDepth: number;
  behavioralTraits: string[];
  emotionalIntelligence: number;
  stressManagement: number;
  learningAgility: number;
  fillerWords: {
    um: number;
    uh: number;
    like: number;
    total: number;
  };
  speakingPace: "Slow" | "Moderate" | "Fast" | "Irregular";
  sentimentTrend: number[];
  createdAt: string;
}

export interface Interview {
  id: string;
  role: string;
  level: string;
  questions: string[];
  techstack: string[];
  createdAt: string;
  userId: string;
  type: string;
  finalized: boolean;
  transcript?: { role: string; content: string }[];
  keyPoints?: string[];
  numQuestions?: number;
  score?: number;
  summary?: string;
}

export interface CreateFeedbackParams {
  interviewId: string;
  userId: string;
  transcript: { role: string; content: string }[];
  feedbackId?: string;
}

export interface User {
  name: string;
  email: string;
  id: string;
  role?: "user" | "mentor";
  isPremium?: boolean;
  premiumExpiresAt?: string;
  subscriptionId?: string;
  paymentId?: string;
}

export interface MentorBooking {
  id: string;
  mentorId: number;
  mentorName: string;
  userId: string;
  userName: string;
  date: string;
  topic: string;
  status: "Scheduled" | "InProgress" | "Completed";
  room: string;
  mentorMessage?: string;
  createdAt: string;
}

export interface InterviewCardProps {
  interviewId?: string;
  userId?: string;
  role: string;
  level: string;
  type: string;
  techstack: string[];
  createdAt?: string;
  questionsCount?: number;
  score?: number;
  summary?: string;
}

export interface AgentProps {
  userName: string;
  userId?: string;
  interviewId?: string;
  feedbackId?: string;
  type: "generate" | "interview";
  questions?: string[];
}

export interface RouteParams {
  params: { [key: string]: string | string[] | undefined };
  searchParams: { [key: string]: string | string[] | undefined };
}

export interface GetFeedbackByInterviewIdParams {
  interviewId: string;
  userId: string;
}

export interface GetLatestInterviewsParams {
  userId: string;
  limit?: number;
}

export interface SignInParams {
  email: string;
  idToken: string;
}

export interface SignUpParams {
  uid: string;
  name: string;
  email: string;
  password?: string;
  role?: "user" | "mentor";
}

type FormType = "sign-in" | "sign-up";

export interface InterviewFormProps {
  interviewId: string;
  role: string;
  level: string;
  type: string;
  techstack: string[];
  amount: number;
}

export interface TechIconProps {
  techStack: string[];
}

// Resume Builder Types
export interface ResumeExperience {
  id: string;
  companyName: string;
  position: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  description: string;
}

export interface ResumeEducation {
  id: string;
  institution: string;
  degree: string;
  field: string;
  graduationDate: string;
  gpa?: string;
}

export interface Resume {
  id: string;
  userId: string;
  title: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedIn?: string;
    portfolio?: string;
  };
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: string[];
  certifications: string[];
  atsScore?: {
    score: number;
    feedback: string;
    missingKeywords?: string[];
  };
  jobDescriptionScore?: {
    score: number;
    matchedKeywords: string[];
    missingKeywords: string[];
  };
  createdAt: string;
  updatedAt: string;
  insights?: {
    score: number;
    strengths: string[];
    improvements: string[];
    marketRelevance: string;
  };
}

export interface ATSScoringResult {
  score: number;
  feedback: string;
  missingKeywords: string[];
  strengths: string[];
  improvements: string[];
}

// Career Path Types
export interface LearningCourse {
  id: string;
  title: string;
  provider: "Coursera" | "Udemy" | "LinkedIn Learning" | "edX";
  url: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  price?: number;
  rating?: number;
  image?: string;
}

export interface CareerSkill {
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  courses: LearningCourse[];
  estimatedHours: number;
}

export interface CareerPathStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  skills: CareerSkill[];
  duration: string;
  milestones: string[];
}

export interface CareerPath {
  id: string;
  role: string;
  title: string;
  description: string;
  targetLevel: "Junior" | "Mid" | "Senior";
  steps: CareerPathStep[];
  totalDuration: string;
  prerequisites: string[];
  createdAt: string;
  updatedAt: string;
  targetCompanies: string[];
  targetLevel: "Junior" | "Mid" | "Senior";
}

export interface UserLearningProgress {
  id: string;
  userId: string;
  careerPathId: string;
  role: string;
  completedSteps: number;
  completedCourses: string[];
  currentStep: number;
  progress: number;
  startedAt: string;
  updatedAt: string;
}

export interface CareerPathResponse {
  careerPath: CareerPath;
  userProgress?: UserLearningProgress;
}

// Payment & Subscription Types
export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: {
    userId: string;
    planType: string;
  };
  created_at: number;
}

export interface RazorpayPayment {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  description: string;
  notes: {
    userId: string;
  };
  fee: number;
  tax: number;
  net: number;
  created_at: number;
}

export interface Subscription {
  id: string;
  userId: string;
  orderId: string;
  paymentId: string;
  planType: "monthly" | "yearly";
  amount: number;
  currency: string;
  status: "pending" | "success" | "failed" | "cancelled";
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderParams {
  userId: string;
  amount: number;
  planType: "monthly" | "yearly";
  email: string;
  name: string;
}

export interface VerifyPaymentParams {
  orderId: string;
  paymentId: string;
  signature: string;
  userId: string;
}

// Credits & API Usage Types
export interface CreditDeductParams {
  userId: string;
  feature: string;
  credits: number;
  description: string;
}

export interface CreditStatus {
  available: number;
  used: number;
  remaining: number;
  monthly_limit?: number;
  refresh_date?: string;
}

export interface CreditLog {
  id: string;
  userId: string;
  action: string;
  credits_spent: number;
  credits_before: number;
  credits_after: number;
  feature: string;
  timestamp: string;
  description: string;
  status: "completed" | "pending" | "failed";
}

export interface CreditCheckResult {
  canUse: boolean;
  available: number;
  needed: number;
  error?: string;
}
