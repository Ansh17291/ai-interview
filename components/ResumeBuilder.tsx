"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createResume, updateResume } from "@/lib/actions/resume.action";
import { Plus, X, Save, Sparkles, Edit3 } from "lucide-react";
import { ResumeInsights } from "./resume/ResumeInsights";

interface ResumeBuilderProps {
    resumeId?: string;
    initialData?: Resume;
    onSave?: (resumeId: string) => void;
}

export default function ResumeBuilder({ resumeId, initialData, onSave }: ResumeBuilderProps) {
    const [title, setTitle] = useState(initialData?.title || "My Resume");
    const [personalInfo, setPersonalInfo] = useState(
        initialData?.personalInfo || {
            fullName: "",
            email: "",
            phone: "",
            location: "",
            linkedIn: "",
            portfolio: "",
        }
    );

    const [summary, setSummary] = useState(initialData?.summary || "");

    const [experience, setExperience] = useState<ResumeExperience[]>(
        initialData?.experience || []
    );

    const [education, setEducation] = useState<ResumeEducation[]>(
        initialData?.education || []
    );

    const [skills, setSkills] = useState<string[]>(initialData?.skills || []);
    const [skillInput, setSkillInput] = useState("");

    const [certifications, setCertifications] = useState<string[]>(
        initialData?.certifications || []
    );
    const [certInput, setCertInput] = useState("");

    const [loading, setLoading] = useState(false);
    const [view, setView] = useState<"editor" | "insights">("editor");

    const addExperience = () => {
        setExperience([
            ...experience,
            {
                id: Date.now().toString(),
                companyName: "",
                position: "",
                startDate: "",
                endDate: "",
                currentlyWorking: false,
                description: "",
            },
        ]);
    };

    const updateExperience = (index: number, field: keyof ResumeExperience, value: string | boolean) => {
        const updated = [...experience];
        updated[index] = { ...updated[index], [field]: value };
        setExperience(updated);
    };

    const removeExperience = (index: number) => {
        setExperience(experience.filter((_, i) => i !== index));
    };

    const addEducation = () => {
        setEducation([
            ...education,
            {
                id: Date.now().toString(),
                institution: "",
                degree: "",
                field: "",
                graduationDate: "",
                gpa: "",
            },
        ]);
    };

    const updateEducation = (index: number, field: keyof ResumeEducation, value: string) => {
        const updated = [...education];
        updated[index] = { ...updated[index], [field]: value } as ResumeEducation;
        setEducation(updated);
    };

    const removeEducation = (index: number) => {
        setEducation(education.filter((_, i) => i !== index));
    };

    const addSkill = () => {
        if (skillInput.trim()) {
            setSkills([...skills, skillInput.trim()]);
            setSkillInput("");
        }
    };

    const removeSkill = (index: number) => {
        setSkills(skills.filter((_, i) => i !== index));
    };

    const addCertification = () => {
        if (certInput.trim()) {
            setCertifications([...certifications, certInput.trim()]);
            setCertInput("");
        }
    };

    const removeCertification = (index: number) => {
        setCertifications(certifications.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        setLoading(true);

        if (!personalInfo.fullName || !personalInfo.email) {
            toast.error("Please fill in your name and email");
            setLoading(false);
            return;
        }

        try {
            let id = resumeId;

            if (resumeId) {
                const res = await updateResume(resumeId, {
                    title,
                    personalInfo,
                    summary,
                    experience,
                    education,
                    skills,
                    certifications,
                } as Partial<Resume>);
                if (!res.success) throw new Error(res.error);
            } else {
                // Get userId from session/auth - for now using placeholder
                const userId = "current-user-id"; // TODO: get from auth
                const res = await createResume({
                    userId,
                    title,
                    personalInfo,
                    summary,
                    experience,
                    education,
                    skills,
                    certifications,
                });
                if (!res.success) throw new Error(res.error);
                id = res.id;
            }

            toast.success("Resume saved successfully!");
            if (onSave) onSave(id!);
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Failed to save resume";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-6 px-4 space-y-8">
            {/* View Toggle */}
            <div className="flex bg-dark-300 rounded-[2rem] p-1.5 border border-light-400/10 w-fit mx-auto shadow-2xl">
                <button
                    onClick={() => setView("editor")}
                    className={`flex items-center gap-2 px-8 py-3 rounded-full text-sm font-black transition-all ${
                        view === "editor"
                            ? "bg-primary-100 text-dark-400 shadow-lg shadow-primary-100/20"
                            : "text-light-400 hover:text-white"
                    }`}
                >
                    <Edit3 className="w-4 h-4" /> EDITOR
                </button>
                <button
                    onClick={() => setView("insights")}
                    className={`flex items-center gap-2 px-8 py-3 rounded-full text-sm font-black transition-all ${
                        view === "insights"
                            ? "bg-primary-100 text-dark-400 shadow-lg shadow-primary-100/20"
                            : "text-light-400 hover:text-white"
                    }`}
                >
                    <Sparkles className="w-4 h-4" /> AI INSIGHTS
                </button>
            </div>

            {view === "insights" ? (
                initialData?.insights ? (
                    <ResumeInsights insights={initialData.insights} />
                ) : (
                    <div className="bg-dark-300 border border-light-400/5 rounded-[2.5rem] p-20 text-center">
                        <div className="p-6 bg-primary-100/10 w-24 h-24 rounded-full mx-auto mb-8 flex items-center justify-center">
                            <Sparkles className="w-12 h-12 text-primary-100 opacity-40" />
                        </div>
                        <h3 className="text-3xl font-black text-white mb-4 italic tracking-tight">Generate Insights</h3>
                        <p className="text-light-200 text-lg mb-10 max-w-sm mx-auto leading-relaxed">
                            Save your resume to see AI analysis, improvement points, and market relevance score.
                        </p>
                        <Button 
                            onClick={handleSave} 
                            disabled={loading}
                            className="px-10 py-5 bg-primary-100 text-dark-400 rounded-2xl font-black"
                        >
                            {loading ? "ANALYZING..." : "SAVE & ANALYZE"}
                        </Button>
                    </div>
                )
            ) : (
                <div className="space-y-6">
            {/* Title Section */}
            <div className="bg-dark-300 border border-light-400/20 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Resume Title</h2>
                <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior Developer Resume"
                    className="bg-dark-200 border-light-400/20 text-white"
                />
            </div>

            {/* Personal Info */}
            <div className="bg-dark-300 border border-light-400/20 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-light-300 block mb-1">Full Name *</label>
                        <Input
                            value={personalInfo.fullName}
                            onChange={(e) =>
                                setPersonalInfo({ ...personalInfo, fullName: e.target.value })
                            }
                            placeholder="John Doe"
                            className="bg-dark-200 border-light-400/20 text-white"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-light-300 block mb-1">Email *</label>
                        <Input
                            value={personalInfo.email}
                            onChange={(e) =>
                                setPersonalInfo({ ...personalInfo, email: e.target.value })
                            }
                            placeholder="john@example.com"
                            className="bg-dark-200 border-light-400/20 text-white"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-light-300 block mb-1">Phone</label>
                        <Input
                            value={personalInfo.phone}
                            onChange={(e) =>
                                setPersonalInfo({ ...personalInfo, phone: e.target.value })
                            }
                            placeholder="+1 (555) 000-0000"
                            className="bg-dark-200 border-light-400/20 text-white"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-light-300 block mb-1">Location</label>
                        <Input
                            value={personalInfo.location}
                            onChange={(e) =>
                                setPersonalInfo({ ...personalInfo, location: e.target.value })
                            }
                            placeholder="San Francisco, CA"
                            className="bg-dark-200 border-light-400/20 text-white"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-light-300 block mb-1">LinkedIn</label>
                        <Input
                            value={personalInfo.linkedIn || ""}
                            onChange={(e) =>
                                setPersonalInfo({ ...personalInfo, linkedIn: e.target.value })
                            }
                            placeholder="linkedin.com/in/johndoe"
                            className="bg-dark-200 border-light-400/20 text-white"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-light-300 block mb-1">Portfolio</label>
                        <Input
                            value={personalInfo.portfolio || ""}
                            onChange={(e) =>
                                setPersonalInfo({ ...personalInfo, portfolio: e.target.value })
                            }
                            placeholder="johndoe.com"
                            className="bg-dark-200 border-light-400/20 text-white"
                        />
                    </div>
                </div>

                <div className="mt-4">
                    <label className="text-sm text-light-300 block mb-1">Professional Summary</label>
                    <textarea
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        placeholder="Brief summary of your professional background and goals..."
                        rows={4}
                        className="w-full bg-dark-200 border border-light-400/20 text-white p-3 rounded-lg resize-none"
                    />
                </div>
            </div>

            {/* Experience Section */}
            <div className="bg-dark-300 border border-light-400/20 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">Work Experience</h2>
                    <Button onClick={addExperience} size="sm" className="flex gap-2">
                        <Plus className="w-4 h-4" /> Add Experience
                    </Button>
                </div>

                <div className="space-y-4">
                    {experience.map((exp, idx) => (
                        <div key={exp.id} className="border border-light-400/20 rounded-lg p-4 bg-dark-200/50">
                            <div className="flex justify-between mb-2">
                                <h3 className="font-bold text-white">Experience {idx + 1}</h3>
                                <button onClick={() => removeExperience(idx)} className="text-red-400 hover:text-red-300">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Input
                                    value={exp.companyName}
                                    onChange={(e) => updateExperience(idx, "companyName", e.target.value)}
                                    placeholder="Company Name"
                                    className="bg-dark-100 border-light-400/20 text-white text-sm"
                                />
                                <Input
                                    value={exp.position}
                                    onChange={(e) => updateExperience(idx, "position", e.target.value)}
                                    placeholder="Job Title"
                                    className="bg-dark-100 border-light-400/20 text-white text-sm"
                                />
                                <Input
                                    type="date"
                                    value={exp.startDate}
                                    onChange={(e) => updateExperience(idx, "startDate", e.target.value)}
                                    placeholder="Start Date"
                                    className="bg-dark-100 border-light-400/20 text-white text-sm"
                                />
                                <div className="flex gap-2">
                                    <Input
                                        type="date"
                                        value={exp.endDate}
                                        onChange={(e) => updateExperience(idx, "endDate", e.target.value)}
                                        placeholder="End Date"
                                        disabled={exp.currentlyWorking}
                                        className="bg-dark-100 border-light-400/20 text-white text-sm"
                                    />
                                    <label className="flex items-center text-light-300 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={exp.currentlyWorking}
                                            onChange={(e) => updateExperience(idx, "currentlyWorking", e.target.checked)}
                                            className="w-4 h-4 mr-1"
                                        />
                                        Current
                                    </label>
                                </div>
                            </div>

                            <textarea
                                value={exp.description}
                                onChange={(e) => updateExperience(idx, "description", e.target.value)}
                                placeholder="Role description and achievements..."
                                rows={3}
                                className="w-full mt-2 bg-dark-100 border border-light-400/20 text-white p-2 rounded text-sm resize-none"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Education Section */}
            <div className="bg-dark-300 border border-light-400/20 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">Education</h2>
                    <Button onClick={addEducation} size="sm" className="flex gap-2">
                        <Plus className="w-4 h-4" /> Add Education
                    </Button>
                </div>

                <div className="space-y-4">
                    {education.map((edu, idx) => (
                        <div key={edu.id} className="border border-light-400/20 rounded-lg p-4 bg-dark-200/50">
                            <div className="flex justify-between mb-2">
                                <h3 className="font-bold text-white">Education {idx + 1}</h3>
                                <button onClick={() => removeEducation(idx)} className="text-red-400 hover:text-red-300">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Input
                                    value={edu.institution}
                                    onChange={(e) => updateEducation(idx, "institution", e.target.value)}
                                    placeholder="Institution / University"
                                    className="bg-dark-100 border-light-400/20 text-white text-sm"
                                />
                                <Input
                                    value={edu.degree}
                                    onChange={(e) => updateEducation(idx, "degree", e.target.value)}
                                    placeholder="Degree (e.g. Bachelor, Master)"
                                    className="bg-dark-100 border-light-400/20 text-white text-sm"
                                />
                                <Input
                                    value={edu.field}
                                    onChange={(e) => updateEducation(idx, "field", e.target.value)}
                                    placeholder="Field of Study"
                                    className="bg-dark-100 border-light-400/20 text-white text-sm"
                                />
                                <Input
                                    type="date"
                                    value={edu.graduationDate}
                                    onChange={(e) => updateEducation(idx, "graduationDate", e.target.value)}
                                    placeholder="Graduation Date"
                                    className="bg-dark-100 border-light-400/20 text-white text-sm"
                                />
                                <Input
                                    value={edu.gpa || ""}
                                    onChange={(e) => updateEducation(idx, "gpa", e.target.value)}
                                    placeholder="GPA (optional)"
                                    className="bg-dark-100 border-light-400/20 text-white text-sm"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Skills Section */}
            <div className="bg-dark-300 border border-light-400/20 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Skills</h2>
                <div className="flex gap-2 mb-4">
                    <Input
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addSkill()}
                        placeholder="Add a skill (e.g. React, Python, etc.)"
                        className="bg-dark-200 border-light-400/20 text-white"
                    />
                    <Button onClick={addSkill}>Add</Button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {skills.map((skill, idx) => (
                        <div key={idx} className="bg-primary-100/20 border border-primary-100 text-primary-100 px-3 py-1 rounded-full flex items-center gap-2">
                            <span>{skill}</span>
                            <button onClick={() => removeSkill(idx)} className="hover:text-primary-200">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Certifications Section */}
            <div className="bg-dark-300 border border-light-400/20 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Certifications</h2>
                <div className="flex gap-2 mb-4">
                    <Input
                        value={certInput}
                        onChange={(e) => setCertInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addCertification()}
                        placeholder="Add a certification"
                        className="bg-dark-200 border-light-400/20 text-white"
                    />
                    <Button onClick={addCertification}>Add</Button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {certifications.map((cert, idx) => (
                        <div key={idx} className="bg-success-100/20 border border-success-100 text-success-100 px-3 py-1 rounded-full flex items-center gap-2">
                            <span>{cert}</span>
                            <button onClick={() => removeCertification(idx)} className="hover:text-success-200">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Save Button */}
            <div className="flex gap-4">
                <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full bg-primary-100 hover:bg-primary-200 text-dark-100 font-bold py-3 flex gap-2 justify-center"
                >
                    <Save className="w-5 h-5" />
                    {loading ? "Saving..." : "Save Resume"}
                </Button>
            </div>
            )}
        </div>
    );
}
