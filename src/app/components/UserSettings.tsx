import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { User } from "./types";

interface UserSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: User;
  onUpdatePin: (newPin: string) => void;
}

export function UserSettings({
  open,
  onOpenChange,
  currentUser,
  onUpdatePin,
}: UserSettingsProps) {
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (currentUser.pin && currentPin !== currentUser.pin) {
      setError("Current PIN is incorrect");
      return;
    }

    if (newPin.length !== 4) {
      setError("PIN must be 4 digits");
      return;
    }

    if (newPin !== confirmPin) {
      setError("New PINs do not match");
      return;
    }

    onUpdatePin(newPin);
    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change PIN</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>User</Label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-semibold">{currentUser.name}</div>
                <div className="text-sm text-gray-600">{currentUser.role}</div>
              </div>
            </div>

            {currentUser.pin && (
              <div className="space-y-2">
                <Label htmlFor="current-pin">Current PIN</Label>
                <Input
                  id="current-pin"
                  type="password"
                  value={currentPin}
                  onChange={(e) => {
                    setCurrentPin(e.target.value);
                    setError("");
                  }}
                  maxLength={4}
                  pattern="[0-9]*"
                  required
                  className="text-center text-xl tracking-widest"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="new-pin">New PIN</Label>
              <Input
                id="new-pin"
                type="password"
                value={newPin}
                onChange={(e) => {
                  setNewPin(e.target.value);
                  setError("");
                }}
                maxLength={4}
                pattern="[0-9]*"
                required
                className="text-center text-xl tracking-widest"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-pin">Confirm New PIN</Label>
              <Input
                id="confirm-pin"
                type="password"
                value={confirmPin}
                onChange={(e) => {
                  setConfirmPin(e.target.value);
                  setError("");
                }}
                maxLength={4}
                pattern="[0-9]*"
                required
                className="text-center text-xl tracking-widest"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCurrentPin("");
                setNewPin("");
                setConfirmPin("");
                setError("");
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Update PIN</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
