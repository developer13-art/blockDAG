import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartBar } from "lucide-react";

interface User {
  id: string;
  xp: number;
  weeklyXp: number;
}

interface ProgressOverviewProps {
  user: User;
}

export default function ProgressOverview({ user }: ProgressOverviewProps) {
  // Mock progress data
  const progressData = [
    {
      id: "tasks",
      title: "Tasks Completed",
      percentage: 78,
      current: 47,
      total: 60,
      period: "this month",
      color: "accent"
    },
    {
      id: "predictions",
      title: "Prediction Accuracy", 
      percentage: 65,
      current: 13,
      total: 20,
      period: "correct",
      color: "primary"
    },
    {
      id: "streak",
      title: "Streak Maintenance",
      percentage: 90,
      current: 27,
      total: 30,
      period: "days",
      color: "amber-500"
    },
    {
      id: "engagement",
      title: "Community Engagement",
      percentage: 40,
      current: null,
      total: null,
      period: "Participate more in discussions",
      color: "destructive"
    }
  ];

  const getColorClass = (color: string) => {
    switch (color) {
      case "accent":
        return "border-accent";
      case "primary":
        return "border-primary";
      case "amber-500":
        return "border-amber-500";
      case "destructive":
        return "border-destructive";
      default:
        return "border-muted";
    }
  };

  const getProgressColor = (color: string) => {
    switch (color) {
      case "accent":
        return "stroke-accent";
      case "primary": 
        return "stroke-primary";
      case "amber-500":
        return "stroke-amber-500";
      case "destructive":
        return "stroke-destructive";
      default:
        return "stroke-muted";
    }
  };

  const CircularProgress = ({ percentage, color }: { percentage: number; color: string }) => {
    const circumference = 2 * Math.PI * 32; // radius of 32
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    return (
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 68 68">
          <circle
            cx="34"
            cy="34"
            r="32"
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            className="text-muted/30"
          />
          <circle
            cx="34"
            cy="34"
            r="32"
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={`${getProgressColor(color)} transition-all duration-1000 ease-out`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-foreground">{percentage}%</span>
        </div>
      </div>
    );
  };

  return (
    <section className="mt-8 bg-card border border-border rounded-lg p-6">
      <div className="flex items-center mb-6">
        <ChartBar className="w-6 h-6 text-primary mr-2" />
        <h2 className="text-xl font-bold text-foreground">Progress Overview</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {progressData.map((item) => (
          <Card 
            key={item.id}
            className={`text-center border-2 ${getColorClass(item.color)} bg-card/50 hover:bg-card/80 transition-colors`}
            data-testid={`progress-card-${item.id}`}
          >
            <CardContent className="p-6">
              <div className="mx-auto mb-4">
                <CircularProgress percentage={item.percentage} color={item.color} />
              </div>
              <h4 className="font-semibold text-foreground mb-2" data-testid={`text-progress-title-${item.id}`}>
                {item.title}
              </h4>
              <p className="text-sm text-muted-foreground" data-testid={`text-progress-description-${item.id}`}>
                {item.current && item.total 
                  ? `${item.current} of ${item.total} ${item.period}`
                  : item.period
                }
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-muted/20 rounded-lg" data-testid="stat-total-xp">
          <div className="text-2xl font-bold text-foreground">{user.xp.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Total XP</div>
        </div>
        <div className="text-center p-4 bg-muted/20 rounded-lg" data-testid="stat-weekly-xp">
          <div className="text-2xl font-bold text-accent">+{user.weeklyXp.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">This Week</div>
        </div>
        <div className="text-center p-4 bg-muted/20 rounded-lg" data-testid="stat-completion-rate">
          <div className="text-2xl font-bold text-primary">94%</div>
          <div className="text-sm text-muted-foreground">Completion Rate</div>
        </div>
        <div className="text-center p-4 bg-muted/20 rounded-lg" data-testid="stat-network-contribution">
          <div className="text-2xl font-bold text-amber-500">2.3k</div>
          <div className="text-sm text-muted-foreground">Network Contributions</div>
        </div>
      </div>
    </section>
  );
}
