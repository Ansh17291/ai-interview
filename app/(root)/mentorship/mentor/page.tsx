"use client";

import { useEffect, useState } from "react";
import { getMentorBookings, updateBookingStatus, sendMentorMessage } from "@/lib/actions/community.action";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function MentorDashboardPage() {
    const [isMentorLoggedIn, setIsMentorLoggedIn] = useState(false);
    const [bookings, setBookings] = useState<MentorBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeRoomUrl, setActiveRoomUrl] = useState<string>("");
    const [mentorNotes, setMentorNotes] = useState<Record<string, string>>({});

    useEffect(() => {
        const load = async () => {
            const auth = window.localStorage.getItem("prepwise_mentor_logged_in");
            const mentorLoggedIn = auth === "true";
            setIsMentorLoggedIn(mentorLoggedIn);

            if (!mentorLoggedIn) {
                setLoading(false);
                return;
            }

            const results = await getMentorBookings();
            setBookings(results as MentorBooking[]);
            setLoading(false);
        };

        load();
    }, []);

    const handleStartCall = async (booking: MentorBooking) => {
        setActiveRoomUrl(booking.room);
        await updateBookingStatus(booking.id, "InProgress");
        setBookings((prev) =>
            prev.map((item) => (item.id === booking.id ? { ...item, status: "InProgress" } : item))
        );
    };

    const handleComplete = async (booking: MentorBooking) => {
        await updateBookingStatus(booking.id, "Completed");
        setBookings((prev) =>
            prev.map((item) => (item.id === booking.id ? { ...item, status: "Completed" } : item))
        );
        toast.success("Session marked as completed.");
    };

    const handleSendMentorMessage = async (booking: MentorBooking) => {
        const message = mentorNotes[booking.id]?.trim();
        if (!message) return toast.error("Please enter a message before sending.");

        const response = await sendMentorMessage(booking.id, message);
        if (response.success) {
            toast.success("Mentor message sent to the learner.");
            setBookings((prev) =>
                prev.map((item) =>
                    item.id === booking.id ? { ...item, mentorMessage: message } : item
                )
            );
            setMentorNotes((prev) => ({ ...prev, [booking.id]: "" }));
        } else {
            toast.error("Unable to send message.");
        }
    };

    if (loading) return <p className="text-light-200 p-10">Loading mentor requests...</p>;

    if (!isMentorLoggedIn) {
        return (
            <div className="p-10 text-light-200">
                <h2 className="text-2xl font-bold mb-4">Mentor login required</h2>
                <p>To access this dashboard, please login as a mentor via <a className="text-primary-100 underline" href="/mentorship/mentor-login">Mentor Login</a>.</p>
            </div>
        );
    }

    const handleLogout = () => {
        window.localStorage.removeItem("prepwise_mentor_logged_in");
        setIsMentorLoggedIn(false);
        window.location.href = "/mentorship/mentor-login";
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-6xl">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-primary-100">Mentor Dashboard</h1>
                <Button variant="outline" onClick={handleLogout}>Logout</Button>
            </div>
            <p className="text-light-200 mb-8">Here are your latest session requests.</p>

            <div className="grid grid-cols-1 gap-4">
                {bookings.length === 0 ? (
                    <p className="text-light-200">No session requests yet.</p>
                ) : (
                    bookings.map((b) => (
                        <div key={b.id} className="border border-light-400/20 rounded-xl p-4 bg-dark-300">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                                <div>
                                    <p className="text-white font-bold text-lg">{b.userName}</p>
                                    <p className="text-light-200 text-sm">Topic: {b.topic}</p>
                                    <p className="text-light-200 text-sm">Date: {b.date}</p>
                                    {b.mentorMessage && (
                                        <p className="text-sm text-success-100 mt-1">Message sent: {b.mentorMessage}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-light-100 border border-light-500 px-2 py-1 rounded-full">{b.status}</span>
                                    <Button size="sm" onClick={() => handleStartCall(b)} disabled={b.status === "Completed"} className="btn-primary">
                                        Start Call
                                    </Button>
                                    <Button size="sm" onClick={() => handleComplete(b)} variant="outline" disabled={b.status === "Completed"}>
                                        Mark Complete
                                    </Button>
                                </div>
                            </div>
                            <div className="mt-4 flex flex-col gap-2">
                                <textarea
                                    value={mentorNotes[b.id] || ""}
                                    onChange={(e) => setMentorNotes((prev) => ({ ...prev, [b.id]: e.target.value }))}
                                    className="bg-dark-100 text-light-100 rounded-lg border border-light-400/20 p-2 h-20 resize-none"
                                    placeholder="Send a note to the learner (e.g. call link/update)"
                                />
                                <Button size="sm" onClick={() => handleSendMentorMessage(b)}>
                                    Send Messag e to Learner
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {activeRoomUrl && (
                <div className="mt-8">
                    <h2 className="text-xl font-bold text-primary-100 mb-2">Live Video Call</h2>
                    <p className="text-light-200 mb-2">Using Jitsi Meet inside the app.</p>
                    <div className="w-full h-[650px] border border-light-400 overflow-hidden rounded-xl">
                        <iframe
                            src={activeRoomUrl}
                            allow="camera; microphone; fullscreen; speaker; display-capture"
                            className="w-full h-full"
                            allowFullScreen
                            title="Mentor Video Call"
                        ></iframe>
                    </div>
                </div>
            )}
        </div>
    );
}
