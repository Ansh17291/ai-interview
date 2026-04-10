"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/actions/auth.action";

const links = [
    { href: "/", label: "Home" },
    { href: "/quiz", label: "Quizzes" },
    { href: "/interview", label: "Interviews" },
    { href: "/jobs", label: "Jobs" },
    { href: "/community", label: "Community" },
    { href: "/mentorship", label: "Mentorship" },
    { href: "/resume", label: "Resume" },
    { href: "/career-path", label: "Career Path" },
    { href: "/profile", label: "Profile" },
];

export function NavBar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleSignOut = async () => {
        try {
            localStorage.clear();
            sessionStorage.clear();
            await signOut();
            router.push("/login");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
                <Image src="/logo.svg" alt="MockMate Logo" width={38} height={32} />
                <h2 className="text-primary-100 font-bold text-xl">IntelliCoach</h2>
            </Link>

            <ul className="flex flex-wrap items-center gap-6 list-none max-md:hidden">
                {links.map((link) => {
                    const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
                    return (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                className={`transition-colors ${isActive
                                        ? "text-primary-100 border-b-2 border-primary-100 font-bold"
                                        : "text-light-100 hover:text-primary-100"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        </li>
                    );
                })}
                <li>
                    <button
                        onClick={handleSignOut}
                        className="text-destructive-100 font-bold hover:text-destructive-200 transition-colors"
                    >
                        Sign Out
                    </button>
                </li>
            </ul>
        </nav>
    );
}
