import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase/admin";

const SAMPLE_CAREER_PATHS: CareerPath[] = [
  {
    id: "",
    role: "Frontend Developer",
    title: "Frontend Developer - Complete Roadmap",
    description:
      "Master modern frontend development with React, TypeScript, and web standards",
    targetLevel: "Mid",
    totalDuration: "3-4 months",
    prerequisites: ["Understanding of HTML, CSS, JavaScript basics"],
    steps: [
      {
        id: "step1",
        stepNumber: 1,
        title: "Core JavaScript Mastery",
        description: "Master JavaScript fundamentals and modern ES6+ features",
        skills: [
          {
            name: "JavaScript Fundamentals",
            level: "Beginner",
            estimatedHours: 40,
            courses: [
              {
                id: "1",
                title: "The Complete JavaScript Course 2024",
                provider: "Udemy",
                url: "https://udemy.com",
                duration: "69 hours",
                level: "Beginner",
                price: 13.99,
              },
              {
                id: "2",
                title: "JavaScript Fundamentals",
                provider: "Coursera",
                url: "https://coursera.org",
                duration: "40 hours",
                level: "Beginner",
              },
            ],
          },
          {
            name: "ES6+ Features",
            level: "Intermediate",
            estimatedHours: 20,
            courses: [
              {
                id: "3",
                title: "Modern JavaScript: ES6 Essentials",
                provider: "Udemy",
                url: "https://udemy.com",
                duration: "15 hours",
                level: "Intermediate",
              },
            ],
          },
        ],
        duration: "2-3 weeks",
        milestones: [
          "Build a todo app with vanilla JS",
          "Master async/await and Promises",
          "Understand closures and scope",
        ],
      },
      {
        id: "step2",
        stepNumber: 2,
        title: "React Fundamentals",
        description: "Learn React basics, hooks, and component lifecycle",
        skills: [
          {
            name: "React Basics",
            level: "Beginner",
            estimatedHours: 30,
            courses: [
              {
                id: "4",
                title: "React - The Complete Guide",
                provider: "Udemy",
                url: "https://udemy.com",
                duration: "48 hours",
                level: "Beginner",
                price: 13.99,
              },
            ],
          },
          {
            name: "React Hooks",
            level: "Intermediate",
            estimatedHours: 25,
            courses: [
              {
                id: "5",
                title: "Advanced React Hooks",
                provider: "LinkedIn Learning",
                url: "https://linkedin.com/learning",
                duration: "3 hours",
                level: "Intermediate",
              },
            ],
          },
        ],
        duration: "3-4 weeks",
        milestones: [
          "Build a weather app using React",
          "Master useState and useEffect",
          "Create custom hooks",
        ],
      },
      {
        id: "step3",
        stepNumber: 3,
        title: "State Management & TypeScript",
        description: "Learn Redux/Zustand and TypeScript for type-safe React",
        skills: [
          {
            name: "TypeScript",
            level: "Intermediate",
            estimatedHours: 20,
            courses: [
              {
                id: "6",
                title: "TypeScript: The Complete Developer's Guide",
                provider: "Udemy",
                url: "https://udemy.com",
                duration: "20 hours",
                level: "Intermediate",
                price: 13.99,
              },
            ],
          },
          {
            name: "State Management",
            level: "Intermediate",
            estimatedHours: 15,
            courses: [
              {
                id: "7",
                title: "Redux Essentials",
                provider: "Coursera",
                url: "https://coursera.org",
                duration: "12 hours",
                level: "Intermediate",
              },
            ],
          },
        ],
        duration: "2-3 weeks",
        milestones: [
          "Build app with TypeScript",
          "Master Redux patterns",
          "Implement state management",
        ],
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    targetCompanies: ["Google", "Meta", "Netflix", "Airbnb"],
  },
  {
    id: "",
    role: "Backend Developer",
    title: "Backend Developer - Complete Roadmap",
    description: "Master backend development with Node.js, databases, and APIs",
    targetLevel: "Mid",
    totalDuration: "4-5 months",
    prerequisites: [
      "JavaScript knowledge",
      "Understanding of HTTP/REST basics",
    ],
    steps: [
      {
        id: "step1",
        stepNumber: 1,
        title: "Node.js & Express Fundamentals",
        description: "Learn Node.js runtime and Express.js framework",
        skills: [
          {
            name: "Node.js Basics",
            level: "Beginner",
            estimatedHours: 30,
            courses: [
              {
                id: "1",
                title: "The Complete Node.js Course",
                provider: "Udemy",
                url: "https://udemy.com",
                duration: "34 hours",
                level: "Beginner",
                price: 13.99,
              },
            ],
          },
          {
            name: "Express.js",
            level: "Beginner",
            estimatedHours: 20,
            courses: [
              {
                id: "2",
                title: "Express.js Essentials",
                provider: "Coursera",
                url: "https://coursera.org",
                duration: "20 hours",
                level: "Beginner",
              },
            ],
          },
        ],
        duration: "3-4 weeks",
        milestones: [
          "Build REST API",
          "Handle middleware",
          "Implement routing",
        ],
      },
      {
        id: "step2",
        stepNumber: 2,
        title: "Databases & SQL",
        description: "Master SQL and database design",
        skills: [
          {
            name: "SQL Fundamentals",
            level: "Beginner",
            estimatedHours: 25,
            courses: [
              {
                id: "3",
                title: "SQL for Data Analysis",
                provider: "Udemy",
                url: "https://udemy.com",
                duration: "22 hours",
                level: "Beginner",
                price: 13.99,
              },
            ],
          },
          {
            name: "PostgreSQL",
            level: "Intermediate",
            estimatedHours: 20,
            courses: [
              {
                id: "4",
                title: "PostgreSQL Complete Guide",
                provider: "Udemy",
                url: "https://udemy.com",
                duration: "18 hours",
                level: "Intermediate",
              },
            ],
          },
        ],
        duration: "3-4 weeks",
        milestones: [
          "Design database schema",
          "Write complex queries",
          "Optimize performance",
        ],
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    targetCompanies: ["Amazon", "Microsoft", "IBM", "Databricks"],
  },
  {
    id: "",
    role: "Data Scientist",
    title: "Data Scientist - Complete Roadmap",
    description:
      "Master Python, statistics, and machine learning for data science",
    targetLevel: "Senior",
    totalDuration: "5-6 months",
    prerequisites: ["Mathematics and statistics basics", "Python fundamentals"],
    steps: [
      {
        id: "step1",
        stepNumber: 1,
        title: "Python & Data Manipulation",
        description: "Master Python and pandas for data manipulation",
        skills: [
          {
            name: "Python Advanced",
            level: "Intermediate",
            estimatedHours: 30,
            courses: [
              {
                id: "1",
                title: "Python for Data Science",
                provider: "Coursera",
                url: "https://coursera.org",
                duration: "40 hours",
                level: "Intermediate",
              },
            ],
          },
          {
            name: "Pandas & NumPy",
            level: "Intermediate",
            estimatedHours: 25,
            courses: [
              {
                id: "2",
                title: "Data Analysis with Pandas",
                provider: "Udemy",
                url: "https://udemy.com",
                duration: "20 hours",
                level: "Intermediate",
                price: 13.99,
              },
            ],
          },
        ],
        duration: "3-4 weeks",
        milestones: [
          "Clean messy datasets",
          "Perform exploratory analysis",
          "Create data pipelines",
        ],
      },
      {
        id: "step2",
        stepNumber: 2,
        title: "Machine Learning Fundamentals",
        description: "Learn core ML algorithms and scikit-learn",
        skills: [
          {
            name: "ML Algorithms",
            level: "Intermediate",
            estimatedHours: 40,
            courses: [
              {
                id: "3",
                title: "Machine Learning A-Z",
                provider: "Udemy",
                url: "https://udemy.com",
                duration: "44 hours",
                level: "Intermediate",
                price: 13.99,
              },
            ],
          },
          {
            name: "Model Evaluation",
            level: "Intermediate",
            estimatedHours: 15,
            courses: [
              {
                id: "4",
                title: "ML Model Evaluation",
                provider: "Coursera",
                url: "https://coursera.org",
                duration: "12 hours",
                level: "Intermediate",
              },
            ],
          },
        ],
        duration: "4-5 weeks",
        milestones: [
          "Build classification models",
          "Implement regression",
          "Evaluate models",
        ],
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    targetCompanies: ["OpenAI", "Stripe", "DeepMind", "Anthropic"],
  },
];

export async function POST(request: NextRequest) {
  try {
    const { overwrite } = await request.json();

    if (overwrite) {
      // Clear existing paths
      const existingDocs = await db.collection("career_paths").get();
      for (const doc of existingDocs.docs) {
        await doc.ref.delete();
      }
    }

    // Add sample paths
    for (const path of SAMPLE_CAREER_PATHS) {
      const { id, ...pathData } = path;
      await db.collection("career_paths").add(pathData);
    }

    return NextResponse.json({
      success: true,
      message: `${SAMPLE_CAREER_PATHS.length} career paths seeded`,
    });
  } catch (error) {
    console.error("Seeding error:", error);
    return NextResponse.json({ error: "Failed to seed data" }, { status: 500 });
  }
}
