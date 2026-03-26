"use client";

import { useState, useEffect } from "react";
import { Users, Code, Rocket, Sparkles, Plus, ThumbsUp, MessageCircle, X, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getForumPosts, createForumPost, createForumReply, getStartups } from "@/lib/actions/community.action";
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

export default function CommunityPage() {
  const [forums, setForums] = useState<ForumPost[]>([]);
  const [startups, setStartups] = useState<StartupPitch[]>([]);
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
    const [postsRes, startupsRes] = await Promise.all([getForumPosts(), getStartups()]);
    setForums(postsRes);
    setStartups(startupsRes);
    setLoading(false);
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

      // Add the new post to the state immediately for real-time update
      const newPost: ForumPost = {
        id: res.id,
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

      // Reset form
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
      // Update local state to reflect the new reply immediately
      const newReply: Reply = {
        id: Date.now().toString(),
        content: replyContent,
        author: currentUser.name,
        authorId: currentUser.id,
        createdAt: new Date().toISOString()
      };

      setForums(prev => prev.map(post =>
        post.id === postId
          ? {
            ...post,
            replies: (post.replies || 0) + 1,
            repliesList: [...(post.repliesList || []), newReply]
          }
          : post
      ));

      setReplyingTo(null);
      setReplyContent("");
      toast.success("Reply added successfully!");
    } else {
      toast.error(res.error || "Failed to add reply");
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl animate-fadeIn relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold text-primary-100 flex items-center gap-3">
            Community Hub <Sparkles className="w-8 h-8 text-primary-200" />
          </h1>
          <p className="text-light-200 text-lg">Connect, learn, share code, and build the future together.</p>
        </div>
        <Button onClick={() => setShowPostModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Ask Question
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Forums */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="border-gradient p-0.5 rounded-2xl w-full">
            <div className="dark-gradient rounded-2xl p-6 relative overflow-hidden">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-light-400/10">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Code className="text-primary-200" /> Code Support & Doubts
                </h2>
                <div className="flex gap-2">
                  <span className="text-xs font-bold text-dark-100 bg-primary-100 px-3 py-1.5 rounded-full cursor-pointer">Hot</span>
                  <span className="text-xs font-bold text-light-200 bg-dark-200 hover:bg-dark-300 px-3 py-1.5 rounded-full cursor-pointer transition-colors">New</span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {loading ? <p className="text-light-200 text-center py-8 opacity-50">Loading discussions...</p> :
                  forums.length === 0 ? <p className="text-light-200 text-center py-8">No discussions yet. Start one!</p> :
                    forums.map((post) => (
                      <div key={post.id} className="bg-dark-300/50 p-4 rounded-xl border border-light-400/10 hover:border-primary-100/30 transition-colors">
                        <div className="flex gap-4 items-start">
                          <div className="flex flex-col items-center bg-dark-200 p-2 rounded-lg shrink-0 w-14">
                            <ThumbsUp className="w-4 h-4 text-light-200 mb-1 cursor-pointer hover:text-primary-100" />
                            <span className="text-primary-100 font-bold text-sm">{post.upvotes || 0}</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-white hover:text-primary-100 cursor-pointer transition-colors leading-tight mb-2">
                              {post.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-light-200 mb-3">
                              <span className="bg-primary-200/10 text-primary-200 px-2 py-0.5 rounded-md font-medium">{post.tag}</span>
                              <span>Posted by <strong className="text-light-100">{post.author}</strong></span>
                              <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {post.replies || 0} Replies</span>
                            </div>

                            {/* Reply Button */}
                            <div className="flex gap-2 mb-3">
                              <Button
                                onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                                variant="ghost"
                                size="sm"
                                className="text-primary-200 hover:text-primary-100 hover:bg-primary-200/10"
                              >
                                <Reply className="w-3 h-3 mr-1" />
                                Reply
                              </Button>
                            </div>

                            {/* Reply Form */}
                            {replyingTo === post.id && (
                              <div className="mb-4 p-3 bg-dark-200/50 rounded-lg border border-light-400/10">
                                <div className="flex gap-2">
                                  <Input
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder="Write your reply..."
                                    className="bg-dark-200 border-light-400/10 text-white flex-1"
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleCreateReply(post.id);
                                      }
                                    }}
                                  />
                                  <Button
                                    onClick={() => handleCreateReply(post.id)}
                                    size="sm"
                                    className="btn-primary"
                                  >
                                    Reply
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      setReplyingTo(null);
                                      setReplyContent("");
                                    }}
                                    variant="ghost"
                                    size="sm"
                                    className="text-light-400 hover:text-white"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* Replies */}
                            {post.repliesList && post.repliesList.length > 0 && (
                              <div className="space-y-3 mt-4">
                                <h4 className="text-sm font-semibold text-light-200">Replies:</h4>
                                {post.repliesList.map((reply) => (
                                  <div key={reply.id} className="bg-dark-200/30 p-3 rounded-lg border-l-2 border-primary-200/30">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-medium text-primary-200">{reply.author}</span>
                                      <span className="text-xs text-light-400">
                                        {new Date(reply.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p className="text-sm text-light-200">{reply.content}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                }
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Startup / Co-founder Matches */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="border-gradient p-0.5 rounded-2xl w-full h-full">
            <div className="bg-gradient-to-br from-dark-100 to-indigo-950/40 rounded-2xl p-6 h-full border border-indigo-500/10">
              <div className="mb-6 pb-4 border-b border-indigo-500/20">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Rocket className="text-indigo-400" /> Start-up Connect
                </h2>
                <p className="text-indigo-200/70 text-sm mt-1">Find co-founders with similar tech interests for your next big idea.</p>
              </div>

              <div className="flex flex-col gap-4">
                {loading ? <p className="text-indigo-300 text-center py-4 opacity-50 text-sm">Loading startups...</p> :
                  startups.length === 0 ? <p className="text-indigo-300 text-center py-4 text-sm">No pitches yet.</p> :
                    startups.map((startup) => (
                      <div key={startup.id} className="bg-dark-200/80 p-4 rounded-xl border border-indigo-500/20 hover:border-indigo-400/50 transition-colors">
                        <h3 className="font-bold text-white mb-1 leading-snug">{startup.title}</h3>
                        <p className="text-xs text-indigo-300 mb-3">Led by {startup.founder} • {startup.stage}</p>

                        <div className="mb-3">
                          <span className="text-xs text-light-200 block mb-1">Looking for:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {startup.roles?.map((role: string, i: number) => (
                              <span key={i} className="text-[10px] uppercase font-bold tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                                {role}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 text-xs">
                          <div className="flex items-center gap-1 text-light-200">
                            <Users className="w-3 h-3" /> {startup.members || 1} members
                          </div>
                          <button onClick={() => toast.success("Connection request sent!")} className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-3 py-1.5 rounded-lg transition-colors shadow-lg shadow-indigo-500/20">
                            Connect
                          </button>
                        </div>
                      </div>
                    ))
                }

                <Button onClick={() => setShowStartupModal(true)} className="w-full mt-2 bg-dark-300 hover:bg-dark-200 text-indigo-300 border border-indigo-500/20 font-semibold gap-2 transition-all hover:text-indigo-200">
                  <Rocket className="w-4 h-4" /> Pitch an Idea
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post Modal overlay */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
          <div className="bg-dark-300 border border-light-400/20 rounded-2xl w-full max-w-lg p-6 relative">
            <button onClick={() => setShowPostModal(false)} className="absolute top-4 right-4 text-light-400 hover:text-white"><X className="w-5 h-5" /></button>
            <h3 className="text-2xl font-bold text-white mb-6">Ask the Community</h3>
            <form onSubmit={handleCreatePost} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-bold text-light-100 mb-1 block">Question Title</label>
                <Input value={postTitle} onChange={e => setPostTitle(e.target.value)} placeholder="e.g. How to efficiently map through nested arrays in React?" className="bg-dark-200 border-light-400/10 text-white" />
              </div>
              <div>
                <label className="text-sm font-bold text-light-100 mb-1 block">Tag</label>
                <Input value={postTag} onChange={e => setPostTag(e.target.value)} placeholder="e.g. React, Systems Design, Advice" className="bg-dark-200 border-light-400/10 text-white" />
              </div>
              <Button type="submit" className="w-full btn-primary mt-2 flex items-center justify-center">Post Question</Button>
            </form>
          </div>
        </div>
      )}

      {/* Startup Modal overlay */}
      {showStartupModal && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
          <div className="bg-dark-300 border border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.1)] rounded-2xl w-full max-w-lg p-6 relative">
            <button onClick={() => setShowStartupModal(false)} className="absolute top-4 right-4 text-light-400 hover:text-white"><X className="w-5 h-5" /></button>
            <h3 className="text-2xl font-bold text-white mb-6">Pitch Startup Idea</h3>
            <form onSubmit={handleCreateStartup} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-bold text-light-100 mb-1 block">Project Title</label>
                <Input value={startupTitle} onChange={e => setStartupTitle(e.target.value)} placeholder="e.g. Decentralized Note-taking App" className="bg-dark-200 border-indigo-500/20 text-white focus:border-indigo-400" />
              </div>
              <div>
                <label className="text-sm font-bold text-light-100 mb-1 block">Roles Needed (comma separated)</label>
                <Input value={startupRoles} onChange={e => setStartupRoles(e.target.value)} placeholder="e.g. React Developer, Marketing, GenAI Engineer" className="bg-dark-200 border-indigo-500/20 text-white focus:border-indigo-400" />
              </div>
              <div>
                <label className="text-sm font-bold text-light-100 mb-1 block">Current Stage</label>
                <Input value={startupStage} onChange={e => setStartupStage(e.target.value)} placeholder="e.g. Ideation, MVP built, Raising Pre-seed" className="bg-dark-200 border-indigo-500/20 text-white focus:border-indigo-400" />
              </div>
              <button type="submit" className="w-full mt-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-indigo-500/20">Find Co-founders</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
