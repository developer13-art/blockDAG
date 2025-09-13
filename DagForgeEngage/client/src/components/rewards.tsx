import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ChartLine, Trophy, Gift } from "lucide-react";

interface User {
  id: string;
  weeklyXp: number;
}

interface RewardsProps {
  user: User;
}

interface Reward {
  id: string;
  type: string;
  source: string;
  bdagAmount: string;
  description: string;
  timeAgo: string;
}

export default function Rewards({ user }: RewardsProps) {
  // Mock rewards data
  const recentRewards: Reward[] = [
    {
      id: "reward-1",
      type: "task_completion",
      source: "Block Verification #1250",
      bdagAmount: "25",
      description: "Task Completed",
      timeAgo: "2 hours ago"
    },
    {
      id: "reward-2",
      type: "prediction_win", 
      source: "Hash Rate Prediction",
      bdagAmount: "122",
      description: "Prediction Win",
      timeAgo: "1 day ago"
    },
    {
      id: "reward-3",
      type: "daily_bonus",
      source: "7-day streak reward",
      bdagAmount: "50",
      description: "Daily Bonus",
      timeAgo: "3 days ago"
    },
    {
      id: "reward-4",
      type: "achievement",
      source: "Network Expert Badge",
      bdagAmount: "100",
      description: "Achievement Unlocked",
      timeAgo: "1 week ago"
    }
  ];

  const weeklyTotal = recentRewards.reduce((total, reward) => total + parseFloat(reward.bdagAmount), 0);

  const getRewardIcon = (type: string) => {
    switch (type) {
      case "task_completion":
        return <Check className="w-4 h-4 text-white" />;
      case "prediction_win":
        return <ChartLine className="w-4 h-4 text-white" />;
      case "daily_bonus":
        return <Trophy className="w-4 h-4 text-white" />;
      case "achievement":
        return <Gift className="w-4 h-4 text-white" />;
      default:
        return <Gift className="w-4 h-4 text-white" />;
    }
  };

  const getRewardColor = (type: string) => {
    switch (type) {
      case "task_completion":
        return "bg-accent";
      case "prediction_win":
        return "bg-primary";
      case "daily_bonus":
        return "bg-amber-500";
      case "achievement":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card className="bg-card border border-border">
      <CardHeader>
        <CardTitle className="flex items-center text-foreground">
          <Gift className="w-6 h-6 text-primary mr-2" />
          Recent Rewards
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentRewards.map((reward) => (
            <div 
              key={reward.id}
              className="flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors"
              data-testid={`reward-${reward.id}`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 ${getRewardColor(reward.type)} rounded-full flex items-center justify-center`}>
                  {getRewardIcon(reward.type)}
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground" data-testid={`text-reward-description-${reward.id}`}>
                    {reward.description}
                  </div>
                  <div className="text-xs text-muted-foreground" data-testid={`text-reward-source-${reward.id}`}>
                    {reward.source}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-accent" data-testid={`text-reward-amount-${reward.id}`}>
                  +{reward.bdagAmount} BDAG
                </div>
                <div className="text-xs text-muted-foreground" data-testid={`text-reward-time-${reward.id}`}>
                  {reward.timeAgo}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-lg font-bold text-foreground" data-testid="text-weekly-total">
              +{weeklyTotal.toFixed(0)} BDAG
            </div>
            <div className="text-sm text-muted-foreground">earned this week</div>
          </div>
        </div>

        {/* Reward Breakdown */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="text-sm font-medium text-foreground mb-2">Reward Sources</div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Task Completions</span>
              <span className="text-accent font-medium">+125 BDAG</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Prediction Wins</span>
              <span className="text-accent font-medium">+244 BDAG</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Daily Bonuses</span>
              <span className="text-accent font-medium">+350 BDAG</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Achievements</span>
              <span className="text-accent font-medium">+128 BDAG</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
