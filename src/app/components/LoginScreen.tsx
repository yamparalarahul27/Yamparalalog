/**
 * components/LoginScreen.tsx
 * The authentication gateway for the application.
 * 
 * CORE RESPONSIBILITIES:
 * - User Selection: Displays a list of users (individual and grouped).
 * - PIN Verification: Handles user authentication via a 4-digit PIN.
 * - Branding: Showcases the app logo and title.
 * - Grouping Logic: Implements the "Design Team Users" expandable group for Praveen & Shaina.
 * 
 * LINKAGE:
 * - Parent: `src/app/App.tsx` (renders this when no currentUser is set).
 * - Data Flow: Receives `users` list as props and returns the authenticated user via `onLogin`.
 */

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card } from "@/app/components/ui/card";
import { Spinner } from "@/app/components/ui/spinner";
import { Skeleton } from "@/app/components/ui/skeleton";
import { User } from "./types";
import { LogIn } from "lucide-react";

interface LoginScreenProps {
  users: User[];
  onLogin: (user: User) => void;
  loading?: boolean;
}

export function LoginScreen({ users, onLogin, loading = false }: LoginScreenProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isDesignTeamExpanded, setIsDesignTeamExpanded] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser) {
      setError("Please select a user");
      return;
    }

    setIsLoggingIn(true);
    setError("");

    // Simulate a brief delay for better UX
    await new Promise(resolve => setTimeout(resolve, 200));

    // Check if user doesn't require PIN authentication (e.g., New_Join)
    if (selectedUser.requiresPin === false) {
      onLogin(selectedUser);
      return;
    }

    // Standard PIN authentication flow
    if (selectedUser.pin && selectedUser.pin === pin) {
      onLogin(selectedUser);
    } else if (!selectedUser.pin) {
      // If user doesn't have a PIN yet, any PIN will work and will be set
      onLogin({ ...selectedUser, pin });
    } else {
      setError("Invalid PIN");
      setPin("");
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md md:max-w-5xl p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="size-20 overflow-hidden rounded-2xl shadow-md border-2 border-white">
              <img src="/images/app-logo.png" alt="App Logo" className="w-full h-full object-cover" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Yamparala Dev App</h1>
          <p className="text-gray-600">Please log in to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-3">
            <Label>Select User</Label>
            <div className="grid gap-2">
              {loading ? (
                // Skeleton loading state
                <>
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </>
              ) : (
                (() => {
                  const designTeamNames = ["Praveen", "Shaina Mishra"];
                  const designTeamUsers = users.filter(u => designTeamNames.includes(u.name));
                  const otherUsers = users.filter(u => !designTeamNames.includes(u.name));
                  const isUserInDesignTeam = (user: User | null) => user && designTeamNames.includes(user.name);

                  return (
                    <div className="space-y-2 md:grid md:grid-cols-3 md:gap-4 md:space-y-0">
                      {/* Other Users */}
                      {otherUsers.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => {
                            setSelectedUser(user);
                            setError("");
                            setPin("");
                          }}
                          disabled={isLoggingIn}
                          className={`w-full p-4 border-2 rounded-lg text-left transition-all ${selectedUser?.id === user.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                            } ${isLoggingIn ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <div className="font-semibold">{user.name}</div>
                          <div className="text-sm text-gray-600">{user.role}</div>
                        </button>
                      ))}

                      {/* Design Team Group */}
                      <div className={`space-y-2 rounded-xl transition-colors duration-200 ${isDesignTeamExpanded ? 'bg-gray-50/80 p-2 border border-gray-100' : ''}`}>
                        <button
                          type="button"
                          onClick={() => setIsDesignTeamExpanded(!isDesignTeamExpanded)}
                          disabled={isLoggingIn}
                          className={`w-full p-4 border-2 rounded-lg text-left transition-all flex items-center justify-between ${isUserInDesignTeam(selectedUser) || isDesignTeamExpanded
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                            } ${isLoggingIn ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <div>
                            <div className="font-semibold">Design Team Users</div>
                            <div className="text-sm text-gray-600">Praveen & Shaina</div>
                          </div>
                          <div className={`transition-transform ${isDesignTeamExpanded ? 'rotate-180' : ''}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6" /></svg>
                          </div>
                        </button>

                        {isDesignTeamExpanded && (
                          <div className="grid gap-2 pl-2 animate-in slide-in-from-top-2 duration-200">
                            {designTeamUsers.map((user) => (
                              <button
                                key={user.id}
                                type="button"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setError("");
                                  setPin("");
                                }}
                                disabled={isLoggingIn}
                                className={`w-full p-4 border-2 rounded-lg text-left transition-all ${selectedUser?.id === user.id
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-white hover:border-gray-200 bg-white/50"
                                  } ${isLoggingIn ? "opacity-50 cursor-not-allowed" : ""}`}
                              >
                                <div className="font-semibold">{user.name}</div>
                                <div className="text-sm text-gray-600">{user.role}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          </div>

          {selectedUser && !loading && selectedUser.requiresPin !== false && (
            <div className="space-y-2">
              <Label htmlFor="pin">
                {selectedUser.pin ? "Enter PIN" : "Set Your PIN"}
              </Label>
              <Input
                id="pin"
                type="password"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError("");
                }}
                placeholder="Enter 4-digit PIN"
                maxLength={4}
                pattern="[0-9]*"
                required
                disabled={isLoggingIn}
                className="text-center text-2xl tracking-widest"
              />
              {!selectedUser.pin && (
                <p className="text-xs text-gray-500">
                  You'll use this PIN for future logins
                </p>
              )}
            </div>
          )}

          {selectedUser && !loading && selectedUser.requiresPin === false && (
            <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm text-center">
              No PIN required for New Joiners, Click Login to continue.
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={!selectedUser || (selectedUser.requiresPin !== false && !pin) || loading || isLoggingIn}
          >
            {isLoggingIn ? <Spinner className="h-4 w-4 mr-2" /> : <LogIn className="h-4 w-4 mr-2" />}
            {isLoggingIn ? "Logging in..." : "Log In"}
          </Button>
        </form>
      </Card>
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-sm text-gray-500/80">
          Wallpaper by{" "}
          <a
            href="https://unsplash.com/@eternalzard"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:text-blue-600 transition-colors underline underline-offset-4"
          >
            Yue Ma
          </a>{" "}
          from Unsplash
        </p>
      </div>
    </div>
  );
}