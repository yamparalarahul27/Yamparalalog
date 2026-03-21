import { Resources } from "@/app/components/Resources";
import { Toaster } from "sonner";

export default function App() {
  return (
    <div className="min-h-dvh bg-slate-50">
      <Resources />
      <Toaster position="top-right" richColors />
    </div>
  );
}
