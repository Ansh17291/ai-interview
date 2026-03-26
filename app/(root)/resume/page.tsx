"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { deleteResume, getUserResumes } from "@/lib/actions/resume.action";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { FileText, Plus, Trash2, Eye } from "lucide-react";

export default function ResumesPage() {
    const [resumes, setResumes] = useState<Array<Resume & { id: string }>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const currentUser = await getCurrentUser();
            if (!currentUser) {
                window.location.href = "/sign-in";
                return;
            }

            const userResumes = await getUserResumes(currentUser.id);
            setResumes(userResumes);
            setLoading(false);
        };

        load();
    }, []);

    const handleDelete = async (resumeId: string) => {
        if (!confirm("Are you sure you want to delete this resume?")) return;

        const res = await deleteResume(resumeId);
        if (res.success) {
            setResumes(resumes.filter((r) => r.id !== resumeId));
            toast.success("Resume deleted");
        } else {
            toast.error("Failed to delete resume");
        }
    };

    const resumeToText = (resume: Resume): string => {
        const lines = [
            resume.personalInfo.fullName,
            resume.personalInfo.email,
            resume.personalInfo.phone,
            resume.personalInfo.location,
            "",
            resume.summary,
            "",
            "EXPERIENCE",
            ...resume.experience.map(
                (e) => `${e.position} at ${e.companyName} (${e.startDate} - ${e.endDate || "Present"})\n${e.description}`
            ),
            "",
            "EDUCATION",
            ...resume.education.map(
                (e) => `${e.degree} in ${e.field} from ${e.institution} (${e.graduationDate})`
            ),
            "",
            "SKILLS",
            resume.skills.join(", "),
            "",
            "CERTIFICATIONS",
            resume.certifications.join(", "),
        ];
        return lines.filter((l) => l).join("\n");
    };

    const handleScoreATS = async (resume: Resume & { id: string }) => {
        const resumeText = resumeToText(resume);

        try {
            const response = await fetch("/api/ats/score", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resumeText }),
            });

            const result: ATSScoringResult = await response.json();

            toast.success(`ATS Score: ${result.score}/100`);

            // You could show a detailed dialog here
            console.log("ATS Score Details:", result);
        } catch {
            toast.error("Failed to calculate ATS score");
        }
    };

    if (loading) {
        return <p className="text-light-200 p-10">Loading resumes...</p>;
    }

    return (
        <div className="container mx-auto py-10 px-4 max-w-6xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-primary-100">My Resumes</h1>
                    <p className="text-light-200 mt-2">Create, edit, and manage your resumes</p>
                </div>
                <Link href="/resume/new" className="btn btn-primary flex gap-2">
                    <Plus className="w-5 h-5" /> Create New Resume
                </Link>
            </div>

            {resumes.length === 0 ? (
                <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-light-400 mx-auto mb-4 opacity-50" />
                    <p className="text-light-200 text-lg">No resumes yet. Create your first resume!</p>
                    <Link href="/resume/new" className="btn btn-primary mt-4">
                        Create Resume
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resumes.map((resume) => (
                        <div
                            key={resume.id}
                            className="border border-light-400/20 rounded-2xl p-6 bg-dark-300 hover:border-light-400/40 transition-colors"
                        >
                            <div className="flex items-start gap-3 mb-4">
                                <FileText className="w-8 h-8 text-primary-100 flex-shrink-0" />
                                <div className="flex-1">
                                    <h3 className="font-bold text-white text-lg">{resume.title}</h3>
                                    <p className="text-sm text-light-300">{resume.personalInfo.fullName}</p>
                                </div>
                            </div>

                            <div className="text-sm text-light-400 mb-4 space-y-1">
                                <p>Experience: {resume.experience.length} roles</p>
                                <p>Education: {resume.education.length} entries</p>
                                <p>Skills: {resume.skills.length}</p>
                            </div>

                            {resume.atsScore && (
                                <div className="mb-4 p-3 bg-dark-200 rounded-lg border border-success-100/20">
                                    <p className="text-sm text-light-300">
                                        ATS Score: <span className="text-success-100 font-bold">{resume.atsScore.score}/100</span>
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Link href={`/resume/${resume.id}`} className="btn btn-outline flex-1 text-sm gap-1">
                                    <Eye className="w-4 h-4" /> Edit
                                </Link>
                                <Button
                                    onClick={() => handleScoreATS(resume)}
                                    size="sm"
                                    variant="outline"
                                    className="text-xs"
                                >
                                    Score ATS
                                </Button>
                                <button
                                    onClick={() => handleDelete(resume.id)}
                                    className="text-red-400 hover:text-red-300 p-2"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
