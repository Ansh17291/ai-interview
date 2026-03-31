"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
    Menu,
    X,
    ChevronDown,
    BookOpen,
    Briefcase,
    Users,
    User,
    LogOut,
    Zap,
} from "lucide-react";
import { signOut } from "@/lib/actions/auth.action";

const mainLinks = [
    { href: "/", label: "Dashboard", icon: null },
];

const featureLinks = [
    { href: "/interview", label: "Mock Interviews", icon: Briefcase },
    { href: "/quiz", label: "Quizzes", icon: BookOpen },
    { href: "/career-path", label: "Career Path", icon: Zap },
];

const communityLinks = [
    { href: "/community", label: "Community", icon: Users },
    { href: "/mentorship", label: "Mentorship", icon: User },
    { href: "/jobs", label: "Job Board", icon: Briefcase },
];

export function NavBar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [featuresOpen, setFeaturesOpen] = useState(false);
    const [communityOpen, setCommunityOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-40 backdrop-blur-md bg-dark-100/80 border-b border-light-400/10">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                            <Zap className="w-5 h-5 text-dark-100" />
                        </div>
                        <h2 className="text-primary-100 font-bold text-lg hidden sm:block">IntelliCoach</h2>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-1">
                        {mainLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-4 py-2 rounded-lg transition-colors ${pathname === link.href
                                    ? "bg-primary-100/20 text-primary-100 font-semibold"
                                    : "text-light-100 hover:text-primary-100"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {/* Features Dropdown */}
                        <div className="relative group">
                            <button className="px-4 py-2 rounded-lg text-light-100 hover:text-primary-100 transition-colors flex items-center gap-1 group-hover:bg-dark-200/50">
                                Features <ChevronDown className="w-4 h-4" />
                            </button>
                            <div className="absolute left-0 mt-0 w-48 bg-dark-200 border border-light-400/20 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                {featureLinks.map((link) => {
                                    const Icon = link.icon;
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className="flex items-center gap-3 px-4 py-3 text-light-100 hover:bg-dark-300 hover:text-primary-100 first:rounded-t-lg last:rounded-b-lg transition-colors"
                                        >
                                            {Icon && <Icon className="w-4 h-4" />}
                                            {link.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Community Dropdown */}
                        <div className="relative group">
                            <button className="px-4 py-2 rounded-lg text-light-100 hover:text-primary-100 transition-colors flex items-center gap-1 group-hover:bg-dark-200/50">
                                Community <ChevronDown className="w-4 h-4" />
                            </button>
                            <div className="absolute left-0 mt-0 w-48 bg-dark-200 border border-light-400/20 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                {communityLinks.map((link) => {
                                    const Icon = link.icon;
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className="flex items-center gap-3 px-4 py-3 text-light-100 hover:bg-dark-300 hover:text-primary-100 first:rounded-t-lg last:rounded-b-lg transition-colors"
                                        >
                                            {Icon && <Icon className="w-4 h-4" />}
                                            {link.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Resume */}
                        <Link
                            href="/resume"
                            className={`px-4 py-2 rounded-lg transition-colors ${pathname?.includes("/resume")
                                ? "bg-primary-100/20 text-primary-100 font-semibold"
                                : "text-light-100 hover:text-primary-100"
                                }`}
                        >
                            Resume
                        </Link>

                        {/* Profile & Logout */}
                        <div className="flex items-center gap-2 ml-4 pl-4 border-l border-light-400/20">
                            <Link
                                href="/profile"
                                className={`p-2 rounded-lg transition-colors ${pathname?.includes("/profile")
                                    ? "bg-primary-100/20 text-primary-100"
                                    : "text-light-100 hover:text-primary-100 hover:bg-dark-200/50"
                                    }`}
                            >
                                <User className="w-5 h-5" />
                            </Link>
                            <Link
                                href="api/auth/signout"
                                className="p-2 rounded-lg text-destructive-100 hover:bg-destructive-100/10 transition-colors"
                                onClick={signOut}
                            >
                                <LogOut className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="lg:hidden text-light-100 hover:text-primary-100"
                    >
                        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {mobileOpen && (
                    <div className="lg:hidden mt-4 pb-4 border-t border-light-400/10">
                        <div className="space-y-2">
                            {mainLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="block px-4 py-2 rounded-lg text-light-100 hover:bg-dark-200/50 hover:text-primary-100 transition-colors"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}

                            {/* Mobile Features */}
                            <button
                                onClick={() => setFeaturesOpen(!featuresOpen)}
                                className="w-full text-left px-4 py-2 rounded-lg text-light-100 hover:bg-dark-200/50 hover:text-primary-100 transition-colors flex items-center justify-between"
                            >
                                Features <ChevronDown className={`w-4 h-4 transition-transform ${featuresOpen ? "rotate-180" : ""}`} />
                            </button>
                            {featuresOpen && (
                                <div className="pl-4 space-y-2">
                                    {featureLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className="block px-4 py-2 rounded-lg text-light-200 hover:text-primary-100 transition-colors"
                                            onClick={() => setMobileOpen(false)}
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* Mobile Community */}
                            <button
                                onClick={() => setCommunityOpen(!communityOpen)}
                                className="w-full text-left px-4 py-2 rounded-lg text-light-100 hover:bg-dark-200/50 hover:text-primary-100 transition-colors flex items-center justify-between"
                            >
                                Community <ChevronDown className={`w-4 h-4 transition-transform ${communityOpen ? "rotate-180" : ""}`} />
                            </button>
                            {communityOpen && (
                                <div className="pl-4 space-y-2">
                                    {communityLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className="block px-4 py-2 rounded-lg text-light-200 hover:text-primary-100 transition-colors"
                                            onClick={() => setMobileOpen(false)}
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                </div>
                            )}

                            <Link
                                href="/resume"
                                className="block px-4 py-2 rounded-lg text-light-100 hover:bg-dark-200/50 hover:text-primary-100 transition-colors"
                                onClick={() => setMobileOpen(false)}
                            >
                                Resume
                            </Link>

                            <div className="border-t border-light-400/10 pt-2 mt-2">
                                <Link
                                    href="/profile"
                                    className="block px-4 py-2 rounded-lg text-light-100 hover:bg-dark-200/50 hover:text-primary-100 transition-colors"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    Profile
                                </Link>
                                <Link
                                    href="/api/auth/signout"
                                    className="block px-4 py-2 rounded-lg text-destructive-100 hover:bg-destructive-100/10 transition-colors"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    Sign Out
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
