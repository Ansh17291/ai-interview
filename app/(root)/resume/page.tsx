"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { deleteResume, getUserResumes } from "@/lib/actions/resume.action";
import { getUserSubscription } from "@/lib/actions/payment.action";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { FileText, Plus, Trash2, Eye, Sparkles, Target, Settings2, ArrowRight } from "lucide-react";
import { ResumeOptimizer } from "@/components/resume/ResumeOptimizer";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export default function ResumesPage() {
    const [resumes, setResumes] = useState<Array<Resume & { id: string }>>([]);
    const [loading, setLoading] = useState(true);
    const [isPremium, setIsPremium] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [optimizingResume, setOptimizingResume] = useState<{ id: string, title: string } | null>(null);
    const [isOptimizerOpen, setIsOptimizerOpen] = useState(false);

    useEffect(() => {
        const load = async () => {
            const currentUser = await getCurrentUser();
            if (!currentUser) {
                window.location.href = "/sign-in";
                return;
            }

            setUser(currentUser);

            // Check premium status
            const subscriptionStatus = await getUserSubscription(currentUser.id);
            if (!subscriptionStatus.success || !subscriptionStatus.isPremium) {
                window.location.href = "/pricing?feature=resume";
                return;
            }

            setIsPremium(true);
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
        return <div className="p-20 text-center text-light-400">Loading your resumes...</div>;
    }

    if (!isPremium) {
        return <div className="p-20 text-center text-light-400">Verifying access...</div>;
    }

    return (
        <div className="container mx-auto py-10 px-4 max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-5xl font-black text-primary-100 italic tracking-tight">My Resumes</h1>
                    <p className="text-light-200 mt-2 text-lg">Build, optimize, and track your career growth</p>
                </div>
                <Link href="/resume/new" className="px-8 py-3.5 bg-primary-100 text-dark-400 rounded-2xl font-black hover:bg-primary-200 flex items-center gap-2 transition-all shadow-xl shadow-primary-100/10 hover:-translate-y-1">
                    <Plus className="w-5 h-5" /> NEW RESUME
                </Link>
                {user?.email === "ansh2shweta@gmail.com" && (
                    <Button 
                        onClick={async () => {
                            const { syncTechnicalDummyData } = await import("@/lib/actions/dev.action");
                            const res = await syncTechnicalDummyData(user.id);
                            if (res.success) toast.success(res.message);
                        }}
                        variant="ghost"
                        className="text-primary-100/50 hover:text-primary-100 text-xs font-bold"
                    >
                        SYNC TEST DATA
                    </Button>
                )}
            </div>

            {resumes.length === 0 ? (
                <div className="text-center py-20 bg-dark-300 rounded-[2.5rem] border-2 border-dashed border-light-400/10 shadow-inner">
                    <div className="p-6 bg-primary-100/10 w-28 h-28 rounded-full mx-auto mb-8 flex items-center justify-center">
                        <FileText className="w-14 h-14 text-primary-100 opacity-60" />
                    </div>
                    <h3 className="text-3xl font-black text-white mb-3">Your Journey Starts Here</h3>
                    <p className="text-light-200 text-xl mb-10 max-w-sm mx-auto leading-relaxed">
                        Generate a professional resume from your interview performance or start fresh.
                    </p>
                    <Link href="/resume/new" className="px-12 py-4 bg-primary-100 text-dark-400 rounded-2xl font-black hover:bg-primary-200 inline-flex items-center gap-2 shadow-2xl shadow-primary-100/20 transition-all">
                        <Plus className="w-6 h-6" /> GET STARTED
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {resumes.map((resume) => (
                        <div
                            key={resume.id}
                            className="group relative flex flex-col bg-dark-300 rounded-3xl p-7 border border-light-400/5 hover:border-primary-100/40 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(163,230,53,0.1)] overflow-hidden"
                        >
                            {/* Card Decoration */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-100/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            
                            <div className="flex items-start justify-between mb-6 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="p-3.5 bg-primary-100/10 rounded-2xl group-hover:bg-primary-100 group-hover:text-dark-400 transition-all duration-300">
                                        <FileText className="w-6 h-6 text-primary-100 group-hover:text-dark-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-white text-xl line-clamp-1 group-hover:text-primary-100 transition-colors duration-300 italic">
                                            {resume.title}
                                        </h3>
                                        <p className="text-[10px] text-light-400 uppercase tracking-[0.2em] font-black mt-1">
                                            {new Date(resume.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(resume.id)}
                                    className="text-light-400 hover:text-red-400 p-2.5 transition-all duration-300 rounded-xl hover:bg-red-950/20"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                                <div className="bg-dark-400/50 p-3 rounded-2xl border border-light-400/5 backdrop-blur-sm">
                                    <p className="text-[10px] text-light-400 uppercase font-black text-center tracking-tighter mb-1">XP ROLES</p>
                                    <p className="text-lg text-center text-white font-black italic">{resume.experience.length}</p>
                                </div>
                                <div className="bg-dark-400/50 p-3 rounded-2xl border border-light-400/5 backdrop-blur-sm">
                                    <p className="text-[10px] text-light-400 uppercase font-black text-center tracking-tighter mb-1">TECH STACK</p>
                                    <p className="text-lg text-center text-white font-black italic">{resume.skills.length}</p>
                                </div>
                            </div>

                            <div className="flex-grow relative z-10">
                                {resume.jobDescriptionScore ? (
                                    <div className="mb-8 p-4 bg-primary-100/5 rounded-2xl border border-primary-100/20 flex items-center justify-between group-hover:bg-primary-100/10 transition-colors">
                                        <div className="flex items-center gap-2.5">
                                            <Target className="w-5 h-5 text-primary-100 animate-pulse" />
                                            <div>
                                                <span className="block text-[10px] font-black text-primary-100 uppercase tracking-widest">ATS MATCH</span>
                                                <span className="text-[11px] text-light-300 font-medium">Job description optimization</span>
                                            </div>
                                        </div>
                                        <span className="text-2xl font-black text-primary-100 tracking-tighter">{resume.jobDescriptionScore.score}%</span>
                                    </div>
                                ) : resume.atsScore ? (
                                    <div className="mb-8 p-4 bg-success-100/5 rounded-2xl border border-success-100/20 flex items-center justify-between group-hover:bg-success-100/10 transition-colors">
                                        <div className="flex items-center gap-2.5">
                                            <Sparkles className="w-5 h-5 text-success-100" />
                                            <div>
                                                <span className="block text-[10px] font-black text-success-100 uppercase tracking-widest">GENERAL SCORE</span>
                                                <span className="text-[11px] text-light-300 font-medium">Standard ATS evaluation</span>
                                            </div>
                                        </div>
                                        <span className="text-2xl font-black text-success-100 tracking-tighter">{resume.atsScore.score}%</span>
                                    </div>
                                ) : (
                                    <div className="mb-8 p-4 bg-dark-400/30 rounded-2xl border border-light-400/5 flex items-center justify-center italic text-xs text-light-400 tracking-wide text-center">
                                         Optimize to see your match score
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-3 mt-auto relative z-10">
                                <Link 
                                  href={`/resume/${resume.id}`} 
                                  className="flex items-center justify-center gap-2 py-3.5 bg-dark-400 border border-light-400/10 rounded-2xl text-sm font-black text-white hover:bg-dark-100 transition-all active:scale-95 shadow-lg border-b-2 border-b-light-400/20"
                                >
                                    <Eye className="w-4 h-4" /> VIEW & EDIT
                                </Link>
                                
                                <Dialog open={isOptimizerOpen && optimizingResume?.id === resume.id} onOpenChange={(open) => {
                                    if(!open) {
                                      setIsOptimizerOpen(false);
                                      setOptimizingResume(null);
                                    }
                                }}>
                                    <DialogTrigger asChild>
                                        <button
                                            onClick={() => {
                                                setOptimizingResume({ id: resume.id, title: resume.title });
                                                setIsOptimizerOpen(true);
                                            }}
                                            className="flex items-center justify-center gap-2 py-4 bg-primary-100 text-dark-400 rounded-2xl text-sm font-black hover:bg-primary-200 transition-all hover:shadow-[0_0_30px_rgba(163,230,53,0.3)] active:scale-95"
                                        >
                                            <Target className="w-4 h-4" /> OPTIMIZE FOR ROLE
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[650px] bg-dark-300 border-light-400/20 p-10 overflow-y-auto max-h-[95vh] rounded-[2rem]">
                                        {optimizingResume && (
                                            <ResumeOptimizer 
                                                resumeId={optimizingResume.id}
                                                resumeTitle={optimizingResume.title}
                                                onCancel={() => {
                                                  setIsOptimizerOpen(false);
                                                  setOptimizingResume(null);
                                                }}
                                                onSuccess={async (newId) => {
                                                  setOptimizingResume(null);
                                                  setIsOptimizerOpen(false);
                                                  const updated = await getUserResumes(user!.id);
                                                  setResumes(updated);
                                                  toast.success("Resume updated!");
                                                }}
                                            />
                                        )}
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
