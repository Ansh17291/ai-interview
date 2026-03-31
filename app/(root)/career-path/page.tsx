"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { 
  getUserCareerPaths, 
  saveUserCareerPath, 
  toggleStepCompletion, 
  deleteCareerPath 
} from "@/lib/actions/roadmap.action";
import { generateCustomRoadmap } from "@/lib/services/roadmapGenerator";
import { CareerPath, UserLearningProgress } from "@/types/index";
import RoadmapVisualizer from "@/components/career/RoadmapVisualizer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Sparkles, 
  Plus, 
  Map as MapIcon, 
  History, 
  Trash2, 
  Loader2, 
  Target,
  ArrowRight,
  Search,
  ChevronRight,
  TrendingUp,
  BrainCircuit
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

type ViewMode = "browse" | "active" | "create";

export default function CareerPathPage() {
    const [user, setUser] = useState<User | null>(null);
    const [userPaths, setUserPaths] = useState<Array<CareerPath & { id: string, progressData: UserLearningProgress | null }>>([]);
    const [selectedPath, setSelectedPath] = useState<CareerPath & { id: string, progressData: UserLearningProgress | null } | null>(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>("browse");
    
    // Create state
    const [targetRole, setTargetRole] = useState("");
    const [targetLevel, setTargetLevel] = useState<"Junior" | "Mid" | "Senior">("Junior");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedPreview, setGeneratedPreview] = useState<Partial<CareerPath> | null>(null);

    useEffect(() => {
        const load = async () => {
            const currentUser = await getCurrentUser();
            if (!currentUser) {
                window.location.href = "/sign-in";
                return;
            }

            setUser(currentUser);
            const paths = await getUserCareerPaths(currentUser.id);
            // @ts-ignore - progressData is added in getUserCareerPaths
            setUserPaths(paths);
            
            if (paths.length > 0) {
                // @ts-ignore
                setSelectedPath(paths[0]);
                setViewMode("active");
            } else {
                setViewMode("browse");
            }
            
            setLoading(false);
        };

        load();
    }, []);

    const handleGenerate = async () => {
        if (!targetRole) {
            toast.error("Please enter a target role");
            return;
        }

        setIsGenerating(true);
        try {
            const result = await generateCustomRoadmap(targetRole, targetLevel);
            if (result.success && result.roadmap) {
                setGeneratedPreview(result.roadmap);
                toast.success("AI Roadmap generated!");
            } else {
                toast.error(result.error || "Failed to generate roadmap");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSaveRoadmap = async () => {
        if (!user || !generatedPreview) return;

        try {
            const res = await saveUserCareerPath(user.id, generatedPreview);
            if (res.success) {
                toast.success("Roadmap saved to your profile!");
                const paths = await getUserCareerPaths(user.id);
                // @ts-ignore
                setUserPaths(paths);
                // @ts-ignore
                setSelectedPath(paths.find(p => p.id === res.id));
                setViewMode("active");
                setGeneratedPreview(null);
                setTargetRole("");
            } else {
                toast.error("Failed to save roadmap");
            }
        } catch (error) {
            toast.error("Failed to save");
        }
    };

    const handleToggleStep = async (stepNumber: number, isCompleted: boolean) => {
        if (!user || !selectedPath || !selectedPath.progressData) return;

        try {
            const res = await toggleStepCompletion(
                user.id,
                selectedPath.progressData.id,
                stepNumber,
                isCompleted,
                selectedPath.steps.length
            );

            if (res.success) {
                // Refresh data
                const paths = await getUserCareerPaths(user.id);
                // @ts-ignore
                setUserPaths(paths);
                // @ts-ignore
                const updated = paths.find(p => p.id === selectedPath.id);
                if (updated) setSelectedPath(updated);
            }
        } catch (error) {
            toast.error("Failed to update progress");
        }
    };

    const handleDeletePath = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this roadmap?")) return;

        try {
            const res = await deleteCareerPath(id);
            if (res.success) {
                toast.success("Roadmap deleted");
                const remaining = userPaths.filter(p => p.id !== id);
                setUserPaths(remaining);
                if (selectedPath?.id === id) {
                    setSelectedPath(remaining.length > 0 ? remaining[0] : null);
                    if (remaining.length === 0) setViewMode("browse");
                }
            }
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    if (loading) {
        return <div className="p-20 text-center text-light-400">Loading your career paths...</div>;
    }

    return (
        <div className="container mx-auto py-10 px-4 max-w-6xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                   <h1 className="text-5xl font-black text-primary-100 italic tracking-tight flex items-center gap-4">
                     <MapIcon className="w-12 h-12 text-primary-100" />
                     CAREER PLANNER
                   </h1>
                   <p className="text-light-200 mt-2 text-lg">Visual roadmaps powered by AI to help you reach your goals</p>
                </div>
                
                <div className="flex gap-3">
                    <Button 
                      onClick={() => setViewMode(viewMode === "active" ? "browse" : "active")}
                      variant="outline"
                      className="border-light-400/20 text-light-100 font-bold px-6 h-12 rounded-xl hover:bg-dark-300"
                    >
                      {viewMode === "active" ? <History className="w-4 h-4 mr-2" /> : <MapIcon className="w-4 h-4 mr-2" />}
                      {viewMode === "active" ? "HISTORY" : "VIEW ACTIVE"}
                    </Button>
                    
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="bg-primary-100 text-dark-400 font-black px-8 h-12 rounded-xl hover:bg-primary-200 shadow-xl shadow-primary-100/10">
                              <Plus className="w-5 h-5 mr-2" /> NEW ROADMAP
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] bg-dark-300 border-light-400/20 p-8 rounded-[2rem] overflow-y-auto max-h-[90vh]">
                            <div className="space-y-6">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-primary-100/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary-100/20 shadow-inner">
                                        <BrainCircuit className="w-8 h-8 text-primary-100 animate-pulse" />
                                    </div>
                                    <h2 className="text-3xl font-black text-white italic">AI ROADMAP GENERATOR</h2>
                                    <p className="text-light-400 mt-2">Where do you want to be in the next year?</p>
                                </div>

                                {!generatedPreview ? (
                                    <div className="space-y-5">
                                        <div className="space-y-2">
                                            <Label className="text-white font-bold tracking-wide">TARGET ROLE</Label>
                                            <Input 
                                                placeholder="e.g. Senior DevOps Engineer" 
                                                value={targetRole}
                                                onChange={(e) => setTargetRole(e.target.value)}
                                                className="bg-dark-400 border-light-400/10 h-14 text-lg focus:border-primary-100 rounded-xl"
                                            />
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <Label className="text-white font-bold tracking-wide">EXPERIENCE LEVEL</Label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {(["Junior", "Mid", "Senior"] as const).map((level) => (
                                                    <button
                                                        key={level}
                                                        onClick={() => setTargetLevel(level)}
                                                        className={`py-3 rounded-xl font-bold text-sm transition-all border ${
                                                            targetLevel === level 
                                                            ? "bg-primary-100 text-dark-400 border-primary-100 shadow-lg shadow-primary-100/10" 
                                                            : "bg-dark-400 text-light-400 border-light-400/5 hover:border-light-400/20"
                                                        }`}
                                                    >
                                                        {level.toUpperCase()}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <Button 
                                            onClick={handleGenerate}
                                            disabled={isGenerating || !targetRole}
                                            className="w-full bg-primary-100 text-dark-400 font-black h-14 text-lg rounded-xl mt-4 hover:bg-primary-200 transition-all hover:shadow-[0_0_30px_rgba(163,230,53,0.3)] shadow-xl shadow-primary-100/10"
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                                    CRAFTING YOUR PATH...
                                                </>
                                            ) : (
                                                <>
                                                    GENERATE ROADMAP
                                                    <Sparkles className="w-5 h-5 ml-2" />
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-6 animate-in fade-in duration-500">
                                        <div className="bg-dark-400/50 p-6 rounded-2xl border border-primary-100/20">
                                            <h3 className="text-2xl font-black text-white italic mb-2">{generatedPreview.title}</h3>
                                            <p className="text-light-300 text-sm">{generatedPreview.description}</p>
                                            
                                            <div className="grid grid-cols-2 gap-4 mt-6">
                                                <div className="bg-dark-300 p-3 rounded-xl border border-light-400/5">
                                                    <span className="text-[10px] font-black text-light-400 block uppercase mb-1">Total Steps</span>
                                                    <span className="text-lg font-black text-white italic">{generatedPreview.steps?.length} phases</span>
                                                </div>
                                                <div className="bg-dark-300 p-3 rounded-xl border border-light-400/5">
                                                    <span className="text-[10px] font-black text-light-400 block uppercase mb-1">ETA</span>
                                                    <span className="text-lg font-black text-white italic">{generatedPreview.totalDuration}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            <Button 
                                                onClick={handleSaveRoadmap}
                                                className="w-full bg-primary-100 text-dark-400 font-black h-12 rounded-xl flex items-center justify-center gap-2 hover:bg-primary-200"
                                            >
                                                <Target className="w-5 h-5" /> SAVE AS ACTIVE PATH
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                onClick={() => setGeneratedPreview(null)}
                                                className="text-light-400 font-bold"
                                            >
                                                START OVER
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Main Content Area */}
            {viewMode === "browse" ? (
                <div className="space-y-8">
                    <h2 className="text-3xl font-black text-white italic mb-8 border-l-4 border-primary-100 pl-4 tracking-tighter">PREVIOUS ROADMAPS</h2>
                    {userPaths.length === 0 ? (
                        <div className="text-center py-20 bg-dark-300 rounded-[2.5rem] border-2 border-dashed border-light-400/10">
                            <div className="p-6 bg-primary-100/10 w-28 h-28 rounded-full mx-auto mb-8 flex items-center justify-center">
                                <MapIcon className="w-12 h-12 text-primary-100 opacity-60" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">NO ROADMAPS DISCOVERED</h3>
                            <p className="text-light-200 text-lg mb-8 max-w-sm mx-auto">
                                Generate your first career path to see it visually tracked here.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {userPaths.map((path) => (
                                <div
                                    key={path.id}
                                    onClick={() => {
                                        setSelectedPath(path);
                                        setViewMode("active");
                                    }}
                                    className="group relative bg-dark-300 rounded-3xl p-6 border border-light-400/5 hover:border-primary-100/30 transition-all cursor-pointer hover:shadow-2xl hover:shadow-primary-100/5 overflow-hidden"
                                >
                                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary-100/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                                    
                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-dark-200 rounded-2xl flex items-center justify-center border border-light-400/5 group-hover:bg-primary-100 group-hover:text-dark-400 transition-all">
                                                <Target className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-white italic tracking-tight">{path.role}</h3>
                                                <p className="text-[10px] text-light-400 uppercase font-black tracking-widest">{path.targetLevel} LEVEL</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => handleDeletePath(path.id, e)}
                                            className="p-2 text-light-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="mb-6 relative z-10">
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-[10px] font-black text-light-300 tracking-wider">COMPLETION PROGRESS</span>
                                            <span className="text-sm font-black text-primary-100">{path.progressData?.progress || 0}%</span>
                                        </div>
                                        <div className="w-full bg-dark-400 rounded-full h-2 shadow-inner">
                                            <div 
                                              className="bg-primary-100 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(163,230,53,0.3)]" 
                                              style={{ width: `${path.progressData?.progress || 0}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="flex gap-4">
                                            <div className="flex items-center gap-1.5 text-light-400">
                                                <History className="w-3.5 h-3.5" />
                                                <span className="text-xs font-bold">{path.totalDuration}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-light-400">
                                                <Target className="w-3.5 h-3.5" />
                                                <span className="text-xs font-bold">{path.steps.length} Steps</span>
                                            </div>
                                        </div>
                                        <div className="p-2 bg-dark-400 rounded-lg group-hover:bg-primary-100 group-hover:text-dark-400 transition-all">
                                            <ChevronRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {selectedPath ? (
                        <div>
                            <RoadmapVisualizer 
                                roadmap={selectedPath}
                                progressData={selectedPath.progressData}
                                onToggleStep={handleToggleStep}
                            />
                        </div>
                    ) : (
                        <div className="text-center py-20 text-light-400 italic">No active path selected</div>
                    )}
                </div>
            )}

            {/* Quick Tips */}
            <div className="mt-16 bg-primary-100/5 border border-primary-100/10 rounded-3xl p-8 flex flex-col md:flex-row gap-8 items-center shadow-xl">
                <div className="p-5 bg-primary-100 rounded-2xl shadow-lg shadow-primary-100/20">
                    <Sparkles className="w-10 h-10 text-dark-400" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-white italic mb-2 tracking-tight">CRAFT YOUR DESTINY</h3>
                    <p className="text-light-300 text-sm leading-relaxed max-w-2xl">
                        AI-generated roadmaps use current market data, job requirements, and expert learning paths. 
                        Bookmark your progress and complete milestones to unlock specialized interview sessions for your target role.
                    </p>
                </div>
            </div>
        </div>
    );
}