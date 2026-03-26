interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Quiz {
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

interface QuizResult {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  userAnswers: (number | null)[];
  createdAt: string;
}

interface SaveQuizResultParams {
  quizId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  userAnswers: (number | null)[];
}
interface Feedback {
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
  createdAt: string;
}

interface Interview {
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

interface CreateFeedbackParams {
  interviewId: string;
  userId: string;
  transcript: { role: string; content: string }[];
  feedbackId?: string;
}

interface User {
  name: string;
  email: string;
  id: string;
  role?: "user" | "mentor";
}

interface MentorBooking {
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

interface InterviewCardProps {
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

interface AgentProps {
  userName: string;
  userId?: string;
  interviewId?: string;
  feedbackId?: string;
  type: "generate" | "interview";
  questions?: string[];
}

interface RouteParams {
  params: { [key: string]: string | string[] | undefined };
  searchParams: { [key: string]: string | string[] | undefined };
}

interface GetFeedbackByInterviewIdParams {
  interviewId: string;
  userId: string;
}

interface GetLatestInterviewsParams {
  userId: string;
  limit?: number;
}

interface SignInParams {
  email: string;
  idToken: string;
}

interface SignUpParams {
  uid: string;
  name: string;
  email: string;
  password?: string;
  role?: "user" | "mentor";
}

type FormType = "sign-in" | "sign-up";

interface InterviewFormProps {
  interviewId: string;
  role: string;
  level: string;
  type: string;
  techstack: string[];
  amount: number;
}

interface TechIconProps {
  techStack: string[];
}

// Resume Builder Types
interface ResumeExperience {
  id: string;
  companyName: string;
  position: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  description: string;
}

interface ResumeEducation {
  id: string;
  institution: string;
  degree: string;
  field: string;
  graduationDate: string;
  gpa?: string;
}

interface Resume {
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
}

interface ATSScoringResult {
  score: number;
  feedback: string;
  missingKeywords: string[];
  strengths: string[];
  improvements: string[];
}

// Career Path Types
interface LearningCourse {
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

interface CareerSkill {
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  courses: LearningCourse[];
  estimatedHours: number;
}

interface CareerPathStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  skills: CareerSkill[];
  duration: string;
  milestones: string[];
}

interface CareerPath {
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

interface UserLearningProgress {
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

interface CareerPathResponse {
  careerPath: CareerPath;
  userProgress?: UserLearningProgress;
}
