// components/interview/InterviewLeaderboard.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Trophy, TrendingUp, Medal, Zap } from "lucide-react";

interface LeaderboardEntry {
    rank: number;
    userId: string;
    userName: string;
    interviewScore: number;
    role: string;
    percentile: number;
    badge?: "Master" | "Expert" | "Rising Star";
}

const mockLeaderboard: LeaderboardEntry[] = [
    {
        rank: 1,
        userId: "user1",
        userName: "Alex Chen",
        interviewScore: 94,
        role: "Senior Backend Engineer",
        percentile: 99,
        badge: "Master",
    },
    {
        rank: 2,
        userId: "user2",
        userName: "Sarah Johnson",
        interviewScore: 91,
        role: "Senior Backend Engineer",
        percentile: 98,
        badge: "Expert",
    },
    {
        rank: 3,
        userId: "user3",
        userName: "Mike Rodriguez",
        interviewScore: 88,
        role: "Senior Backend Engineer",
        percentile: 97,
        badge: "Expert",
    },
    {
        rank: 4,
        userId: "user4",
        userName: "Emma Davis",
        interviewScore: 85,
        role: "Senior Backend Engineer",
        percentile: 95,
    },
    {
        rank: 5,
        userId: "user5",
        userName: "James Wilson",
        interviewScore: 82,
        role: "Senior Backend Engineer",
        percentile: 92,
    },
];

export const InterviewLeaderboard = ({ role = "Senior Backend Engineer" }) => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(
        mockLeaderboard
    );
    const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);

    useEffect(() => {
        // In real app, fetch from API
        const currentUser = {
            rank: 12,
            userId: "current-user",
            userName: "You",
            interviewScore: 76,
            role,
            percentile: 78,
            badge: "Rising Star" as const,
        };
        setUserRank(currentUser);
    }, [role]);

    const getRankColor = (rank: number) => {
        if (rank === 1) return "text-yellow-400";
        if (rank === 2) return "text-gray-300";
        if (rank === 3) return "text-orange-400";
        return "text-zinc-400";
    };

    const getMedalIcon = (rank: number) => {
        if (rank === 1) return "🥇";
        if (rank === 2) return "🥈";
        if (rank === 3) return "🥉";
        return rank.toString();
    };

    const getBadgeColor = (badge?: string) => {
        if (badge === "Master")
            return "bg-purple-500/20 border-purple-500/50 text-purple-300";
        if (badge === "Expert")
            return "bg-blue-500/20 border-blue-500/50 text-blue-300";
        if (badge === "Rising Star")
            return "bg-green-500/20 border-green-500/50 text-green-300";
        return "";
    };

    return (
        <div className="w-full space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-xs font-black text-primary-100 uppercase tracking-wider">
                        Leaderboard
                    </p>
                    <h3 className="text-xl font-black text-white uppercase">
                        Top Performers
                    </h3>
                </div>
                <Trophy className="w-5 h-5 text-primary-100" />
            </div>

            {/* User's Current Rank (if not in top 10) */}
            {userRank && userRank.rank > 10 && (
                <div className="bg-gradient-to-r from-primary-100/10 to-primary-200/5 border border-primary-100/30 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="text-lg font-black text-primary-100">
                                #{userRank.rank}
                            </div>
                            <div>
                                <p className="font-black text-white">{userRank.userName}</p>
                                <p className="text-xs text-zinc-400">Your Current Rank</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xl font-black text-primary-100">
                                {userRank.interviewScore}
                            </p>
                            <p className="text-xs text-zinc-400">Score</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Leaderboard List */}
            <div className="space-y-2">
                {leaderboard.map((entry, index) => (
                    <div
                        key={entry.userId}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-all ${index === 0
                                ? "bg-yellow-500/10 border-yellow-500/30"
                                : index === 1
                                    ? "bg-gray-500/10 border-gray-500/30"
                                    : index === 2
                                        ? "bg-orange-500/10 border-orange-500/30"
                                        : "bg-zinc-800/40 border-white/10 hover:border-white/20"
                            }`}
                    >
                        {/* Rank Badge */}
                        <div className="flex items-center gap-3 min-w-[120px]">
                            <div
                                className={`text-xl font-black ${getRankColor(entry.rank)} w-8 text-center`}
                            >
                                {getMedalIcon(entry.rank)}
                            </div>
                            <div>
                                <p className="font-black text-white text-sm">
                                    {entry.userName}
                                </p>
                                <p className="text-[10px] text-zinc-400">{entry.role}</p>
                            </div>
                        </div>

                        {/* Score and Badge */}
                        <div className="flex items-center gap-3">
                            {entry.badge && (
                                <div
                                    className={`px-2 py-1 rounded text-[10px] font-bold border ${getBadgeColor(
                                        entry.badge
                                    )}`}
                                >
                                    {entry.badge}
                                </div>
                            )}

                            {/* Score Card */}
                            <div className="text-right min-w-[80px]">
                                <p className="text-lg font-black text-white">
                                    {entry.interviewScore}
                                </p>
                                <p className="text-[10px] text-zinc-400">
                                    {entry.percentile}th percentile
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 bg-zinc-800/40 border border-white/10 rounded-lg p-4">
                <div className="text-center">
                    <p className="text-2xl font-black text-primary-100">4.2</p>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider">
                        Avg Score
                    </p>
                </div>
                <div className="text-center border-l border-r border-white/10">
                    <p className="text-2xl font-black text-primary-200">2.5K</p>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider">
                        Total Users
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-black text-green-400">+15%</p>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider">
                        This Week
                    </p>
                </div>
            </div>

            {/* CTA */}
            <button className="w-full bg-gradient-to-r from-primary-100 to-primary-200 text-black font-black py-3 rounded-lg hover:shadow-[0_0_30px_rgba(255,200,0,0.3)] transition-all">
                Practice & Climb Rankings
            </button>
        </div>
    );
};
