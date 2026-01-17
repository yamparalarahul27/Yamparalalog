import { DesignLog } from "@/app/components/types";
import { FileText, Calendar, Tag } from "lucide-react";

interface DashboardStatsProps {
  logs: DesignLog[];
}

export function DashboardStats({ logs }: DashboardStatsProps) {
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
      icon: Calendar,
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
        const Icon = stat.icon;
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
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
