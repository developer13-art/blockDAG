import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import WalletConnection from "@/components/wallet-connection";
import PredictionMarkets from "@/components/prediction-markets";
import TaskDirectory from "@/components/task-directory";
import Leaderboard from "@/components/leaderboard";
import Achievements from "@/components/achievements";
import Rewards from "@/components/rewards";
import ProgressOverview from "@/components/progress-overview";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, Coins, ChartLine, Trophy, Wallet, AlertCircle } from "lucide-react";
import { useWeb3 } from "@/lib/web3";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { 
    isConnected, 
    account, 
    balance, 
    chainId, 
    getFormattedAddress, 
    getNetworkName,
    isMetaMaskInstalled,
    connectWallet 
  } = useWeb3();

  // Fetch user data from API when wallet is connected
  const { data: userData, isLoading: userDataLoading } = useQuery({
    queryKey: ['/api/users', account],
    enabled: isConnected && !!account,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Type for user data from API
  interface UserData {
    username?: string;
    email?: string;
    role?: "validator" | "participant" | "admin";
    level?: number;
    xp?: number;
    bdagBalance?: number;
    globalRank?: number;
    weeklyXp?: number;
    streakDays?: number;
  }

  // Calculate portfolio value based on actual balance and BDAG tokens
  const portfolioValueUSD = isConnected ? (parseFloat(balance) * 2500 + ((userData as UserData)?.bdagBalance || 0) * 0.3).toFixed(2) : "0.00";
  
  // Create user object with real wallet data
  const user = isConnected ? {
    id: account || "unknown",
    username: (userData as UserData)?.username || `User_${account?.slice(-4)}`,
    email: (userData as UserData)?.email || "",
    role: (userData as UserData)?.role || "participant" as const,
    walletAddress: account || "",
    level: (userData as UserData)?.level || 1,
    xp: (userData as UserData)?.xp || 0,
    bdagBalance: ((userData as UserData)?.bdagBalance?.toString() || "0"),
    portfolioValue: portfolioValueUSD,
    globalRank: (userData as UserData)?.globalRank || 0,
    weeklyXp: (userData as UserData)?.weeklyXp || 0,
    streakDays: (userData as UserData)?.streakDays || 0
  } : {
    id: "guest",
    username: "Guest User",
    email: "",
    role: "participant" as const,
    walletAddress: "",
    level: 0,
    xp: 0,
    bdagBalance: "0",
    portfolioValue: "0.00",
    globalRank: 0,
    weeklyXp: 0,
    streakDays: 0
  };

  // Wallet connection prompt component
  const WalletConnectionPrompt = () => (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md text-center space-y-6">
        <div className="w-24 h-24 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto">
          <Wallet className="w-12 h-12 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6">
            Connect your MetaMask wallet to access DAGForge's prediction markets, task directory, and earn rewards.
          </p>
        </div>
        
        {!isMetaMaskInstalled() ? (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                MetaMask is not installed. Please install the MetaMask extension to continue.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => window.open('https://metamask.io/download/', '_blank')}
              className="w-full"
            >
              Install MetaMask
            </Button>
          </div>
        ) : (
          <Button 
            onClick={connectWallet}
            className="w-full"
            size="lg"
          >
            Connect MetaMask Wallet
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation user={user} />
      
      <div className="container mx-auto px-4 py-8">
        {!isConnected ? (
          <WalletConnectionPrompt />
        ) : (
          <>
        {/* Prototype Warning */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-semibold text-amber-700 dark:text-amber-400">
                ⚠️ Prototype Mode - No Real Transactions
              </h3>
              <p className="text-sm text-amber-600 dark:text-amber-300">
                This is a demonstration platform. All transactions are simulated. No real funds are at risk. 
                Mainnet transactions are blocked for your protection.
              </p>
            </div>
          </div>
        </div>

        {/* Portfolio Overview */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Portfolio Value */}
            <Card className="card-hover" data-testid="card-portfolio-value">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Portfolio Value</h3>
                  <WalletConnection />
                </div>
                <div className="text-2xl font-bold text-foreground" data-testid="text-portfolio-value">
                  ${parseFloat(user.portfolioValue).toLocaleString()}
                </div>
                <div className="flex items-center mt-2">
                  <ArrowUp className="w-4 h-4 text-accent mr-1" />
                  <span className="text-accent text-sm font-medium" data-testid="text-portfolio-change">+23.45%</span>
                </div>
              </CardContent>
            </Card>

            {/* BDAG Balance */}
            <Card className="card-hover" data-testid="card-bdag-balance">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">BDAG Balance</h3>
                  <Coins className="w-5 h-5 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground" data-testid="text-bdag-balance">
                  {parseInt(user.bdagBalance).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">≈ $7,754.10</div>
              </CardContent>
            </Card>

            {/* Active Predictions */}
            <Card className="card-hover" data-testid="card-active-predictions">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Active Predictions</h3>
                  <ChartLine className="w-5 h-5 text-amber-500" />
                </div>
                <div className="text-2xl font-bold text-foreground" data-testid="text-active-predictions">7</div>
                <div className="text-sm text-accent">5 winning</div>
              </CardContent>
            </Card>

            {/* Rank */}
            <Card className="card-hover relative overflow-hidden" data-testid="card-global-rank">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Global Rank</h3>
                  <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground" data-testid="text-global-rank">
                  #{user.globalRank}
                </div>
                <div className="text-sm text-muted-foreground">of 15,432 users</div>
                <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-gradient-to-r from-amber-500/10 to-primary/10 rounded-full float-animation"></div>
              </CardContent>
            </Card>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            <PredictionMarkets user={user} />
            <TaskDirectory user={user} />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <Leaderboard currentUser={user} />
            <Achievements user={user} />
            <Rewards user={user} />
          </div>
        </div>

        {/* Progress Overview */}
        <ProgressOverview user={user} />
          </>
        )}
      </div>
    </div>
  );
}
