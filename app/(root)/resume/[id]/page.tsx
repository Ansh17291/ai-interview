"use client";

import { useEffect, useState } from "react";
import React from "react";
import ResumeBuilder from "@/components/ResumeBuilder";
import { getResumeById } from "@/lib/actions/resume.action";
import { useRouter } from "next/navigation";

export default function ResumeDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const router = useRouter();
    const [resume, setResume] = useState<(Resume & { id: string }) | null>(null);
    const [loading, setLoading] = useState(true);
    const unwrappedParams = React.use(params);

    useEffect(() => {
        const loadResume = async () => {
            if (unwrappedParams.id !== "new") {
                const data = await getResumeById(unwrappedParams.id);
                setResume(data);
            }
            setLoading(false);
        };

        loadResume();
    }, [unwrappedParams.id]);

    if (loading) {
        return <p className="text-light-200 p-10">Loading resume...</p>;
    }

    return (
        <div className="py-10">
            <ResumeBuilder
                resumeId={resume?.id}
                initialData={resume || undefined}
                onSave={(resumeId) => {
                    router.push(`/resume/${resumeId}`);
                }}
            />
        </div>
    );
}
