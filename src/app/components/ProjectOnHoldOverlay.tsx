import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { MoveRight, User, Eye } from "lucide-react";

interface ProjectOnHoldOverlayProps {
    onExplore: () => void;
}

export function ProjectOnHoldOverlay({ onExplore }: ProjectOnHoldOverlayProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/90 backdrop-blur-xl">
            <div className="flex flex-col items-center justify-center p-6 text-center w-full min-h-screen">

                {/* Content card */}
                <div
                    className="max-w-lg w-full space-y-8"
                    style={{
                        animation: "fadeSlideUp 0.7s cubic-bezier(0.22,1,0.36,1) both",
                    }}
                >
                    {/* App Logo */}
                    <div className="flex justify-center">
                        <div className="size-20 overflow-hidden rounded-2xl shadow-md border-2 border-white ring-4 ring-indigo-100">
                            <img
                                src="/images/app-logo.png"
                                alt="App Logo"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Heading & description */}
                    <div className="space-y-3">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                            Project on Hold
                        </h1>
                        <p className="text-base text-gray-500 leading-relaxed">
                            Priority has shifted, so this project is currently paused.{" "}
                            <br className="hidden sm:block" />
                            It was originally started as first try on app development using figma make for internal team.
                        </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <a
                            href="https://yamparalaux.vercel.app"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto"
                        >
                            <Button
                                size="lg"
                                className="w-full sm:w-auto gap-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 shadow-md shadow-indigo-200 transition-all hover:scale-105"
                            >
                                <User className="h-4 w-4" />
                                View Builder
                            </Button>
                        </a>

                        <Button
                            variant="outline"
                            size="lg"
                            onClick={onExplore}
                            className="w-full sm:w-auto gap-2 rounded-full border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-8 transition-all hover:scale-105"
                        >
                            <Eye className="h-4 w-4" />
                            Explore App
                            <MoveRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Status badge */}
                    <div className="pt-2 flex justify-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-sm font-medium text-indigo-600">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                            </span>
                            Waiting for Priority Update
                        </div>
                    </div>
                </div>

                {/* Decorative background blobs */}
                <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-40" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-200 rounded-full blur-3xl opacity-30" />
                </div>
            </div>

            {/* Keyframe animation */}
            <style>{`
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(24px); }
                    to   { opacity: 1; transform: translateY(0);    }
                }
            `}</style>
        </div>
    );
}
