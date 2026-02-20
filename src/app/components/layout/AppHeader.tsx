import { Button } from "@/app/components/ui/button";
import { Lock } from "lucide-react";
import React from "react";

interface AppHeaderProps {
    onLoginClick: () => void;
    onSupportClick: () => void;
}

export function AppHeader({ onLoginClick, onSupportClick }: AppHeaderProps) {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <div className="size-10 overflow-hidden rounded-lg shadow-sm">
                        <img src="/images/app-logo.png" alt="App Logo" className="w-full h-full object-cover" />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Support Developer Button - Rounded + ₹ + White Fill */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(e: React.MouseEvent) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onSupportClick();
                        }}
                        className="hidden md:flex items-center gap-2 text-indigo-600 hover:text-indigo-700 bg-white hover:bg-indigo-50 rounded-full border border-indigo-100 px-4 shadow-sm"
                    >
                        <div className="h-2 w-2 bg-indigo-500 rounded-full animate-pulse" />
                        ₹ Support Developer
                    </Button>

                    {/* Simple Login Button - Opens Overlay regardless of state */}
                    <Button
                        onClick={onLoginClick}
                        className="rounded-full gap-2"
                    >
                        <Lock className="h-4 w-4" />
                        Login
                    </Button>
                </div>
            </div>
        </div>
    );
}
