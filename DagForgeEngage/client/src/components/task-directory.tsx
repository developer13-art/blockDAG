import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, Trophy, Code, Check, ListTodo } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  role: string;
}

interface TaskDirectoryProps {
  user: User;
}

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  xpReward: number;
  bdagReward: string;
  requirements: string[];
  isDaily: boolean;
  isWeekly: boolean;
  status?: string;
  progress?: number;
  maxProgress?: number;
}

export default function TaskDirectory({ user }: TaskDirectoryProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();

  // Mock task data
  const tasks: Task[] = [
    {
      id: "task-1",
      title: "Deploy Smart Contract on Testnet",
      description: "Deploy and verify a smart contract on the BlockDAG testnet",
      category: "development",
      difficulty: "hard",
      xpReward: 300,
      bdagReward: "100",
      requirements: ["Connect wallet", "Deploy contract", "Verify deployment"],
      isDaily: false,
      isWeekly: false,
      status: "not_started",
      progress: 0,
      maxProgress: 3
    },
    {
      id: "task-2",
      title: "Verify 10 Network Blocks",
      description: "Participate in block verification to strengthen the network",
      category: "testing",
      difficulty: "medium",
      xpReward: 150,
      bdagReward: "25",
      requirements: ["Verify blocks"],
      isDaily: false,
      isWeekly: false,
      status: "completed",
      progress: 10,
      maxProgress: 10
    },
    {
      id: "task-3",
      title: "Community Discussion Participation",
      description: "Engage in meaningful discussions in the community forums",
      category: "community",
      difficulty: "easy",
      xpReward: 50,
      bdagReward: "10",
      requirements: ["Make 5 forum posts", "Receive 10 upvotes"],
      isDaily: false,
      isWeekly: false,
      status: "in_progress",
      progress: 3,
      maxProgress: 5
    }
  ];

  const dailyChallenge = {
    id: "daily-1",
    title: "Complete 5 network transactions and verify 2 blocks",
    xpReward: 500,
    bdagReward: "50",
    timeRemaining: "14:32:15",
    progress: 60,
    isMultiplier: true
  };

  const weeklyContest = {
    id: "weekly-1", 
    title: "Top 100 validators this week get bonus rewards",
    xpReward: 2000,
    bdagReward: "200",
    daysRemaining: 5,
    progress: 30,
    currentRank: 47,
    completedTasks: 3,
    totalTasks: 10
  };

  const filteredTasks = selectedCategory === "all" 
    ? tasks 
    : tasks.filter(task => task.category === selectedCategory);

  const handleStartTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (task.status === "completed") {
      toast({
        title: "Task Already Completed",
        description: "You have already completed this task",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Task Started",
      description: `Started working on: ${task.title}`,
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-green-500 bg-green-500/10";
      case "medium": return "text-yellow-500 bg-yellow-500/10";
      case "hard": return "text-red-500 bg-red-500/10";
      default: return "text-gray-500 bg-gray-500/10";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "development": return <Code className="w-5 h-5 text-white" />;
      case "testing": return <Check className="w-5 h-5 text-white" />;
      case "community": return <Trophy className="w-5 h-5 text-white" />;
      default: return <ListTodo className="w-5 h-5 text-white" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "development": return "bg-blue-500";
      case "testing": return "bg-green-500";
      case "community": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <section id="tasks" className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground flex items-center">
          <ListTodo className="w-6 h-6 text-primary mr-2" />
          Task Directory
        </h2>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48" data-testid="select-category">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="testing">Testing</SelectItem>
            <SelectItem value="community">Community</SelectItem>
            <SelectItem value="development">Development</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Daily Challenge */}
        <Card className="bg-gradient-to-r from-amber-500/10 to-primary/10 border-amber-500/20" data-testid="daily-challenge">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                  <CalendarDays className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Daily Challenge</h3>
                  <p className="text-xs text-muted-foreground">Resets in {dailyChallenge.timeRemaining}</p>
                </div>
              </div>
              {dailyChallenge.isMultiplier && (
                <Badge className="bg-amber-500 text-white" data-testid="badge-multiplier">2X REWARDS</Badge>
              )}
            </div>
            <p className="text-sm text-foreground mb-3" data-testid="text-daily-description">
              {dailyChallenge.title}
            </p>
            <Progress value={dailyChallenge.progress} className="mb-3" />
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-amber-500">
                +{dailyChallenge.xpReward} XP • +{dailyChallenge.bdagReward} BDAG
              </div>
              <Button 
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-white"
                onClick={() => handleStartTask(dailyChallenge.id)}
                data-testid="button-start-daily"
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Challenge */}
        <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20" data-testid="weekly-contest">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Weekly Contest</h3>
                  <p className="text-xs text-muted-foreground">{weeklyContest.daysRemaining} days remaining</p>
                </div>
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                {weeklyContest.completedTasks}/{weeklyContest.totalTasks} completed
              </div>
            </div>
            <p className="text-sm text-foreground mb-3" data-testid="text-weekly-description">
              {weeklyContest.title}
            </p>
            <Progress value={weeklyContest.progress} className="mb-3" />
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-purple-500">
                +{weeklyContest.xpReward} XP • +{weeklyContest.bdagReward} BDAG
              </div>
              <span className="text-xs text-accent" data-testid="text-current-rank">
                Rank #{weeklyContest.currentRank}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <div 
            key={task.id}
            className="flex items-center justify-between p-4 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors"
            data-testid={`task-${task.id}`}
          >
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 ${getCategoryColor(task.category)} rounded-full flex items-center justify-center`}>
                {getCategoryIcon(task.category)}
              </div>
              <div>
                <h4 className="font-medium text-foreground" data-testid={`text-task-title-${task.id}`}>
                  {task.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {task.category.charAt(0).toUpperCase() + task.category.slice(1)} • 
                  Difficulty: <span className={`capitalize ${getDifficultyColor(task.difficulty).split(' ')[0]}`}>
                    {task.difficulty}
                  </span>
                </p>
                <div className="flex items-center space-x-4 mt-1">
                  <Badge variant="outline" className="text-xs bg-accent/20 text-accent">
                    +{task.xpReward} XP
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-primary/20 text-primary">
                    +{task.bdagReward} BDAG
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium text-muted-foreground">Progress</div>
                <div className="text-xs text-foreground" data-testid={`text-task-progress-${task.id}`}>
                  {task.progress || 0}/{task.maxProgress || 1} steps
                </div>
                {task.status === "in_progress" && task.progress && task.maxProgress && (
                  <Progress value={(task.progress / task.maxProgress) * 100} className="w-20 mt-1" />
                )}
              </div>
              {task.status === "completed" ? (
                <div className="bg-accent text-accent-foreground px-4 py-2 rounded-lg" data-testid={`status-completed-${task.id}`}>
                  <Check className="w-4 h-4" />
                </div>
              ) : (
                <Button 
                  onClick={() => handleStartTask(task.id)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  data-testid={`button-start-task-${task.id}`}
                >
                  {task.status === "in_progress" ? "Continue" : "Start"}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
