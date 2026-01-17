import { DesignLog } from "@/app/components/types";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";

interface TimelineViewProps {
  logs: DesignLog[];
  onSelectLog: (log: DesignLog) => void;
}

export function TimelineView({ logs, onSelectLog }: TimelineViewProps) {
  // Sort logs by date
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Group logs by date
  const logsByDate = sortedLogs.reduce((acc, log) => {
    const date = log.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(log);
    return acc;
  }, {} as Record<string, DesignLog[]>);

  const dates = Object.keys(logsByDate).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Calendar className="h-16 w-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No logs to display</h3>
        <p className="text-gray-600">Add some design logs to see them on the timeline</p>
      </div>
    );
  }

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    return { day, month };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 bg-white min-h-screen flex items-center">
      <div className="overflow-x-auto w-full">
        <div className="min-w-max py-96">
          {/* Timeline Bar */}
          <div className="relative h-2 bg-blue-400 shadow-sm" style={{ width: `${Math.max(dates.length * 400, 1200)}px`, margin: '0 auto' }}>
            {/* Date Markers and Cards */}
            {dates.map((date, index) => {
              const { day, month } = formatDateLabel(date);
              const logsForDate = logsByDate[date];
              const position = dates.length === 1 ? 50 : (index / (dates.length - 1)) * 100;
              
              return (
                <div
                  key={date}
                  className="absolute"
                  style={{
                    left: `${position}%`,
                    transform: 'translateX(-50%)',
                    top: '0',
                  }}
                >
                  {/* Cards for this date - Above the timeline - Stacked */}
                  <div 
                    className="absolute group" 
                    style={{ 
                      bottom: '60px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }}
                  >
                    {logsForDate.map((log, cardIndex) => {
                      // Calculate side-by-side position on hover
                      const totalCards = logsForDate.length;
                      const cardWidth = 320; // w-80 = 320px
                      const gap = 16; // gap between cards
                      const totalWidth = (cardWidth + gap) * totalCards - gap;
                      const startOffset = -(totalWidth / 2) + (cardWidth / 2);
                      const hoverLeft = startOffset + (cardIndex * (cardWidth + gap));
                      
                      return (
                        <Card
                          key={log.id}
                          className="w-80 bg-white shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-blue-500 cursor-pointer hover:scale-105"
                          onClick={() => onSelectLog(log)}
                          style={{
                            position: cardIndex === 0 ? 'relative' : 'absolute',
                            top: cardIndex === 0 ? '0' : `${cardIndex * 8}px`,
                            left: cardIndex === 0 ? '0' : `${cardIndex * 8}px`,
                            zIndex: logsForDate.length - cardIndex,
                            transition: 'all 0.3s ease-in-out',
                          }}
                          onMouseEnter={(e) => {
                            if (totalCards > 1) {
                              const card = e.currentTarget as HTMLElement;
                              card.style.left = `${hoverLeft}px`;
                              card.style.top = '0px';
                              card.style.zIndex = '100';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (totalCards > 1) {
                              const card = e.currentTarget as HTMLElement;
                              card.style.left = cardIndex === 0 ? '0' : `${cardIndex * 8}px`;
                              card.style.top = cardIndex === 0 ? '0' : `${cardIndex * 8}px`;
                              card.style.zIndex = String(logsForDate.length - cardIndex);
                            }
                          }}
                        >
                          {/* Image */}
                          <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg overflow-hidden">
                            {log.imageUrl ? (
                              <img
                                src={log.imageUrl}
                                alt={log.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full text-gray-400">
                                <span className="text-sm font-medium">Image Uploaded</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Content - Only Title */}
                          <div className="p-5">
                            <h3 className="font-bold text-lg line-clamp-2 text-gray-800">
                              {log.title}
                            </h3>
                          </div>
                        </Card>
                      );
                    })}
                    
                    {/* Card Count Badge - Show when multiple cards */}
                    {logsForDate.length > 1 && (
                      <div 
                        className="absolute -top-3 -right-3 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg z-50 pointer-events-none"
                        style={{ zIndex: 999 }}
                      >
                        {logsForDate.length}
                      </div>
                    )}
                  </div>

                  {/* Date Circle - ON the timeline */}
                  <div className="absolute" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex flex-col items-center justify-center border-4 border-white shadow-xl">
                      <span className="text-3xl font-bold text-white">{day}</span>
                      <span className="text-xs text-blue-50 uppercase font-semibold tracking-wide">{month}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}