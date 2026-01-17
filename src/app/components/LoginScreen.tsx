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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) {
      setError("Please select a user");
      return;
    }

    setIsLoggingIn(true);
    setError("");

    // Simulate a brief delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Design Logs</h1>
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
                users.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => {
                      setSelectedUser(user);
                      setError("");
                      setPin("");
                    }}
                    disabled={isLoggingIn}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      selectedUser?.id === user.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    } ${isLoggingIn ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="font-semibold">{user.name}</div>
                    <div className="text-sm text-gray-600">{user.role}</div>
                  </button>
                ))
              )}
            </div>
          </div>

          {selectedUser && !loading && (
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

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={!selectedUser || !pin || loading || isLoggingIn}
          >
            {isLoggingIn ? <Spinner className="h-4 w-4 mr-2" /> : <LogIn className="h-4 w-4 mr-2" />}
            {isLoggingIn ? "Logging in..." : "Log In"}
          </Button>
        </form>
      </Card>
    </div>
  );
}