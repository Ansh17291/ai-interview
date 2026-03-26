"use client";

import { useState, useEffect } from "react";
import { Video, Star, Clock, Globe, Briefcase, GraduationCap, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { toast } from "sonner";
import { bookMentor, getUserBookings } from "@/lib/actions/community.action";
import { getCurrentUser } from "@/lib/actions/auth.action";
import Link from "next/link";

type Mentor = {
  id: number;
  name: string;
  role: string;
  company: string;
  rating: string;
  reviews: number;
  price: string;
  img: string;
  tags: string[];
  nextAvailable: string;
};

const mentors: Mentor[] = [
  { id: 1, name: "Dr. Sarah Chen", role: "AI Research Scientist", company: "Google DeepMind", rating: "4.9", reviews: 124, price: "Free", img: "/adobe.png", tags: ["Machine Learning", "Interviews", "Career Advice"], nextAvailable: "Today" },
  { id: 2, name: "Marcus Johnson", role: "Sr. Engineering Manager", company: "Meta", rating: "5.0", reviews: 89, price: "$20/hr", img: "/facebook.png", tags: ["System Design", "Leadership", "React"], nextAvailable: "Tomorrow" },
  { id: 3, name: "Priya Patel", role: "Product Manager", company: "Amazon", rating: "4.8", reviews: 201, price: "Free", img: "/amazon.png", tags: ["Resume Review", "Mock Interviews", "Product Sense"], nextAvailable: "In 2 days" },
];

export default function MentorshipPage() {
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userBookings, setUserBookings] = useState<MentorBooking[]>([]);
  const [bookingLoading, setBookingLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMentors = mentors.filter(mentor => 
    mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    const loadUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);

      if (user) {
        setBookingLoading(true);
        const bookings = await getUserBookings(user.id);
        setUserBookings(bookings as MentorBooking[]);
        setBookingLoading(false);
      } else {
        setBookingLoading(false);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const interval = setInterval(async () => {
      const bookings = await getUserBookings(currentUser.id);
      setUserBookings(bookings as MentorBooking[]);
    }, 10000); // poll every 10 seconds for instant updates

    return () => clearInterval(interval);
  }, [currentUser]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error("Please sign in to book a mentor session.");
      return;
    }

    if (!selectedMentor) return;
    if (!topic) return toast.error("Please provide a topic for the session.");

    setLoading(true);
    const res = await bookMentor({
      mentorId: selectedMentor.id,
      mentorName: selectedMentor.name,
      userId: currentUser.id,
      userName: currentUser.name,
      date: selectedMentor.nextAvailable,
      topic,
    });
    setLoading(false);
    if (res.success) {
      toast.success(`Successfully booked a session with ${selectedMentor.name}!`);
      setSelectedMentor(null);
      setTopic("");

      // refresh user bookings after creation
      if (currentUser) {
        const bookings = await getUserBookings(currentUser.id);
        setUserBookings(bookings as MentorBooking[]);
      }
    } else {
      toast.error("Failed to book session.");
    }
  };

  const handleJoinCall = (room: string) => {
    window.open(room, "_blank");
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl animate-fadeIn relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-5xl font-black text-primary-100 flex items-center gap-3 tracking-tight">
            CAREER MENTORSHIP <GraduationCap className="w-8 h-8 md:w-10 md:h-10 text-primary-200" />
          </h1>
          <p className="text-light-200 text-base md:text-lg font-medium max-w-2xl">Confused about your career path? Talk 1-on-1 with industry experts over video call.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/mentorship/mentor-login" className="btn btn-primary">
            Mentor Login
          </Link>
          <Link href="/mentorship/mentor" className="btn btn-outline">
            Mentor Dashboard
          </Link>
        </div>
      </div>

      <div className="dark-gradient border border-light-400/20 p-6 md:p-12 rounded-[2rem] mb-12 relative overflow-hidden flex flex-col items-center text-center">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-primary-100/5 blur-[100px] rounded-full pointer-events-none"></div>
        <h2 className="text-xl md:text-3xl font-black text-white mb-4 z-10 relative uppercase tracking-tight">Need personalized guidance?</h2>
        <p className="text-light-200 text-sm md:text-base max-w-2xl mb-8 z-10 relative font-medium">
          Use IntelliCoach Mentors to instantly book video sessions. Whether you want a resume review, system design architecture discussion, or just generic career advice from people who have cracked top FAANG companies.
        </p>
        <div className="flex flex-wrap justify-center gap-4 z-10 relative">
          <div className="bg-dark-200/80 backdrop-blur-sm border border-light-400/10 px-6 py-3 rounded-full flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-success-100 animate-pulse"></span>
            <span className="text-success-100 font-black text-xs md:text-sm uppercase tracking-wider">14 Mentors Online Right Now</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">Top Mentors for You</h3>
        <div className="relative w-full md:w-80 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Globe className="w-4 h-4 text-primary-100/50 group-focus-within:text-primary-100 transition-colors" />
          </div>
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, role or tech..." 
            className="pl-12 bg-dark-200/50 border-white/5 text-white focus:border-primary-100/50 h-12 rounded-xl"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {filteredMentors.length > 0 ? (
          filteredMentors.map((mentor) => (
          <div key={mentor.id} className="group border-gradient p-0.5 rounded-[1.5rem] md:rounded-[2rem] transition-all duration-500 hover:-translate-y-2">
            <div className="bg-dark-300 rounded-[1.4rem] md:rounded-[1.9rem] p-5 md:p-8 h-full flex flex-col">
              <div className="flex items-start gap-4 mb-6">
                <Image src={mentor.img} alt={mentor.company} width={60} height={60} className="rounded-2xl object-contain bg-white p-2 shrink-0 shadow-lg" />
                <div>
                  <h4 className="font-black text-white text-lg md:text-xl leading-tight group-hover:text-primary-100 transition-colors uppercase tracking-tight">{mentor.name}</h4>
                  <p className="text-xs md:text-sm text-light-200 flex items-center gap-1 mt-1 font-bold uppercase tracking-wider"><Briefcase className="w-3 h-3 text-primary-200 shrink-0" /> {mentor.role}</p>
                  <p className="text-[10px] md:text-xs text-light-400 font-black uppercase tracking-widest opacity-60">@ {mentor.company}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6 border-b border-light-400/5 pb-6">
                <div className="flex items-center gap-1 bg-dark-200 px-3 py-1.5 rounded-lg border border-white/5">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                  <span className="text-sm font-black text-white">{mentor.rating}</span>
                  <span className="text-[10px] text-light-400 font-bold ml-1">({mentor.reviews})</span>
                </div>
                <div className="text-xs font-black text-primary-200 flex items-center gap-1 uppercase tracking-widest">
                  <Globe className="w-3.5 h-3.5" /> English
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8 flex-1">
                {mentor.tags.map(tag => (
                  <span key={tag} className="text-[10px] uppercase font-black tracking-widest bg-dark-200 border border-light-400/10 text-light-100 px-3 py-1.5 rounded-lg group-hover:bg-primary-100/5 group-hover:border-primary-100/20 transition-colors">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between mt-auto pt-6 border-t border-light-400/5 relative z-10 gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-light-400 uppercase font-black tracking-widest mb-1">Next available</span>
                  <span className="text-xs md:text-sm font-black text-white flex items-center gap-1.5 uppercase"><Clock className="w-3.5 h-3.5 text-success-100" />{mentor.nextAvailable}</span>
                </div>
                <Button onClick={() => setSelectedMentor(mentor)} className="h-12 md:h-14 px-6 md:px-8 bg-primary-100 text-dark-100 hover:bg-white text-xs md:text-sm font-black uppercase tracking-widest rounded-xl md:rounded-2xl transition-all duration-500 shadow-xl shadow-primary-100/10">
                  <Video className="w-4 h-4 mr-2" /> Book
                </Button>
              </div>
            </div>
          </div>
        ))
        ) : (
          <div className="col-span-full py-20 text-center bg-dark-200/30 rounded-[2rem] border border-dashed border-white/10">
            <p className="text-zinc-500 font-bold uppercase tracking-widest">No mentors found matching your search.</p>
          </div>
        )}
      </div>

      <div className="mt-10 border border-white/5 rounded-[2.5rem] p-6 md:p-10 bg-zinc-900/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-20 bg-primary-100/5 blur-[100px] rounded-full pointer-events-none"></div>
        <h3 className="text-2xl md:text-3xl font-black text-white mb-8 uppercase tracking-tight">Your Mentorship Sessions</h3>
        {bookingLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse border border-white/5"></div>
            ))}
          </div>
        ) : userBookings.length === 0 ? (
          <p className="text-light-200">You have no booked sessions yet. Choose a mentor above to schedule.</p>
        ) : (
          <div className="space-y-4">
            {userBookings.map((booking) => (
              <div key={booking.id} className="border border-light-400/20 bg-dark-300 rounded-xl p-4">
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <p className="text-sm text-light-200">Mentor: <strong className="text-white">{booking.mentorName}</strong></p>
                    <p className="text-sm text-light-200">Topic: <strong className="text-white">{booking.topic}</strong></p>
                    <p className="text-sm text-light-200">Time: <strong className="text-white">{booking.date}</strong></p>
                    <p className="text-sm text-light-200">Status: <strong className="text-primary-100">{booking.status}</strong></p>
                  </div>
                  <div className="flex flex-col gap-2 text-right">
                    {booking.status === "InProgress" && (
                      <Button size="sm" className="btn-primary" onClick={() => handleJoinCall(booking.room)}>
                        Join live session
                      </Button>
                    )}
                    {booking.status === "Scheduled" && (
                      <span className="text-xs text-light-300">Waiting for mentor to start the meeting.</span>
                    )}
                    {booking.status === "Completed" && (
                      <span className="text-xs text-success-100">Session completed.</span>
                    )}
                  </div>
                </div>

                {booking.mentorMessage && (
                  <div className="mt-3 p-3 bg-dark-400 border border-light-400/20 rounded-lg">
                    <p className="text-xs text-light-300 mb-1">Mentor note:</p>
                    <p className="text-sm text-light-100">{booking.mentorMessage}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal overlay */}
      {selectedMentor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex justify-center items-center z-50 p-4 animate-in fade-in zoom-in duration-300">
          <div className="bg-dark-300 border border-white/5 shadow-2xl rounded-[2rem] w-full max-w-lg p-6 md:p-10 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-10 bg-primary-100/5 blur-[100px] rounded-full pointer-events-none"></div>

            <button onClick={() => setSelectedMentor(null)} className="absolute top-6 right-6 text-light-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full"><X className="w-5 h-5" /></button>

            <div className="flex items-center gap-5 mb-8 pb-8 border-b border-white/5">
              <div className="bg-white p-2 rounded-2xl shadow-xl">
                <Image src={selectedMentor.img} alt="logo" width={56} height={56} className="rounded-lg" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">Book Session</h3>
                <p className="text-sm text-primary-200 font-bold uppercase tracking-wider">{selectedMentor.name}</p>
              </div>
            </div>

            <form onSubmit={handleBook} className="flex flex-col gap-6 relative z-10">
              <div className="bg-dark-200/50 p-5 rounded-[1.5rem] border border-white/5 space-y-3">
                <div className="flex justify-between items-center"><span className="text-xs font-black uppercase tracking-widest text-light-400">Date & Time</span> <strong className="text-sm font-black text-white uppercase tracking-tight">{selectedMentor.nextAvailable}</strong></div>
                <div className="flex justify-between items-center"><span className="text-xs font-black uppercase tracking-widest text-light-400">Duration</span> <strong className="text-sm font-black text-white uppercase tracking-tight">45 minutes</strong></div>
                <div className="flex justify-between items-center pt-3 border-t border-white/5"><span className="text-xs font-black uppercase tracking-widest text-light-400">Price</span> <strong className="text-sm font-black text-success-100 uppercase tracking-tight">{selectedMentor.price}</strong></div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-light-200 ml-1">What do you want to discuss?</label>
                <Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Mock Interview for System Design" className="bg-dark-200/50 border-white/5 text-white focus:border-primary-100/50 h-14 rounded-xl px-5" />
              </div>

              <Button type="submit" disabled={loading} className="w-full mt-2 bg-primary-100 hover:bg-white text-dark-100 font-black py-4 h-auto rounded-xl md:rounded-2xl transition-all duration-500 shadow-xl shadow-primary-100/20 flex items-center justify-center gap-2 uppercase tracking-widest text-sm">
                {loading ? "Scheduling..." : <><CheckCircle2 className="w-5 h-5" /> Confirm Booking</>}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
