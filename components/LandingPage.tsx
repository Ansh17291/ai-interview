"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    ArrowRight,
    Zap,
    Brain,
    TrendingUp,
    Users,
    CheckCircle,
    Star,
    MessageCircle,
} from "lucide-react";
import Image from "next/image";

export default function LandingPage() {
    const features = [
        {
            icon: Brain,
            title: "AI-Powered Interviews",
            description: "Practice with realistic, industry-specific interview questions powered by advanced neural models.",
            color: "from-blue-500/20 to-blue-600/5",
            iconColor: "text-blue-400"
        },
        {
            icon: TrendingUp,
            title: "Real-time Feedback",
            description: "Get instant, granular feedback on your communication, technical skills, and body language.",
            color: "from-emerald-500/20 to-emerald-600/5",
            iconColor: "text-emerald-400"
        },
        {
            icon: Users,
            title: "Community Wisdom",
            description: "Join 10,000+ professionals sharing real-world interview transcripts and preparation strategies.",
            color: "from-purple-500/20 to-purple-600/5",
            iconColor: "text-purple-400"
        },
        {
            icon: Zap,
            title: "Career Navigation",
            description: "Personalized roadmaps that adapt to your progress, guiding you from junior to lead positions.",
            color: "from-amber-500/20 to-amber-600/5",
            iconColor: "text-amber-400"
        },
    ];

    const stats = [
        { number: "15K+", label: "Success Stories" },
        { number: "85K+", label: "Mock Sessions" },
        { number: "99%", label: "Satisfaction" },
    ];

    return (
        <div className="min-h-screen bg-zinc-950 selection:bg-primary-100/30">
            {/* Background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-100/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-primary-200/10 blur-[100px] rounded-full"></div>
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 px-6 py-4">
                <div className="max-w-7xl mx-auto backdrop-blur-xl bg-zinc-900/60 border border-white/5 rounded-2xl px-6 py-3 flex items-center justify-between shadow-2xl">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Zap className="w-6 h-6 text-zinc-900 fill-current" />
                        </div>
                        <span className="text-2xl font-black text-white tracking-tight">IntelliCoach</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link href="/sign-in" className="hidden sm:block">
                            <Button variant="ghost" className="text-zinc-400 hover:text-white transition-colors">
                                Sign In
                            </Button>
                        </Link>
                        <Link href="/sign-up">
                            <Button className="bg-primary-100 text-zinc-950 hover:bg-white hover:scale-105 transition-all duration-300 font-bold px-6 shadow-[0_0_20px_rgba(73,222,80,0.2)]">
                                Join Now
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center pt-24 px-6 overflow-hidden">
                <div className="max-w-6xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-5 py-2 mb-10 animate-fade-in-up">
                        <div className="w-2 h-2 rounded-full bg-primary-100 animate-pulse"></div>
                        <span className="text-xs text-zinc-300 font-bold uppercase tracking-widest">Powered by Advanced AI Models</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black text-white leading-[1.1] mb-8 tracking-tight max-w-5xl mx-auto italic italicized">
                        ACE YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-100 via-white to-primary-200 drop-shadow-sm">DREAM INTERVIEW</span> WITH AI
                    </h1>

                    <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto mb-12 leading-relaxed">
                        The world&apos;s most advanced AI platform for mock interviews. Personalized, adaptive, and designed to land you the offer.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <Link href="/sign-up" className="w-full sm:w-auto">
                            <Button className="w-full sm:w-64 h-16 text-xl font-black bg-primary-100 text-zinc-950 hover:bg-white transition-all duration-500 rounded-2xl group shadow-2xl hover:shadow-primary-100/20">
                                Get Started Free <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-2 transition-transform" />
                            </Button>
                        </Link>
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-zinc-950 bg-zinc-800 flex items-center justify-center overflow-hidden">
                                     <Image src="/user-avatar.png" alt="User" width={40} height={40} />
                                </div>
                            ))}
                            <div className="pl-4 flex flex-col items-start justify-center">
                                <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-3 h-3 text-amber-400 fill-current" />)}
                                </div>
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Trusted by 15k+ devs</span>
                            </div>
                        </div>
                    </div>

                    {/* Dashboard Preview */}
                    <div className="mt-24 relative max-w-5xl mx-auto group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary-100 to-primary-200 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                        <div className="relative bg-zinc-900 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
                             <Image 
                                src="/hero.png" 
                                alt="IntelliCoach Dashboard" 
                                width={1200} 
                                height={675}
                                className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                             />
                        </div>
                    </div>

                </div>
            </section>

            {/* Stats Bar */}
            <section className="py-20 border-y border-white/5 bg-zinc-900/30">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        {stats.map((stat) => (
                            <div key={stat.label} className="space-y-2">
                                <p className="text-5xl font-black text-white">{stat.number}</p>
                                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-32 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight">The Future of Preparation</h2>
                        <div className="w-24 h-1.5 bg-primary-100 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {features.map((feature, idx) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={idx}
                                    className={`group p-8 rounded-[2.5rem] bg-gradient-to-br ${feature.color} border border-white/5 hover:border-white/10 transition-all duration-500 hover:-translate-y-2 cursor-default relative overflow-hidden`}
                                >
                                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Icon className="w-32 h-32" />
                                    </div>
                                    <div className={`w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center mb-8 shadow-xl border border-white/10 ${feature.iconColor}`}>
                                        <Icon className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">{feature.title}</h3>
                                    <p className="text-zinc-400 text-lg leading-relaxed">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 px-6">
                <div className="max-w-5xl mx-auto relative group">
                    <div className="absolute -inset-2 bg-gradient-to-r from-primary-100 to-primary-200 rounded-[3rem] blur-2xl opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                    <div className="relative bg-zinc-900 border border-white/10 rounded-[3rem] p-12 md:p-20 text-center overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(73,222,80,0.1),transparent)] pointer-events-none"></div>
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-8 uppercase leading-tight">Ready to Land That <br/><span className="text-primary-100 italic">Big Offer?</span></h2>
                        <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto">Don&apos;t leave your career to chance. Join 15k+ professionals using IntelliCoach to master their interview game.</p>
                        <Link href="/sign-up">
                            <Button className="h-20 px-12 text-2xl font-black bg-primary-100 text-zinc-950 hover:bg-white hover:scale-105 transition-all duration-500 rounded-3xl shadow-2xl">
                                Start Free Session <ArrowRight className="w-8 h-8 ml-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 px-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <Zap className="w-6 h-6 text-primary-100" />
                        <span className="font-black text-white uppercase tracking-tighter">IntelliCoach</span>
                    </div>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">&copy; 2026 Crafted with Precision by AI Support Team</p>
                    <div className="flex gap-6">
                        {["Twitter", "GitHub", "LinkedIn"].map(s => <span key={s} className="text-zinc-500 hover:text-white cursor-pointer text-xs font-bold uppercase transition-colors">{s}</span>)}
                    </div>
                </div>
            </footer>
        </div>
    );
}
