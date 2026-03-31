# Resume & Career Roadmap Enhancement Plan

## Overview

Transform the resume and career path features from form-based to intelligent, multi-source systems.

---

## Part 1: Smart Resume System

### 1.1 Resume Upload & Parsing Flow

```
User Landing → 3 Options:
├─ Upload Existing Resume
├─ Generate from Data (Interviews/Quizzes)
└─ Start Fresh with Form

Upload → Parse with PDF.js / pdfjs
  ↓
Extract text, skills, experience
  ↓
Store in Firebase
  ↓
Show: "Now apply for which role?"
```

### 1.2 Resume Optimization for Job Role

```
User selects role (e.g., "Senior Backend Engineer")
  ↓
Use Gemini API to:
  1. Analyze job description (user provides or we fetch)
  2. Current resume
  3. Match keywords & skills
  ↓
Generate new resume optimized for role:
  - Reorder experience by relevance
  - Add missing keywords
  - Rewrite descriptions with role focus
  - Suggest skills to highlight
  ↓
Show ATS score before/after
```

### 1.3 Auto-Generate Resume (No Resume Case)

```
User clicks "Generate Resume"
  ↓
Fetch from multiple sources:
  1. Interviews:
     - Last interview transcript
     - Technical skills mentioned
     - Topics covered
     - Performance score
  2. Quizzes:
     - Quiz scores & topics
     - Technical skills tested on
  3. GitHub:
     - Public repositories
     - Languages used
     - Star count
     - Contributions graph
  4. LinkedIn:
     - Experience data
     - Education
     - Skills endorsements
  ↓
Generate resume sections:
  - Summary: Based on interview Q&A
  - Experience: From past projects & interviews
  - Skills: From GitHub & quizzes
  - Projects: From GitHub
  - Education & Certifications
  ↓
Save to Firestore
```

### 1.4 Resume Versions

Store multiple optimized versions:

```
Resume ID: resume_12345
├─ Original (uploaded or generated)
├─ Optimized_SeniorBackendEngineer
├─ Optimized_FullstackDeveloper
├─ Optimized_ProductManager
└─ Current (default to show)
```

---

## Part 2: Visual Career Roadmaps

### 2.1 Visual Roadmap Component

```
┌─ Step 1: Foundations
│ ├─ Learn: JavaScript Fundamentals
│ ├─ Learn: Data Structures
│ ├─ Learn: Algorithms
│ └─ Duration: 4 weeks
│
├─ Step 2: Backend Basics
│ ├─ Learn: Node.js & Express
│ ├─ Learn: REST APIs
│ ├─ Learn: Databases (SQL/NoSQL)
│ └─ Duration: 6 weeks
│
├─ Step 3: Advanced Backend
│ ├─ Learn: Authentication & Authorization
│ ├─ Learn: Microservices
│ ├─ Learn: System Design
│ └─ Duration: 8 weeks
│
└─ Step 4: Senior Skills
  ├─ Learn: Scaling & Performance
  ├─ Learn: DevOps & CI/CD
  └─ Duration: 6 weeks
```

### 2.2 Roadmap Integration Options

**Option A: roadmap.sh API** (Recommended)

- Pros: Pre-built, professional, interactive
- Cons: Limited customization
- API Docs: https://github.com/kamranahmedse/roadmap.sh

**Option B: Custom rendering with D3.js / Mermaid**

- Pros: Full control, custom styling
- Cons: More complex

**Option C: Smooth visual timeline**

- Pros: Simple, elegant
- Cons: Less interactive

→ **Recommendation**: Use roadmap.sh for standard roles + custom Mermaid for AI-generated ones

### 2.3 Roadmap Generation from User Input

```
User inputs: "I want to become a Full Stack Developer"
  ↓
System:
  1. Analyze input with Gemini
  2. Extract target role, level, timeline
  3. Fetch similar paths (if exists)
  4. Generate milestones
  5. Suggest courses/resources
  ↓
Create visual roadmap:
  - 4-6 main steps
  - Each step: skills, duration, resources
  - Progress tracking
  - Goal checkpoint validation
```

---

## Implementation Architecture

### Key Services Needed

1. **Resume Parser** (`lib/services/resumeParser.ts`)
   - PDF parsing with pdf-parse
   - Extract: name, email, skills, experience
   - Returns structured Resume object

2. **Data Aggregator** (`lib/services/dataAggregator.ts`)
   - Collect from: Interviews, Quizzes, GitHub, LinkedIn
   - Normalize data into resume format

3. **Resume Optimizer** (`lib/actions/resumeOptimizer.action.ts`)
   - Use Gemini to optimize for job role
   - Compare JD with resume
   - Suggest improvements

4. **Roadmap Generator** (`lib/services/roadmapGenerator.ts`)
   - Parse user' goal
   - Generate steps & milestones
   - Integrate roadmap.sh data

5. **Roadmap Visualizer** (`components/VisualRoadmap.tsx`)
   - Render career path as visual timeline
   - Show progress
   - Interactive step details

### Database Schema Additions

```typescript
// ResumeParsed (new collection)
{
  id: "resume_12345",
  userId: "user123",
  type: "uploaded" | "generated" | "optimized",
  originalFile?: string,
  parsedData: {
    fullName: string,
    email: string,
    phone: string,
    location: string,
    summary: string,
    skills: string[],
    experience: Array<{
      company: string,
      role: string,
      duration: string,
      description: string,
      technologies: string[]
    }>,
    education: Array<...>,
    projects: Array<...>
  },
  metadata: {
    source: "upload" | "github" | "linkedin" | "interviews",
    createdAt: string,
    updatedAt: string
  }
}

// ResumeOptimized (new collection)
{
  id: "opt_12345",
  userId: "user123",
  originalResumeId: "resume_12345",
  targetRole: "Senior Backend Engineer",
  targetJD?: string,
  optimizedContent: { ...Resume },
  atsScoreBefore: number,
  atsScoreAfter: number,
  improvements: string[],
  keywords: {
    matched: string[],
    missing: string[]
  },
  createdAt: string
}

// CareerRoadmap (updated)
{
  id: "roadmap_12345",
  userId: "user123",
  targetRole: "Full Stack Developer",
  targetLevel: "Senior",
  userGoal: "Become a skilled full stack engineer in 12 months",
  type: "standard" | "custom" | "ai-generated",

  steps: Array<{
    id: string,
    stepNumber: number,
    title: string,
    description: string,
    duration: string,
    skills: Array<{
      name: string,
      level: "Beginner" | "Intermediate" | "Advanced",
      resources: Array<{
        title: string,
        type: "course" | "book" | "project" | "article",
        url: string,
        duration: string,
        difficulty: string,
        provider: string
      }>
    }>,
    milestone: string,
    resources: Array<...>,
    projects: Array<{
      name: string,
      description: string,
      difficulty: string,
      duration: string
    }>
  }>,

  visualData?: {
    roadmapShUrl?: string,
    mermaidDiagram?: string
  },

  progress: {
    completedSteps: number[],
    currentStep: number,
    percentComplete: number
  },

  createdAt: string,
  updatedAt: string
}
```

---

## Technology Stack

### Resume Parsing

- **pdf-parse** or **pdfjs** - Parse PDF
- **mammoth** - Parse DOCX
- **Gemini 2.0** - Extract structured data from unstructured text

### Data Integration

- **GitHub API** - Repository data, contributions
- **LinkedIn OAuth** - Profile data (if supported)
- **OpenAI API** - Interview transcripts analysis

### Visualization

- **roadmap.sh** - Standard career paths
- **Mermaid.js** - Custom roadmap diagrams
- **Recharts** - Progress charts

### API Services

- **Gemini 2.0** - Resume optimization, goal parsing
- **Career API** (optional) - Job market data

---

## File Structure to Create

```
lib/
├─ services/
│  ├─ resumeParser.ts          (PDF/DOCX parsing)
│  ├─ dataAggregator.ts        (GitHub/LinkedIn collection)
│  ├─ roadmapGenerator.ts      (Creates roadmaps)
│  └─ resumeOptimizer.ts       (Schema level)
├─ actions/
│  ├─ resumeActions.ts         (Extended)
│  ├─ resumeOptimizer.action.ts (Server-side optimization)
│  └─ roadmap.action.ts        (Roadmap operations)
└─ hooks/
   └─ useRoadmapProgress.ts    (Track progress)

components/
├─ resume/
│  ├─ ResumeUploader.tsx       (File upload)
│  ├─ ResumeParser.tsx         (Preview & confirm)
│  ├─ ResumeOptimizer.tsx      (Select role & optimize)
│  └─ ResumeDashboard.tsx      (Manage versions)
└─ career/
   ├─ RoadmapVisualizer.tsx    (Main timeline)
   ├─ RoadmapStep.tsx          (Individual step)
   └─ GoalInput.tsx            (User input for custom roadmap)

app/
├─ (root)/resume/
│  ├─ page.tsx                 (Updated listing)
│  ├─ upload/
│  │  └─ page.tsx              (Upload flow)
│  ├─ optimize/
│  │  └─ page.tsx              (Optimization UI)
│  └─ [id]/
│     └─ page.tsx              (View/edit specific)
└─ (root)/career-path/
   ├─ page.tsx                 (Updated with visuals)
   ├─ create/
   │  └─ page.tsx              (Custom roadmap creation)
   └─ [id]/
      └─ page.tsx              (View & track progress)

api/
├─ resume/
│  ├─ parse/
│  │  └─ route.ts              (File upload & parse)
│  ├─ optimize/
│  │  └─ route.ts              (Optimize for role)
│  └─ generate/
│     └─ route.ts              (Auto-generate)
└─ career/
   └─ generate-roadmap/
      └─ route.ts              (Create roadmap)
```

---

## Implementation Phases

### Phase 1: Resume Upload & Parsing (Week 1)

- [ ] Install pdf-parse & file upload deps
- [ ] Create ResumeUploader component
- [ ] Build PDF parsing service
- [ ] Create /api/resume/parse endpoint
- [ ] Update resume schema for parsed data

### Phase 2: Resume Optimization (Week 2)

- [ ] Create resume optimizer with Gemini
- [ ] Build ResumeOptimizer UI (select role)
- [ ] Create /api/resume/optimize endpoint
- [ ] Implement ATS comparison
- [ ] Add version management

### Phase 3: Auto-Resume Generation (Week 2-3)

- [ ] Implement GitHub API integration
- [ ] Build data aggregator (interviews/quizzes)
- [ ] Add LinkedIn OAuth (optional)
- [ ] Create /api/resume/generate endpoint
- [ ] Build generation flow UI

### Phase 4: Visual Roadmaps (Week 3-4)

- [ ] Integrate roadmap.sh or Mermaid
- [ ] Create RoadmapVisualizer component
- [ ] Design interactive step cards
- [ ] Implement progress tracking
- [ ] Add animations

### Phase 5: Custom Roadmap Generation (Week 4)

- [ ] Build GoalInput component
- [ ] Create roadmap generator service
- [ ] Implement Gemini goal parsing
- [ ] Add milestone suggestions
- [ ] Integration with resources API

---

## API Keys Required

```env
GEMINI_API_KEY=         # For resume optimization & goal parsing
GITHUB_API_TOKEN=       # For GitHub data collection
LINKEDIN_CLIENT_ID=     # (Optional) For LinkedIn integration
ROADMAP_SH_API=         # Or use public CDN
```

---

## Cost Estimation (Gemini API)

Resume optimization: ~$0.02-0.05 per request
Career roadmap generation: ~$0.05-0.10 per request
Cost per user feature usage: ~$0.10-0.20

---

## Security Considerations

- [ ] Validate file uploads (PDF/DOCX only, max 10MB)
- [ ] Parse PDFs server-side in secure environment
- [ ] Don't expose GitHub/LinkedIn tokens to client
- [ ] Rate limit resume optimization (1/min per user)
- [ ] Sanitize parsed data before storing
- [ ] Validate job descriptions before optimization
- [ ] Use HTTPS for all API calls

---

## Success Metrics

✅ Resume upload working in <2s
✅ Optimization generates in <10s
✅ Auto-resume success rate >80%
✅ Visual roadmap loads in <1s
✅ Custom roadmap generation in <15s

---

## Next Steps

1. Review this plan
2. Confirm which features you want first
3. Set up API keys (Gemini, GitHub)
4. Begin Phase 1: Resume upload

Ready to start implementing! 🚀
