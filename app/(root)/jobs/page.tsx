"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Search, MapPin, DollarSign, Clock, Building2, Loader2, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Job = {
  id: string;
  url: string;
  company_logo?: string;
  company_name: string;
  title: string;
  job_type: string;
  candidate_required_location?: string;
  salary?: string;
  publication_date: string;
  tags?: string[];
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [query, setQuery] = useState("");
  const [displayedCount, setDisplayedCount] = useState(12);

  useEffect(() => {
    fetchJobs(query);
  }, [query]);

  const fetchJobs = async (searchQuery: string) => {
    try {
      setLoading(true);
      const res = await fetch(`https://remotive.com/api/remote-jobs?category=software-dev${searchQuery ? `&search=${searchQuery}` : ''}&limit=50`);
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(searchTerm);
    setDisplayedCount(12);
  };

  const timeAgo = (dateStr: string) => {
    const hours = Math.abs(new Date().getTime() - new Date(dateStr).getTime()) / 36e5;
    if (hours < 24) return `${Math.floor(hours)}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="container mx-auto py-8 md:py-12 px-4 max-w-6xl animate-in fade-in duration-700">
      <div className="flex flex-col gap-2 mb-10">
        <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight">Live Tech Jobs</h1>
        <p className="text-zinc-500 text-base md:text-lg font-medium">Real-time remote software engineering roles sourced globally.</p>
      </div>

      <form onSubmit={handleSearch} className="bg-zinc-900 border border-white/5 p-6 md:p-10 rounded-[2rem] mb-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
          <div className="md:col-span-3 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-500 w-5 h-5" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search e.g. 'React', 'Python', 'Senior'"
              className="bg-zinc-950/50 border-white/5 pl-12 h-14 md:h-16 text-white placeholder:text-zinc-600 w-full text-lg rounded-xl focus:border-primary-100/50"
            />
          </div>
          <Button type="submit" className="h-14 md:h-16 w-full text-zinc-950 font-black text-sm md:text-base uppercase tracking-widest bg-primary-100 hover:bg-white transition-all shadow-xl shadow-primary-100/10 rounded-xl">
            Find Roles
          </Button>
        </div>
      </form>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center mb-2 px-1 border-b border-light-400/10 pb-4">
          <h2 className="text-white font-bold text-xl flex items-center gap-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin text-primary-100" /> : <div className="w-2 h-2 rounded-full bg-success-100 animate-pulse" />}
            {query ? `Results for "${query}"` : "Latest Remote Opportunities"}
          </h2>
          <span className="text-sm font-bold text-primary-100 bg-primary-100/10 px-3 py-1 rounded-full">{jobs.length} roles found</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 rounded-[2rem] bg-white/5 animate-pulse border border-white/5"></div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="py-20 text-center bg-zinc-900 border border-white/5 rounded-[2rem]">
            <p className="text-zinc-400 text-lg">No roles found matching your criteria. Try broader keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.slice(0, displayedCount).map((job) => (
              <div key={job.id} className="group border-gradient p-0.5 rounded-[2rem] transition-all duration-500 hover:-translate-y-2 flex flex-col h-full cursor-pointer" onClick={() => window.open(job.url, '_blank')}>
                <div className="bg-zinc-900 shadow-2xl rounded-[1.9rem] p-6 md:p-8 flex flex-col relative z-10 h-full justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="bg-zinc-950 p-3 rounded-2xl flex items-center justify-center border border-white/5 overflow-hidden w-16 h-16 shrink-0 shadow-inner group-hover:ring-4 ring-primary-100/10 transition-all">
                        {job.company_logo ? (
                          <Image src={job.company_logo} alt={job.company_name} width={64} height={64} className="w-full h-full object-contain" />
                        ) : (
                          <Building2 className="w-8 h-8 text-zinc-600" />
                        )}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary-100 bg-primary-100/10 px-3 py-1.5 rounded-full border border-primary-100/20">{job.job_type.split('_').join(' ')}</span>
                    </div>

                    <h3 className="text-xl font-black text-white group-hover:text-primary-100 transition-colors leading-tight mb-4 line-clamp-2 uppercase tracking-tight">{job.title}</h3>
                    <div className="flex flex-col gap-3 text-xs md:text-sm text-zinc-400 font-medium mb-8">
                      <span className="flex items-center gap-2 font-bold text-white uppercase tracking-wider text-[10px]"><Building2 className="w-4 h-4 text-primary-200" /> {job.company_name}</span>
                      <span className="flex items-center gap-2"><MapPin className="w-4 h-4 opacity-50" /> {job.candidate_required_location || "Worldwide"}</span>
                      {job.salary && <span className="flex items-center gap-2 text-emerald-400 font-bold"><DollarSign className="w-4 h-4" /> {job.salary}</span>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-auto">
                    <span className="flex items-center gap-2 text-[10px] text-zinc-500 font-black uppercase tracking-widest"><Clock className="w-3.5 h-3.5" /> Published {timeAgo(job.publication_date)}</span>
                    <Button variant="ghost" className="text-primary-100 hover:text-zinc-950 hover:bg-primary-100 flex items-center gap-2 h-10 px-4 rounded-full font-black uppercase text-[10px] tracking-widest transition-all">
                      Apply <LinkIcon className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {displayedCount < jobs.length && !loading && (
          <Button
            onClick={() => setDisplayedCount(prev => prev + 12)}
            variant="outline"
            className="mt-8 w-full py-6 border-dashed border-light-400/30 text-light-200 hover:text-white hover:border-primary-100/50 hover:bg-primary-100/5 transition-all font-bold text-lg"
          >
            Load 12 more roles...
          </Button>
        )}
      </div>
    </div>
  );
}
