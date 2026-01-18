/**
 * components/DashboardStats.tsx
 * Visual representation of project metrics.
 * 
 * CORE RESPONSIBILITIES:
 * - Data Aggregation: Calculates total logs, categories, and logs created in the current month.
 * - Visual Display: Renders statistical cards with icons or custom images.
 * - State Filtering: Hides stats for users with restricted access (e.g., "New_Join").
 * - Customization: Supports custom image overrides for specific stats (e.g., the calendar image).
 * 
 * LINKAGE:
 * - Parent: `src/app/App.tsx` (receives `allLogs` and `currentUser` as props).
 * - Imports: `src/app/components/types.ts` for DesignLog and User interfaces.
 */

import { DesignLog, User } from "@/app/components/types";
import { FileText, Calendar, Tag } from "lucide-react";

interface DashboardStatsProps {
  logs: DesignLog[];
  currentUser: User;
}

export function DashboardStats({ logs, currentUser }: DashboardStatsProps) {
  // Hide stats for New_Join user (only has Wiki access)
  if (currentUser.id === "newjoin" || currentUser.accessibleTabs?.length === 1 && currentUser.accessibleTabs[0] === "wiki") {
    return null;
  }

  // Calculate stats
  const totalLogs = logs.length;
  const categories = new Set(logs.map(log => log.category).filter(Boolean));
  const totalCategories = categories.size;

  // Get current month logs
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const logsThisMonth = logs.filter(log => {
    const logDate = new Date(log.date);
    return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear;
  }).length;

  const stats = [
    {
      label: "Total Logs",
      value: totalLogs,
      icon: FileText,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "This Month",
      value: logsThisMonth,
      imageUrl: "/images/calendar-custom.png",
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Categories",
      value: totalCategories,
      icon: Tag,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {stats.map((stat) => {
        return (
          <div
            key={stat.label}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              {'imageUrl' in stat ? (
                <img src={stat.imageUrl as string} alt={stat.label} className="h-12 w-12 object-contain" />
              ) : (
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}