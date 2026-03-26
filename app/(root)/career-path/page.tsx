"use client";

import { useEffect, useState } from "react";
import { getAllCareerPaths, getCareerPathByRole, getUserLearningProgress, createOrUpdateLearningProgress, createCareerPath } from "@/lib/actions/resume.action";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle2, Circle, BookOpen, Award, Calendar, ArrowRight } from "lucide-react";

export default function CareerPathPage() {
    const [user, setUser] = useState<User | null>(null);
    const [allCareerPaths, setAllCareerPaths] = useState<Array<CareerPath & { id: string }>>([]);
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [selectedPath, setSelectedPath] = useState<CareerPath & { id: string } | null>(null);
    const [userProgress, setUserProgress] = useState<UserLearningProgress | null>(null);
    const [loading, setLoading] = useState(true);
    const [newRoleName, setNewRoleName] = useState("");
    const [newRoleTitle, setNewRoleTitle] = useState("");
    const [newRoleDescription, setNewRoleDescription] = useState("");
    const [creatingPath, setCreatingPath] = useState(false);

    useEffect(() => {
        const load = async () => {
            const currentUser = await getCurrentUser();
            if (!currentUser) {
                window.location.href = "/sign-in";
                return;
            }

            setUser(currentUser);

            const paths = await getAllCareerPaths();
            setAllCareerPaths(paths);
            setLoading(false);
        };

        load();
    }, []);

    const handleRoleSelect = async (role: string) => {
        setSelectedRole(role);
        const path = await getCareerPathByRole(role);
        if (path) {
            setSelectedPath(path);

            if (user) {
                const progress = await getUserLearningProgress(user.id, path.id);
                setUserProgress(progress);
            }
        } else {
            toast.error("Career path not found for this role");
        }
    };

    const handleStartLearning = async () => {
        if (!user || !selectedPath) return;

        const res = await createOrUpdateLearningProgress({
            userId: user.id,
            careerPathId: selectedPath.id,
            role: selectedRole!,
            currentStep: 1,
            progress: 0,
        });

        if (res.success) {
            const progress = await getUserLearningProgress(user.id, selectedPath.id);
            setUserProgress(progress);
            toast.success("Started learning path! Bookmark this page to track progress.");
        }
    };

    const handleCreateCareerPath = async () => {
        if (!newRoleName.trim()) {
            toast.error("Please enter a role name.");
            return;
        }

        setCreatingPath(true);

        const role = newRoleName.trim();
        const title = newRoleTitle.trim() || `${role} Career Path`;
        const description =
            newRoleDescription.trim() || `Personalized roadmap to become a ${role}.`;

        const candidatePath: CareerPath = {
            id: "",
            role,
            title,
            description,
            targetLevel: "Junior",
            totalDuration: "2-3 months",
            prerequisites: ["Basic programming understanding"],
            steps: [
                {
                    id: `${role.toLowerCase().replace(/\s+/g, "-")}-step1`,
                    stepNumber: 1,
                    title: "Foundation Skills",
                    description: `Establish strong fundamentals for ${role}.`,
                    skills: [
                        {
                            name: "Core Concepts",
                            level: "Beginner",
                            estimatedHours: 20,
                            courses: [
                                {
                                    id: "auto-1",
                                    title: "Foundations Course",
                                    provider: "Udemy",
                                    url: "https://example.com",
                                    duration: "20 hours",
                                    level: "Beginner",
                                },
                            ],
                        },
                    ],
                    duration: "3-4 weeks",
                    milestones: [
                        "Learn fundamental principles",
                        "Finish practice projects",
                        "Document key learnings",
                    ],
                },
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            targetCompanies: [],
        };

        const result = await createCareerPath(candidatePath);
        setCreatingPath(false);

        if (result.success) {
            toast.success(`${role} career path created!`);
            setNewRoleName("");
            setNewRoleTitle("");
            setNewRoleDescription("");

            const paths = await getAllCareerPaths();
            setAllCareerPaths(paths);
            setSelectedRole(role);
            const created = await getCareerPathByRole(role);
            if (created) setSelectedPath(created);
        } else {
            toast.error(result.error || "Unable to create career path.");
        }
    };

    return (
        <div>
            <h1 className="text-4xl font-bold text-primary-100 mb-2">Career Path Planner</h1>
            <p className="text-light-200">Choose your target role and get a personalized learning roadmap</p>

            {/* Role Selection */}
            {!selectedRole ? (
                <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Select Your Target Role</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {allCareerPaths.map((path) => (
                            <button
                                key={path.id}
                                onClick={() => handleRoleSelect(path.role)}
                                className="text-left border border-light-400/20 rounded-xl p-6 hover:border-primary-100 hover:bg-dark-300/80 transition-all bg-dark-300"
                            >
                                <h3 className="text-xl font-bold text-white mb-2">{path.title || path.role}</h3>
                                <p className="text-light-300 text-sm mb-3">{path.description}</p>
                                <div className="flex items-center text-primary-100 text-sm">
                                    Choose <ArrowRight className="w-4 h-4 ml-2" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            ) : selectedPath ? (
                <div>
                    {/* Back button */}
                    <button
                        onClick={() => {
                            setSelectedRole(null);
                            setSelectedPath(null);
                            setUserProgress(null);
                        }}
                        className="text-primary-100 hover:text-primary-200 mb-6 flex items-center gap-1"
                    >
                        &larr; Back to roles
                    </button>

                    {/* Path Overview */}
                    <div className="bg-dark-300 border border-light-400/20 rounded-2xl p-8 mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">{selectedPath.title || selectedPath.role}</h2>
                        <p className="text-light-200 mb-4">{selectedPath.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-dark-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-light-300 text-sm">
                                    <Calendar className="w-4 h-4" /> Total Duration
                                </div>
                                <p className="text-white font-bold text-lg">{selectedPath.totalDuration}</p>
                            </div>
                            <div className="bg-dark-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-light-300 text-sm">
                                    <BookOpen className="w-4 h-4" /> Learning Steps
                                </div>
                                <p className="text-white font-bold text-lg">{selectedPath.steps.length} steps</p>
                            </div>
                            <div className="bg-dark-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-light-300 text-sm">
                                    <Award className="w-4 h-4" /> Level
                                </div>
                                <p className="text-white font-bold text-lg">{selectedPath.targetLevel}</p>
                            </div>
                        </div>

                        {!userProgress && (
                            <Button onClick={handleStartLearning} className="btn-primary">
                                Start Learning Path
                            </Button>
                        )}

                        {userProgress && (
                            <div className="bg-success-100/10 border border-success-100 rounded-lg p-4">
                                <p className="text-success-100">✓ You&apos;ve started this learning path</p>
                                <p className="text-light-200 text-sm mt-1">
                                    Progress: {userProgress.completedSteps}/{selectedPath.steps.length} steps completed
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Learning Steps */}
                    <div className="space-y-6">
                        {selectedPath.steps.map((step, idx) => {
                            const isCompleted = userProgress && userProgress.completedSteps > idx;
                            const isCurrentStep = userProgress && userProgress.currentStep === step.stepNumber;

                            return (
                                <div
                                    key={step.id}
                                    className={`border rounded-2xl p-6 transition-all ${isCompleted
                                        ? "border-success-100/50 bg-dark-300/80"
                                        : isCurrentStep
                                            ? "border-primary-100 bg-dark-300"
                                            : "border-light-400/20 bg-dark-300"
                                        }`}
                                >
                                    {/* Step Header */}
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="flex-shrink-0">
                                            {isCompleted ? (
                                                <CheckCircle2 className="w-8 h-8 text-success-100" />
                                            ) : isCurrentStep ? (
                                                <Circle className="w-8 h-8 text-primary-100 border-2 border-primary-100" />
                                            ) : (
                                                <Circle className="w-8 h-8 text-light-400" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-white">
                                                Step {step.stepNumber}: {step.title}
                                            </h3>
                                            <p className="text-light-300 mt-1">{step.description}</p>
                                        </div>
                                    </div>

                                    {/* Skills for this step */}
                                    {step.skills && step.skills.length > 0 && (
                                        <div className="mb-4">
                                            <h4 className="text-light-200 font-semibold mb-3">Skills to Learn:</h4>
                                            <div className="space-y-3">
                                                {step.skills.map((skill, skillIdx) => (
                                                    <div key={skillIdx} className="bg-dark-200 rounded-lg p-3">
                                                        <p className="text-white font-semibold">{skill.name}</p>
                                                        <p className="text-light-300 text-sm">Estimated: {skill.estimatedHours} hours</p>

                                                        {/* Courses for skill */}
                                                        {skill.courses && skill.courses.length > 0 && (
                                                            <div className="mt-3 space-y-2">
                                                                {skill.courses.slice(0, 3).map((course, courseIdx) => (
                                                                    <a
                                                                        key={courseIdx}
                                                                        href={course.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="block text-sm text-primary-100 hover:text-primary-200 underline"
                                                                    >
                                                                        {course.title}
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Milestones */}
                                    {step.milestones && step.milestones.length > 0 && (
                                        <div className="mb-4">
                                            <h4 className="text-light-200 font-semibold mb-2">Milestones:</h4>
                                            <ul className="text-light-300 text-sm space-y-1 list-disc list-inside">
                                                {step.milestones.map((milestone, idx) => (
                                                    <li key={idx}>{milestone}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Duration */}
                                    <div className="text-light-300 text-sm">
                                        Estimated time: <strong>{step.duration}</strong>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : null}
        </div>
    );
}