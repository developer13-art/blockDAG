import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Crown } from "lucide-react";

interface User {
  id: string;
  username: string;
  level: number;
  xp: number;
  weeklyXp: number;
  globalRank?: number;
  role: string;
}

interface LeaderboardProps {
  currentUser: User;
}

interface LeaderboardUser extends User {
  rank: number;
  isCurrentUser?: boolean;
}

export default function Leaderboard({ currentUser }: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState<"weekly" | "monthly" | "alltime">("weekly");

  // Mock leaderboard data
  const leaderboardData: LeaderboardUser[] = [
    {
      id: "user-top-1",
      rank: 1,
      username: "CryptoDev_42",
      level: 15,
      xp: 15247,
      weeklyXp: 2847,
      role: "validator"
    },
    {
      id: "user-top-2", 
      rank: 2,
      username: "BlockMaster",
      level: 12,
      xp: 12891,
      weeklyXp: 1923,
      role: "premium"
    },
    {
      id: currentUser.id,
      rank: 3,
      username: currentUser.username,
      level: currentUser.level,
      xp: currentUser.xp,
      weeklyXp: currentUser.weeklyXp,
      role: currentUser.role,
      isCurrentUser: true
    },
    {
      id: "user-4",
      rank: 4,
      username: "DAGValidator",
      level: 11,
      xp: 8743,
      weeklyXp: 987,
      role: "validator"
    },
    {
      id: "user-5",
      rank: 5,
      username: "NetworkNode",
      level: 9,
      xp: 7234,
      weeklyXp: 654,
      role: "premium"
    }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-4 h-4 text-amber-500" />;
      case 2:
        return <Medal className="w-4 h-4 text-gray-400" />;
      case 3:
        return <Award className="w-4 h-4 text-amber-600" />;
      default:
        return <span className="text-white text-sm font-bold">{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-amber-500 to-amber-600";
      case 2:
        return "bg-gradient-to-r from-gray-400 to-gray-500";
      case 3:
        return "bg-gradient-to-r from-amber-600 to-orange-500";
      default:
        return "bg-gradient-to-r from-muted to-muted-foreground";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "validator":
        return "text-primary";
      case "premium":
        return "text-amber-500";
      default:
        return "text-muted-foreground";
    }
  };

  const getAvatarGradient = (rank: number) => {
    if (rank <= 3) {
      return "bg-gradient-to-r from-primary to-accent";
    }
    return "bg-gradient-to-r from-muted to-muted-foreground";
  };

  return (
    <Card className="bg-card border border-border">
      <CardHeader>
        <CardTitle className="flex items-center text-foreground">
          <Trophy className="w-6 h-6 text-amber-500 mr-2" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 mb-4">
          <Button 
            variant={activeTab === "weekly" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("weekly")}
            data-testid="button-weekly-tab"
          >
            Weekly
          </Button>
          <Button 
            variant={activeTab === "monthly" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("monthly")}
            data-testid="button-monthly-tab"
          >
            Monthly
          </Button>
          <Button 
            variant={activeTab === "alltime" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("alltime")}
            data-testid="button-alltime-tab"
          >
            All Time
          </Button>
        </div>

        <div className="space-y-3">
          {leaderboardData.map((user) => (
            <div 
              key={user.id}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                user.isCurrentUser 
                  ? "bg-primary/10 border border-primary/20" 
                  : "bg-muted/20 hover:bg-muted/30"
              }`}
              data-testid={`leaderboard-user-${user.rank}`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 ${getRankBadgeColor(user.rank)} rounded-full flex items-center justify-center`}>
                  {getRankIcon(user.rank)}
                </div>
                <div className={`w-8 h-8 ${getAvatarGradient(user.rank)} rounded-full flex items-center justify-center`}>
                  <span className="text-white text-xs font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-foreground flex items-center space-x-2">
                    <span data-testid={`text-username-${user.rank}`}>{user.username}</span>
                    {user.isCurrentUser && (
                      <Badge variant="outline" className="text-xs">You</Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className={`capitalize ${getRoleColor(user.role)}`}>
                      Level {user.level} {user.role}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-foreground" data-testid={`text-xp-${user.rank}`}>
                  {user.xp.toLocaleString()} XP
                </div>
                <div className="text-xs text-accent" data-testid={`text-weekly-xp-${user.rank}`}>
                  +{user.weeklyXp.toLocaleString()} this week
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <div className="text-center text-xs text-muted-foreground" data-testid="text-user-rank-summary">
            Your rank: #{currentUser.globalRank || 127} of 15,432 users
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
