import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Medal, Flame, Code, Check, Target } from "lucide-react";

interface User {
  id: string;
  streakDays: number;
}

interface AchievementsProps {
  user: User;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  isCompleted: boolean;
  progress?: number;
  maxProgress?: number;
  dateCompleted?: string;
}

export default function Achievements({ user }: AchievementsProps) {
  // Mock achievements data
  const recentAchievements: Achievement[] = [
    {
      id: "achievement-1",
      name: "7 Day Streak",
      description: "Login for 7 consecutive days",
      icon: Flame,
      category: "engagement",
      isCompleted: true,
      dateCompleted: "2 days ago"
    },
    {
      id: "achievement-2", 
      name: "First Deploy",
      description: "Deploy your first smart contract",
      icon: Code,
      category: "development",
      isCompleted: true,
      dateCompleted: "1 week ago"
    },
    {
      id: "achievement-3",
      name: "100 Blocks",
      description: "Verify 100 network blocks",
      icon: Check,
      category: "validation",
      isCompleted: true,
      dateCompleted: "3 days ago"
    }
  ];

  const progressAchievement = {
    id: "achievement-progress",
    name: "Network Expert",
    description: "Deploy 5 smart contracts successfully",
    icon: Target,
    category: "development",
    isCompleted: false,
    progress: 2,
    maxProgress: 5,
    requirement: "Deploy 3 more contracts"
  };

  const getAchievementColor = (category: string) => {
    switch (category) {
      case "engagement":
        return "bg-amber-500";
      case "development":
        return "bg-blue-500";
      case "validation":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getAchievementGradient = (category: string) => {
    switch (category) {
      case "engagement":
        return "from-amber-500/20 to-orange-500/20 border-amber-500/30";
      case "development":
        return "from-blue-500/20 to-purple-500/20 border-blue-500/30";
      case "validation":
        return "from-green-500/20 to-blue-500/20 border-green-500/30";
      default:
        return "from-gray-500/20 to-gray-600/20 border-gray-500/30";
    }
  };

  return (
    <Card className="bg-card border border-border">
      <CardHeader>
        <CardTitle className="flex items-center text-foreground">
          <Medal className="w-6 h-6 text-amber-500 mr-2" />
          Recent Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {recentAchievements.map((achievement) => {
            const Icon = achievement.icon;
            return (
              <div 
                key={achievement.id}
                className={`bg-gradient-to-r ${getAchievementGradient(achievement.category)} border rounded-lg p-3 text-center group hover:scale-105 transition-transform cursor-pointer`}
                data-testid={`achievement-${achievement.id}`}
              >
                <div className={`w-8 h-8 ${getAchievementColor(achievement.category)} rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="text-xs font-medium text-foreground" data-testid={`text-achievement-name-${achievement.id}`}>
                  {achievement.name}
                </div>
                {achievement.dateCompleted && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {achievement.dateCompleted}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress to next achievement */}
        <div className="bg-muted/20 rounded-lg p-3" data-testid="progress-achievement">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <Target className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-medium text-foreground" data-testid="text-progress-achievement-name">
                {progressAchievement.name}
              </span>
            </div>
            <span className="text-xs text-muted-foreground" data-testid="text-progress-percentage">
              Progress: {Math.round((progressAchievement.progress! / progressAchievement.maxProgress!) * 100)}%
            </span>
          </div>
          <Progress 
            value={(progressAchievement.progress! / progressAchievement.maxProgress!) * 100} 
            className="mb-2"
            data-testid="progress-bar-achievement"
          />
          <div className="text-xs text-muted-foreground" data-testid="text-progress-requirement">
            {progressAchievement.requirement}
          </div>
        </div>

        {/* Achievement Categories */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="text-sm font-medium text-foreground mb-2">Categories</div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              🔥 Engagement (3/5)
            </Badge>
            <Badge variant="outline" className="text-xs">
              💻 Development (2/8)
            </Badge>
            <Badge variant="outline" className="text-xs">
              ✅ Validation (4/6)
            </Badge>
            <Badge variant="outline" className="text-xs">
              🏆 Special (1/3)
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
