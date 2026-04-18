"use client";

import { useState, useEffect } from "react";
import { Users, Code, Rocket, Sparkles, Plus, ThumbsUp, MessageCircle, X, Reply, Trophy, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  getForumPosts, 
  createForumPost, 
  createForumReply, 
  getStartups, 
  createStartupPitch, 
  getSharedTranscripts,
  applyToStartup,
  getReceivedApplications,
  getSentApplications,
  updateApplicationStatus
} from "@/lib/actions/community.action";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { toast } from "sonner";

type ForumPost = {
  id: string;
  title: string;
  tag: string;
  author: string;
  authorId?: string;
  upvotes?: number;
  replies?: number;
  repliesList?: Reply[];
  createdAt?: string;
};

type Reply = {
  id: string;
  content: string;
  author: string;
  authorId?: string;
  createdAt: string;
};

type StartupPitch = {
  id: string;
  title: string;
  founder: string;
  founderId: string;
  stage: string;
  roles: string[];
  description?: string;
  members?: number;
  createdAt?: string;
};

type StartupApplication = {
  id: string;
  startupId: string;
  startupTitle: string;
  founderId: string;
  founderName: string;
  applicantId: string;
  applicantName: string;
  status: "pending" | "accepted" | "rejected";
  jitsiRoom: string;
  createdAt: string;
};

interface SharedTranscript {
    id: string;
    role: string;
    userName: string;
    score: number;
    upvotes: number;
    createdAt: string;
}

export default function CommunityPage() {
  const [forums, setForums] = useState<ForumPost[]>([]);
  const [startups, setStartups] = useState<StartupPitch[]>([]);
  const [receivedApplications, setReceivedApplications] = useState<StartupApplication[]>([]);
  const [sentApplications, setSentApplications] = useState<StartupApplication[]>([]);
  const [sharedTranscripts, setSharedTranscripts] = useState<SharedTranscript[]>([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showStartupModal, setShowStartupModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);

  // Post form state
  const [postTitle, setPostTitle] = useState("");
  const [postTag, setPostTag] = useState("");

  // Reply state
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  // Startup form state
  const [startupTitle, setStartupTitle] = useState("");
  const [startupRoles, setStartupRoles] = useState("");
  const [startupStage, setStartupStage] = useState("");

  useEffect(() => {
    fetchData();
    fetchCurrentUser();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
        const [postsRes, startupsRes, sharedRes] = await Promise.all([
            getForumPosts(), 
            getStartups(), 
            getSharedTranscripts()
        ]);
        setForums(postsRes as ForumPost[]);
        setStartups(startupsRes as StartupPitch[]);
        setSharedTranscripts(sharedRes as SharedTranscript[]);

        const user = await getCurrentUser();
        if (user) {
            const [receivedRes, sentRes] = await Promise.all([
                getReceivedApplications(user.id),
                getSentApplications(user.id)
            ]);
            setReceivedApplications(receivedRes as StartupApplication[]);
            setSentApplications(sentRes as StartupApplication[]);
        }
    } catch (error) {
        console.error("Failed to fetch community data", error);
    } finally {
        setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    const user = await getCurrentUser();
    setCurrentUser(user);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle || !postTag || !currentUser) {
      if (!currentUser) {
        return toast.error("Please sign in to post");
      }
      return toast.error("Please fill required fields");
    }

    const res = await createForumPost({
      title: postTitle,
      tag: postTag,
      author: currentUser.name,
      authorId: currentUser.id,
      content: ""
    });

    if (res.success) {
      toast.success("Post created successfully!");
      const newPost: ForumPost = {
        id: res.id!,
        title: postTitle,
        tag: postTag,
        author: currentUser.name,
        authorId: currentUser.id,
        upvotes: 0,
        replies: 0,
        repliesList: [],
        createdAt: new Date().toISOString()
      };
      setForums(prev => [newPost, ...prev]);
      setShowPostModal(false);
      setPostTitle("");
      setPostTag("");
    }
  };

  const handleCreateReply = async (postId: string) => {
    if (!replyContent.trim() || !currentUser) {
      if (!currentUser) {
        return toast.error("Please sign in to reply");
      }
      return toast.error("Please enter a reply");
    }

    const res = await createForumReply(postId, {
      content: replyContent,
      author: currentUser.name,
      authorId: currentUser.id
    });

    if (res.success) {
      const newReply: Reply = {
        id: Date.now().toString(),
        content: replyContent,
        author: currentUser.name,
        authorId: currentUser.id,
        createdAt: new Date().toISOString()
      };
      setForums(prev => prev.map(post =>
        post.id === postId ? {
            ...post,
            replies: (post.replies || 0) + 1,
            repliesList: [...(post.repliesList || []), newReply]
          } : post
      ));
      setReplyingTo(null);
      setReplyContent("");
      toast.success("Reply added successfully!");
    } else {
      toast.error(res.error || "Failed to add reply");
    }
  };

  const handleCreateStartup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startupTitle || !startupRoles || !startupStage || !currentUser) {
      if (!currentUser) {
        return toast.error("Please sign in to pitch an idea");
      }
      return toast.error("Please fill all required fields");
    }

    const res = await createStartupPitch({
      title: startupTitle,
      founder: currentUser.name,
      founderId: currentUser.id,
      roles: startupRoles.split(",").map(role => role.trim()),
      stage: startupStage,
      description: ""
    });

    if (res.success) {
      toast.success("Startup pitch created successfully!");
      const newStartup: StartupPitch = {
        id: res.id!,
        title: startupTitle,
        founder: currentUser.name,
        founderId: currentUser.id,
        stage: startupStage,
        roles: startupRoles.split(",").map(role => role.trim()),
        members: 1,
        createdAt: new Date().toISOString()
      };
      setStartups(prev => [newStartup, ...prev]);
      setShowStartupModal(false);
      setStartupTitle("");
      setStartupRoles("");
      setStartupStage("");
    } else {
      toast.error(res.error || "Failed to create startup pitch");
    }
  };

  const handleApply = async (startup: StartupPitch) => {
    if (!currentUser) return toast.error("Please sign in to connect");
    if (currentUser.id === startup.founderId) return toast.error("You cannot apply to your own venture.");

    const res = await applyToStartup({
        startupId: startup.id,
        startupTitle: startup.title,
        founderId: startup.founderId,
        founderName: startup.founder,
        applicantId: currentUser.id,
        applicantName: currentUser.name,
      });

      if (res.success) {
        toast.success("Connection request sent to " + startup.founder);
        // Refresh sent applications locally
        const newApp: StartupApplication = {
            id: Date.now().toString(),
            startupId: startup.id,
            startupTitle: startup.title,
            founderId: startup.founderId,
            founderName: startup.founder,
            applicantId: currentUser.id,
            applicantName: currentUser.name,
            status: 'pending',
            jitsiRoom: `https://meet.jit.si/antigravity-connect-${startup.id}-${currentUser.id}`,
            createdAt: new Date().toISOString()
        };
        setSentApplications(prev => [newApp, ...prev]);
      } else {
        toast.error(res.error || "Failed to send request");
      }
  };

  const handleUpdateStatus = async (appId: string, status: "accepted" | "rejected") => {
    const res = await updateApplicationStatus(appId, status);
    if (res.success) {
        setReceivedApplications(prev => prev.map(app => 
            app.id === appId ? { ...app, status } : app
        ));
        toast.success(`Application ${status}`);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl animate-fadeIn relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black text-primary-100 flex items-center gap-3 tracking-tight uppercase">
            COMMUNITY HUB <Sparkles className="w-8 h-8 text-primary-200" />
          </h1>
          <p className="text-light-200 text-lg font-medium opacity-80">Connect, learn, share code, and build the future together.</p>
        </div>
        <Button onClick={() => setShowPostModal(true)} className="h-14 px-8 bg-primary-100 text-dark-100 font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary-100/10 hover:bg-white transition-all flex items-center gap-2">
          <Plus className="w-5 h-5" /> Ask Question
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Forums */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="border-gradient p-0.5 rounded-[2rem] w-full">
            <div className="bg-zinc-900 shadow-2xl rounded-[1.9rem] p-6 md:p-10 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100/5 blur-3xl rounded-full -mr-20 -mt-20"></div>

              <div className="flex justify-between items-center mb-10 pb-6 border-b border-light-400/10 relative z-10">
                <h2 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-tight">
                  <Code className="text-primary-100 w-8 h-8" /> Code & Discussion
                </h2>
                <div className="flex gap-2">
                  <span className="text-[10px] font-black text-dark-100 bg-primary-100 px-4 py-2 rounded-full cursor-pointer uppercase tracking-widest">Hot</span>
                  <span className="text-[10px] font-black text-light-200 bg-dark-200 hover:bg-dark-300 px-4 py-2 rounded-full cursor-pointer transition-colors uppercase tracking-widest border border-white/5">New</span>
                </div>
              </div>

              <div className="flex flex-col gap-6 relative z-10">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 animate-pulse rounded-2xl border border-white/5"></div>)}
                    </div>
                ) : forums.length === 0 ? (
                    <div className="py-20 text-center bg-dark-200/30 rounded-3xl border border-dashed border-white/10">
                        <p className="text-zinc-500 font-bold uppercase tracking-widest">No discussions yet. Start the first one!</p>
                    </div>
                ) : (
                    forums.map((post) => (
                      <div key={post.id} className="bg-dark-300/40 p-6 rounded-2xl border border-light-400/10 hover:border-primary-100/30 transition-all group">
                        <div className="flex gap-6 items-start">
                          <div className="flex flex-col items-center bg-dark-200 p-3 rounded-2xl shrink-0 w-16 border border-white/5">
                            <ThumbsUp className="w-5 h-5 text-light-200 mb-2 cursor-pointer hover:text-primary-100 transition-colors" />
                            <span className="text-primary-100 font-black text-lg">{post.upvotes || 0}</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-black text-white group-hover:text-primary-100 cursor-pointer transition-colors leading-tight mb-3 uppercase tracking-tight">
                              {post.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-4 text-[10px] text-light-400 mb-4 font-black uppercase tracking-widest">
                              <span className="bg-primary-100/10 text-primary-100 px-3 py-1 rounded-lg border border-primary-100/20">{post.tag}</span>
                              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {post.author}</span>
                              <span className="flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" /> {post.replies || 0} REPLIES</span>
                            </div>

                            <Button
                                onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                                variant="ghost"
                                size="sm"
                                className="h-10 px-4 text-primary-100 hover:text-white hover:bg-primary-100/10 rounded-xl font-black uppercase tracking-widest border border-primary-100/10"
                            >
                                <Reply className="w-4 h-4 mr-2" /> Reply
                            </Button>

                            {replyingTo === post.id && (
                              <div className="mt-4 p-4 bg-dark-200/50 rounded-2xl border border-light-400/10 animate-in slide-in-from-top-2">
                                <div className="flex gap-3">
                                  <Input
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder="Add your contribution..."
                                    className="bg-dark-200 border-white/5 text-white flex-1 h-12 rounded-xl focus:border-primary-100/50"
                                  />
                                  <Button onClick={() => handleCreateReply(post.id)} className="bg-white text-dark-100 font-black uppercase tracking-widest px-6 rounded-xl hover:bg-primary-100 transition-all">
                                    Send
                                  </Button>
                                </div>
                              </div>
                            )}

                            {post.repliesList && post.repliesList.length > 0 && (
                              <div className="space-y-4 mt-8 pt-6 border-t border-white/5">
                                {post.repliesList.map((reply) => (
                                  <div key={reply.id} className="bg-dark-200/20 p-4 rounded-2xl border-l-4 border-primary-100/30">
                                    <div className="flex items-center gap-3 mb-2">
                                      <span className="text-[11px] font-black text-primary-100 uppercase tracking-widest">{reply.author}</span>
                                      <span className="text-[10px] font-bold text-zinc-500">{new Date(reply.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-light-200 font-medium leading-relaxed">{reply.content}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Hall of Fame & Startup */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Interview Hall of Fame */}
          <div className="border-gradient p-0.5 rounded-[2rem] w-full">
            <div className="bg-zinc-900 shadow-2xl rounded-[1.9rem] p-6 md:p-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 blur-2xl rounded-full -mr-10 -mt-10"></div>
              
              <div className="mb-8 pb-4 border-b border-amber-500/20 flex items-center justify-between relative z-10">
                <h2 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-tight">
                  <Trophy className="w-6 h-6 text-amber-400" /> Hall of Fame
                </h2>
                <span className="text-[9px] font-black text-amber-200 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 uppercase tracking-widest">Verified</span>
              </div>
              
              <div className="space-y-4 relative z-10">
                {sharedTranscripts.length === 0 ? (
                  <p className="text-amber-200/50 text-center py-6 text-[10px] font-black uppercase tracking-widest border border-dashed border-amber-500/10 rounded-2xl">No elite transcripts shared yet.</p>
                ) : (
                  sharedTranscripts.map((item, i) => (
                    <div key={item.id} className="bg-dark-200/80 p-5 rounded-2xl border border-amber-500/10 hover:border-amber-400/40 hover:bg-dark-300 transition-all cursor-pointer group">
                       <div className="flex justify-between items-start mb-2">
                          <h4 className="text-xs font-black text-white group-hover:text-amber-200 transition-colors uppercase tracking-tight leading-tight">{item.role}</h4>
                          <span className="text-sm font-black text-amber-400">{item.score}%</span>
                       </div>
                       <div className="flex items-center justify-between text-[10px] text-zinc-500 uppercase font-black tracking-widest">
                          <span className="truncate max-w-[120px]">Candidate: {item.userName}</span>
                          <span className="flex items-center gap-1 text-amber-200/50"><ThumbsUp className="w-3 h-3" /> {item.upvotes || 0}</span>
                       </div>
                    </div>
                  ))
                )}
              </div>
              <Button className="w-full h-12 mt-6 bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">
                 Share Elite Session
              </Button>
            </div>
          </div>

          <div className="border-gradient p-0.5 rounded-[2rem] w-full">
            <div className="bg-zinc-900 shadow-2xl rounded-[1.9rem] p-6 md:p-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-2xl rounded-full -mr-10 -mt-10"></div>

              <div className="mb-8 pb-4 border-b border-indigo-500/20 relative z-10">
                <h2 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-tight">
                  <Rocket className="text-indigo-400 w-6 h-6" /> Start-up Connect
                </h2>
                <p className="text-indigo-200/50 text-[10px] font-bold mt-2 uppercase tracking-widest">Co-founder matching suite</p>
              </div>

              <div className="flex flex-col gap-4 relative z-10">
                {loading ? <p className="text-indigo-300 text-center py-4 text-[10px] font-bold uppercase animate-pulse">Scanning network...</p> :
                  startups.length === 0 ? <p className="text-indigo-300 text-center py-6 text-[10px] font-black uppercase border border-dashed border-indigo-500/10 rounded-2xl tracking-widest">No active pitches found.</p> :
                    startups.map((startup) => (
                      <div key={startup.id} className="bg-dark-200/80 p-5 rounded-2xl border border-indigo-500/10 hover:border-indigo-400/40 transition-all group">
                        <h3 className="font-black text-white mb-2 leading-tight uppercase tracking-tight">{startup.title}</h3>
                        <p className="text-[10px] text-indigo-300 mb-4 font-bold uppercase tracking-widest">Lead: {startup.founder} • {startup.stage}</p>

                        <div className="flex flex-wrap gap-2">
                           {startup.roles?.map((role: string, i: number) => (
                             <span key={i} className="text-[9px] uppercase font-black tracking-widest bg-dark-300 text-indigo-200 border border-indigo-500/20 px-2 py-1 rounded-lg">
                               {role}
                             </span>
                           ))}
                        </div>

                        <div className="flex items-center justify-between mt-6 text-[10px] font-black uppercase tracking-widest">
                          <div className="flex items-center gap-1.5 text-zinc-500">
                            <Users className="w-3.5 h-3.5" /> {startup.members || 1}
                          </div>
                          <button 
                            onClick={() => handleApply(startup)} 
                            className="bg-white text-dark-100 px-4 py-2 rounded-xl hover:bg-indigo-400 hover:text-white transition-all duration-300 shadow-lg shadow-indigo-500/10"
                          >
                            Sync
                          </button>
                        </div>
                      </div>
                    ))
                }

                <Button onClick={() => setShowStartupModal(true)} className="w-full h-12 mt-2 bg-dark-300 hover:bg-dark-200 text-indigo-400 border border-indigo-500/10 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">
                  <Rocket className="w-4 h-4 mr-2" /> Pitch Innovation
                </Button>

                {receivedApplications.length > 0 && (
                   <div className="mt-10 pt-8 border-t border-indigo-500/20">
                      <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                         <MessageCircle className="w-4 h-4" /> Founder Inbox
                      </h4>
                      <div className="space-y-4">
                         {receivedApplications.map(app => (
                            <div key={app.id} className="bg-dark-300/50 p-5 rounded-2xl border border-white/5 relative group/app">
                               <div className="flex justify-between items-start mb-2">
                                  <span className="text-[9px] font-black text-white uppercase tracking-widest">{app.applicantName}</span>
                                  <span className={cn(
                                    "text-[8px] px-2 py-0.5 rounded uppercase font-bold",
                                    app.status === 'pending' ? 'bg-amber-500/20 text-amber-500' : 
                                    app.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'
                                  )}>{app.status}</span>
                               </div>
                               <p className="text-[11px] font-black text-indigo-200/50 uppercase tracking-tight mb-4">Applied to: {app.startupTitle}</p>
                               
                               {app.status === 'pending' ? (
                                  <div className="flex gap-2">
                                     <button onClick={() => handleUpdateStatus(app.id, 'accepted')} className="flex-1 py-2 bg-emerald-500 text-white text-[9px] font-black rounded-lg uppercase tracking-widest hover:bg-emerald-600 transition-colors">Accept</button>
                                     <button onClick={() => handleUpdateStatus(app.id, 'rejected')} className="flex-1 py-2 bg-white/5 text-zinc-500 text-[9px] font-black rounded-lg uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 transition-colors">Decline</button>
                                  </div>
                               ) : app.status === 'accepted' ? (
                                  <a href={app.jitsiRoom} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 py-3 bg-white text-dark-100 text-[9px] font-black rounded-xl uppercase tracking-widest hover:bg-indigo-400 hover:text-white transition-all group-hover/app:shadow-lg group-hover/app:shadow-indigo-500/20">
                                     <Video className="w-3.5 h-3.5" /> Join Interview
                                  </a>
                               ) : null}
                            </div>
                         ))}
                      </div>
                   </div>
                )}

                {sentApplications.length > 0 && (
                    <div className="mt-10 pt-8 border-t border-indigo-500/20">
                        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-6">Sent Requests</h4>
                        <div className="space-y-4">
                            {sentApplications.map(app => (
                                <div key={app.id} className="bg-dark-300/20 p-4 rounded-2xl border border-white/5">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-[11px] font-black text-white uppercase">{app.startupTitle}</p>
                                        <span className={cn(
                                            "text-[7px] px-1.5 py-0.5 rounded font-bold uppercase",
                                            app.status === 'pending' ? 'text-amber-500 border border-amber-500/20' : 
                                            app.status === 'accepted' ? 'bg-emerald-500 text-white' : 'text-red-500 border border-red-500/20'
                                        )}>{app.status}</span>
                                    </div>
                                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Founder: {app.founderName}</p>
                                    
                                    {app.status === 'accepted' && (
                                        <a href={app.jitsiRoom} target="_blank" rel="noreferrer" className="mt-4 block text-center py-2 bg-indigo-500 text-white text-[9px] font-black rounded-lg uppercase tracking-widest hover:bg-indigo-600 transition-all">
                                            Join Interview
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post Modal overlay */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex justify-center items-center z-50 p-4">
          <div className="bg-dark-300 border border-white/5 shadow-2xl rounded-[2rem] w-full max-w-lg p-8 md:p-10 relative overflow-hidden animate-in zoom-in duration-300">
            <div className="absolute top-0 right-0 p-10 bg-primary-100/5 blur-[100px] rounded-full pointer-events-none"></div>
            <button onClick={() => setShowPostModal(false)} className="absolute top-6 right-6 text-light-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full"><X className="w-5 h-5" /></button>
            <h3 className="text-3xl font-black text-white mb-8 uppercase tracking-tight">Ask Community</h3>
            <form onSubmit={handleCreatePost} className="flex flex-col gap-6 relative z-10">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-light-400 ml-1">Question Title</label>
                <Input value={postTitle} onChange={e => setPostTitle(e.target.value)} placeholder="Topic of discussion..." className="bg-dark-200/50 border-white/5 text-white h-14 rounded-xl focus:border-primary-100/50 px-5" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-light-400 ml-1">Tag (Dev, AI, PM...)</label>
                <Input value={postTag} onChange={e => setPostTag(e.target.value)} placeholder="Category..." className="bg-dark-200/50 border-white/5 text-white h-14 rounded-xl focus:border-primary-100/50 px-5" />
              </div>
              <Button type="submit" className="w-full h-14 bg-primary-100 text-dark-100 font-black uppercase tracking-widest rounded-xl md:rounded-2xl transition-all duration-500 shadow-xl shadow-primary-100/20">
                 Finalize Broadcast
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Startup Modal overlay */}
      {showStartupModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex justify-center items-center z-50 p-4 animate-in zoom-in duration-300">
          <div className="bg-dark-300 border border-indigo-500/20 shadow-2xl rounded-[2rem] w-full max-w-lg p-8 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none"></div>
            <button onClick={() => setShowStartupModal(false)} className="absolute top-6 right-6 text-light-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full"><X className="w-5 h-5" /></button>
            <h3 className="text-3xl font-black text-white mb-8 uppercase tracking-tight leading-tight">Pitch <br/><span className="text-indigo-400">Innovation</span></h3>
            <form onSubmit={handleCreateStartup} className="flex flex-col gap-6 relative z-10">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-light-400 ml-1">Venture Name</label>
                <Input value={startupTitle} onChange={e => setStartupTitle(e.target.value)} placeholder="Project title..." className="bg-dark-200/50 border-indigo-500/20 text-white h-14 rounded-xl focus:border-indigo-400 px-5" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-light-400 ml-1">Open Roles (comma separated)</label>
                <Input value={startupRoles} onChange={e => setStartupRoles(e.target.value)} placeholder="Developer, Designer..." className="bg-dark-200/50 border-indigo-500/20 text-white h-14 rounded-xl focus:border-indigo-400 px-5" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-light-400 ml-1">Venture Stage</label>
                <Input value={startupStage} onChange={e => setStartupStage(e.target.value)} placeholder="Ideation, MVP, Scale..." className="bg-dark-200/50 border-indigo-500/20 text-white h-14 rounded-xl focus:border-indigo-400 px-5" />
              </div>
              <Button type="submit" className="w-full h-14 bg-indigo-500 text-white font-black uppercase tracking-widest rounded-xl md:rounded-2xl transition-all duration-500 shadow-xl shadow-indigo-500/20">
                 Find Co-founders
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
