"use client";

import React, { useState } from "react";
import { 
  CheckCircle, 
  Circle, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Trophy, 
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { CareerPath, CareerPathStep, UserLearningProgress } from "@/types/index";

interface RoadmapVisualizerProps {
  roadmap: CareerPath;
  progressData?: UserLearningProgress | null;
  onToggleStep?: (stepNumber: number, isCompleted: boolean) => void;
  isViewOnly?: boolean;
}

const RoadmapVisualizer: React.FC<RoadmapVisualizerProps> = ({ 
  roadmap, 
  progressData, 
  onToggleStep,
  isViewOnly = false
}) => {
  const [expandedStep, setExpandedStep] = useState<number | null>(1);

  const toggleExpand = (stepNumber: number) => {
    setExpandedStep(expandedStep === stepNumber ? null : stepNumber);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Roadmap Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          {roadmap.title}
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          {roadmap.description}
        </p>
        
        <div className="flex flex-wrap justify-center gap-6 mt-8">
          <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="text-blue-800 font-medium">{roadmap.totalDuration}</span>
          </div>
          <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
            <Trophy className="w-5 h-5 text-indigo-600" />
            <span className="text-indigo-800 font-medium">{roadmap.targetLevel} Level</span>
          </div>
        </div>
        
        {progressData && (
          <div className="mt-8 w-full max-w-md mx-auto">
            <div className="flex justify-between items-center mb-2">
               <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
               <span className="text-sm font-bold text-blue-600">{progressData.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
               <div 
                 className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-1000 ease-out" 
                 style={{ width: `${progressData.progress}%` }}
               ></div>
            </div>
          </div>
        )}
      </div>

      {/* Visual Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-4 bottom-4 w-1 bg-gradient-to-b from-blue-400 via-indigo-400 to-purple-400 rounded-full hidden md:block"></div>

        <div className="space-y-12">
          {roadmap.steps.sort((a, b) => a.stepNumber - b.stepNumber).map((step, index) => {
            const isCompleted = progressData ? step.stepNumber <= progressData.completedSteps : false;
            const isCurrent = progressData ? step.stepNumber === progressData.currentStep : index === 0;
            const isExpanded = expandedStep === step.stepNumber;

            return (
              <div key={step.id || index} className="relative md:pl-20">
                {/* Timeline Marker (Mobile) */}
                <div className="md:hidden flex items-center gap-3 mb-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    isCompleted ? "bg-green-500 border-green-500 text-white" : 
                    isCurrent ? "bg-blue-600 border-blue-600 text-white shadow-lg" : 
                    "bg-white border-gray-300 text-gray-400"
                  }`}>
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : <span>{step.stepNumber}</span>}
                  </div>
                  <h3 className={`text-xl font-bold ${isCompleted ? "text-green-700" : "text-gray-900"}`}>
                    {step.title}
                  </h3>
                </div>

                {/* Timeline Marker (Desktop) */}
                <div className={`absolute left-4 top-1 w-9 h-9 rounded-full hidden md:flex items-center justify-center border-4 border-white shadow-md z-10 transition-all duration-300 ${
                  isCompleted ? "bg-green-500 text-white" : 
                  isCurrent ? "bg-blue-600 text-white scale-110 shadow-indigo-200 shadow-xl" : 
                  "bg-gray-100 text-gray-400"
                }`}>
                  {isCompleted ? <CheckCircle className="w-6 h-6" /> : <span>{step.stepNumber}</span>}
                </div>

                {/* Step Card */}
                <div className={`bg-white rounded-2xl border transition-all duration-300 ${
                  isCurrent ? "border-blue-200 shadow-xl shadow-blue-50/50 ring-1 ring-blue-100" : 
                  isCompleted ? "border-green-100 bg-green-50/30" : 
                  "border-gray-100 shadow-sm"
                }`}>
                  <div 
                    className="p-6 cursor-pointer flex justify-between items-start"
                    onClick={() => toggleExpand(step.stepNumber)}
                  >
                    <div>
                      <div className="hidden md:block">
                        <h3 className={`text-2xl font-bold mb-2 ${isCompleted ? "text-green-800" : "text-gray-900"}`}>
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-gray-600 line-clamp-2 md:line-clamp-none">
                        {step.description}
                      </p>
                      
                      <div className="flex gap-4 mt-4">
                        <span className="flex items-center gap-1 text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          <Calendar className="w-3.5 h-3.5" />
                          {step.duration}
                        </span>
                        <span className="flex items-center gap-1 text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          <BookOpen className="w-3.5 h-3.5" />
                          {step.skills.length} Skills
                        </span>
                      </div>
                    </div>
                    
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="px-6 pb-6 pt-2 border-t border-gray-50 animate-in fade-in slide-in-from-top-2 duration-300">
                      {/* Skills Section */}
                      <div className="mb-6">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Skills to Master</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {step.skills.map((skill, si) => (
                            <div key={si} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-gray-800">{skill.name}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                  skill.level === "Advanced" ? "bg-purple-100 text-purple-700" :
                                  skill.level === "Intermediate" ? "bg-blue-100 text-blue-700" :
                                  "bg-green-100 text-green-700"
                                }`}>
                                  {skill.level}
                                </span>
                              </div>
                              <div className="space-y-2">
                                {skill.courses.map((course, ci) => (
                                  <a 
                                    key={ci} 
                                    href={course.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between text-sm bg-white p-2 rounded-lg border border-gray-100 hover:border-blue-300 hover:text-blue-600 transition-all"
                                  >
                                    <span className="truncate pr-2">{course.title}</span>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className="text-[10px] text-gray-400 uppercase font-bold">{course.provider}</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </div>
                                  </a>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Milestones Section */}
                      <div className="mb-6">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Milestones</h4>
                        <ul className="space-y-2">
                          {step.milestones.map((milestone, mi) => (
                            <li key={mi} className="flex items-start gap-3 text-gray-700">
                              <CheckCircle className={`w-5 h-5 shrink-0 mt-0.5 ${isCompleted ? "text-green-500" : "text-gray-300"}`} />
                              <span>{milestone}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Action Button */}
                      {!isViewOnly && (
                        <div className="flex justify-end pt-4 border-t border-gray-50">
                          <button
                            onClick={() => onToggleStep?.(step.stepNumber, !isCompleted)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
                              isCompleted ? 
                              "bg-green-100 text-green-700 hover:bg-green-200" : 
                              "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200"
                            }`}
                          >
                            {isCompleted ? "Mark as Incomplete" : "Mark Step as Completed"}
                            {!isCompleted && <ArrowRight className="w-5 h-5" />}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-16 p-8 bg-gradient-to-br from-gray-900 to-indigo-950 rounded-3xl text-white">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
             <MapPin className="w-12 h-12 text-blue-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2">Target Companies</h3>
            <div className="flex flex-wrap gap-2">
              {roadmap.targetCompanies.map((company, i) => (
                <span key={i} className="px-3 py-1 bg-white/10 rounded-lg text-sm font-medium border border-white/10">
                  {company}
                </span>
              ))}
            </div>
            <p className="mt-4 text-gray-300">
              This roadmap is curated based on industry standards and AI-driven insights to help you land a role at top tech firms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapVisualizer;
