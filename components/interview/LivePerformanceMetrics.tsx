// components/interview/LivePerformanceMetrics.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
    Zap,
    TrendingUp,
    Volume2,
    Eye,
    Clock,
    Target,
    AlertCircle,
} from "lucide-react";

interface PerformanceMetrics {
    confidence: number;
    clarity: number;
    fillerWords: number;
    speakingPace: number;
    eyeContact: number;
    pauseTime: number;
    technicalAccuracy: number;
    engagement: number;
}

export const LivePerformanceMetrics = ({
    isLive = true,
}: {
    isLive?: boolean;
}) => {
    const [metrics, setMetrics] = useState<PerformanceMetrics>({
        confidence: 72,
        clarity: 8,
        fillerWords: 3,
        speakingPace: 8.5,
        eyeContact: 78,
        pauseTime: 2.3,
        technicalAccuracy: 85,
        engagement: 80,
    });

    // Simulate live updates
    useEffect(() => {
        if (!isLive) return;
        const interval = setInterval(() => {
            setMetrics((prev) => ({
                confidence: Math.min(100, prev.confidence + Math.random() * 3),
                clarity: Math.min(10, prev.clarity + Math.random() * 0.5),
                fillerWords: Math.max(
                    0,
                    prev.fillerWords + (Math.random() > 0.7 ? 1 : 0)
                ),
                speakingPace: Math.min(10, prev.speakingPace + Math.random() * 0.2),
                eyeContact: Math.min(100, prev.eyeContact + Math.random() * 2),
                pauseTime: Math.max(0, prev.pauseTime + (Math.random() - 0.5) * 0.2),
                technicalAccuracy: Math.min(
                    100,
                    prev.technicalAccuracy + Math.random() * 1
                ),
                engagement: Math.min(100, prev.engagement + Math.random() * 1.5),
            }));
        }, 2000);

        return () => clearInterval(interval);
    }, [isLive]);

    const MetricCard = ({
        icon: Icon,
        label,
        value,
        max = 100,
        suffix = "",
        warning = null,
    }: {
        icon: any;
        label: string;
        value: number;
        max?: number;
        suffix?: string;
        warning?: boolean;
    }) => {
        const percentage = (value / max) * 100;
        const isWarning = warning;

        return (
            <div className="bg-zinc-800/50 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-all">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Icon
                            className={`w-4 h-4 ${isWarning ? "text-red-400 animate-pulse" : "text-primary-100"
                                }`}
                        />
                        <p className="text-xs text-zinc-400 uppercase tracking-wider">
                            {label}
                        </p>
                    </div>
                    {isWarning && <AlertCircle className="w-4 h-4 text-red-400" />}
                </div>

                <div className="mb-2">
                    <p className="text-2xl font-black text-white">
                        {value.toFixed(1)}{suffix}
                    </p>
                </div>

                <div className="w-full bg-zinc-700/50 rounded-full h-1.5 overflow-hidden">
                    <div
                        className={`h-full transition-all duration-300 ${isWarning
                                ? "bg-gradient-to-r from-red-500 to-red-600"
                                : "bg-gradient-to-r from-primary-100 to-primary-200"
                            }`}
                        style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                </div>

                {isWarning && (
                    <p className="text-[10px] text-red-400 mt-2 font-semibold">
                        ⚠️ Action needed
                    </p>
                )}
            </div>
        );
    };

    return (
        <div className="w-full space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-xs font-black text-primary-100 uppercase tracking-wider">
                        Live Monitoring
                    </p>
                    <h3 className="text-xl font-black text-white uppercase">
                        Performance Metrics
                    </h3>
                </div>
                {isLive && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <p className="text-xs font-bold text-green-400">LIVE</p>
                    </div>
                )}
            </div>

            {/* Main Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <MetricCard
                    icon={TrendingUp}
                    label="Confidence"
                    value={metrics.confidence}
                    warning={metrics.confidence < 50}
                />
                <MetricCard
                    icon={Volume2}
                    label="Clarity"
                    value={metrics.clarity}
                    max={10}
                    suffix="/10"
                />
                <MetricCard
                    icon={Zap}
                    label="Filler Words"
                    value={metrics.fillerWords}
                    max={20}
                    warning={metrics.fillerWords > 10}
                />
                <MetricCard
                    icon={Clock}
                    label="Pace"
                    value={metrics.speakingPace}
                    max={10}
                    suffix="/10"
                />
                <MetricCard
                    icon={Eye}
                    label="Eye Contact"
                    value={metrics.eyeContact}
                    warning={metrics.eyeContact < 60}
                />
                <MetricCard
                    icon={Clock}
                    label="Pause Time"
                    value={metrics.pauseTime}
                    max={5}
                    suffix="s"
                />
                <MetricCard
                    icon={Target}
                    label="Tech Accuracy"
                    value={metrics.technicalAccuracy}
                />
                <MetricCard
                    icon={Zap}
                    label="Engagement"
                    value={metrics.engagement}
                />
            </div>

            {/* Overall Score */}
            <div className="bg-gradient-to-br from-primary-100/10 to-primary-200/5 border border-primary-100/20 rounded-lg p-6 text-center">
                <p className="text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">
                    Current Session Score
                </p>
                <p className="text-5xl font-black text-primary-100 mb-2">
                    {(
                        (metrics.confidence +
                            metrics.clarity * 10 +
                            metrics.technicalAccuracy +
                            metrics.engagement) /
                        4
                    ).toFixed(0)}
                </p>
                <div className="w-full bg-zinc-700/50 rounded-full h-2 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary-100 to-primary-200"
                        style={{
                            width: `${(
                                (metrics.confidence +
                                    metrics.clarity * 10 +
                                    metrics.technicalAccuracy +
                                    metrics.engagement) /
                                4
                            ) % 100}%`,
                        }}
                    />
                </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-sm text-blue-300 font-semibold">💡 Pro Tips</p>
                <ul className="text-xs text-zinc-300 mt-2 space-y-1">
                    {metrics.fillerWords > 5 && (
                        <li>• Reduce filler words - Take a breath instead of saying "um"</li>
                    )}
                    {metrics.eyeContact < 70 && (
                        <li>• Look at camera more frequently for better eye contact</li>
                    )}
                    {metrics.clarity < 7 && (
                        <li>• Speak more clearly - Slow down your pace slightly</li>
                    )}
                    {metrics.technicalAccuracy < 80 && (
                        <li>• Review technical concepts before continuing</li>
                    )}
                </ul>
            </div>
        </div>
    );
};
