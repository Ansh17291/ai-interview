"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const MENTOR_USERNAME = "mentoradmin";
const MENTOR_PASSWORD = "Mentor@123";
const LOCAL_STORAGE_KEY = "prepwise_mentor_logged_in";

export default function MentorLoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const auth = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        if (auth === "true") {
            setIsAuthenticated(true);
            router.replace("/mentorship/mentor");
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        if (username === MENTOR_USERNAME && password === MENTOR_PASSWORD) {
            window.localStorage.setItem(LOCAL_STORAGE_KEY, "true");
            setIsAuthenticated(true);
            toast.success("Mentor login successful. Redirecting to dashboard...");
            router.push("/mentorship/mentor");
        } else {
            toast.error("Invalid mentor credentials. Please try again.");
        }

        setLoading(false);
    };

    if (isAuthenticated) {
        return <p className="text-light-200 p-8">Logged in. Redirecting to Mentor Dashboard...</p>;
    }

    return (
        <div className="container mx-auto py-14 px-4 max-w-md">
            <div className="bg-dark-300 border border-light-400/20 rounded-2xl p-8 shadow-lg">
                <h1 className="text-3xl font-bold text-white mb-4">Mentor Login</h1>
                <p className="text-light-200 mb-6">Use your mentor credentials to access the mentor dashboard and start calls.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm text-light-300 mb-1 block">Username</label>
                        <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="mentoradmin" className="bg-dark-200 border-light-400/20 text-white" />
                    </div>

                    <div>
                        <label className="text-sm text-light-300 mb-1 block">Password</label>
                        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mentor@123" className="bg-dark-200 border-light-400/20 text-white" />
                    </div>

                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? "Signing in..." : "Sign in as Mentor"}
                    </Button>

                    <div className="text-xs text-light-400 pt-1">
                        Hardcoded test credentials: mentoradmin / Mentor@123
                    </div>
                </form>
            </div>
        </div>
    );
}
