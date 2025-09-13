import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChartLine, Flame, Network, Users, ExternalLink, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWeb3 } from "@/lib/web3";
import { ethers } from "ethers";

interface User {
  id: string;
  role: string;
  bdagBalance: string;
}

interface PredictionMarketsProps {
  user: User;
}

interface Market {
  id: string;
  title: string;
  description: string;
  category: string;
  endDate: string;
  totalPool: string;
  participantCount: number;
  yesPercentage: string;
  noPercentage: string;
  userPosition?: {
    prediction: boolean;
    amount: string;
    potentialWin: string;
  };
}

export default function PredictionMarkets({ user }: PredictionMarketsProps) {
  const [betAmount, setBetAmount] = useState("");
  const [selectedPrediction, setSelectedPrediction] = useState<boolean | null>(null);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const {
    isConnected,
    account,
    balance,
    signer,
    sendTransaction,
    signMessage,
    chainId,
    getNetworkName
  } = useWeb3();

  // Example prediction market smart contract addresses (replace with actual)
  const PREDICTION_MARKET_CONTRACT = "0x1234567890123456789012345678901234567890";
  const BDAG_TOKEN_CONTRACT = "0x9876543210987654321098765432109876543210";

  // Mock market data
  const markets: Market[] = [
    {
      id: "market-1",
      title: "Network Hash Rate > 50 TH/s by Dec 2024?",
      description: "Will the BlockDAG network hash rate exceed 50 TH/s by December 2024?",
      category: "network",
      endDate: "2024-12-31",
      totalPool: "12500",
      participantCount: 1247,
      yesPercentage: "67.00",
      noPercentage: "33.00",
      userPosition: {
        prediction: true,
        amount: "250",
        potentialWin: "122.5"
      }
    },
    {
      id: "market-2", 
      title: "Block time < 10 seconds by Q1 2025?",
      description: "Will BlockDAG achieve block times under 10 seconds by Q1 2025?",
      category: "performance",
      endDate: "2025-03-31",
      totalPool: "3400",
      participantCount: 524,
      yesPercentage: "78.00",
      noPercentage: "22.00"
    },
    {
      id: "market-3",
      title: "Mainnet launch before March 2025?",
      description: "Will BlockDAG mainnet launch before March 2025?",
      category: "development",
      endDate: "2025-03-01",
      totalPool: "8750",
      participantCount: 892,
      yesPercentage: "48.00",
      noPercentage: "52.00"
    }
  ];

  const handlePlaceBet = async (marketId: string, prediction: boolean) => {
    if (!isConnected || !account) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your MetaMask wallet to place bets",
        variant: "destructive",
      });
      return;
    }

    // CRITICAL SECURITY CHECK: Block mainnet transactions
    if (chainId === 1) {
      toast({
        title: "Mainnet Not Supported",
        description: "This is a prototype. Mainnet transactions are blocked to protect your funds.",
        variant: "destructive",
      });
      return;
    }

    if (!betAmount || parseFloat(betAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid bet amount",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(betAmount) > parseFloat(balance)) {
      toast({
        title: "Insufficient Balance",
        description: `You need at least ${betAmount} ETH to place this bet`,
        variant: "destructive",
      });
      return;
    }

    // PROTOTYPE SIMULATION - NO REAL TRANSACTIONS
    setIsPlacingBet(true);

    try {
      // Simulate transaction processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create a signature for the bet details (for verification)
      const betData = {
        marketId,
        prediction,
        amount: betAmount,
        timestamp: Date.now(),
        account,
        chainId
      };
      
      const message = `PROTOTYPE BET - DO NOT USE REAL FUNDS: ${JSON.stringify(betData)}`;
      const signResult = await signMessage(message);
      
      if (signResult.success) {
        toast({
          title: "Prototype Bet Simulated! ⚠️",
          description: (
            <div className="space-y-2">
              <div className="font-semibold text-amber-600">DEMO MODE - NO REAL TRANSACTION</div>
              <div>Simulated {betAmount} ETH bet on {prediction ? 'YES' : 'NO'}</div>
              <div className="text-xs text-muted-foreground">
                Signature: {signResult.signature?.slice(0, 10)}...
              </div>
              <div className="text-xs text-amber-600">
                ⚠️ This is a prototype. No real funds are at risk.
              </div>
            </div>
          )
        });

        // Here you would typically save the bet to your backend
        // await saveBetToDatabase(betData, 'simulation', signResult.signature);
        
        setBetAmount("");
        setSelectedPrediction(null);
        setIsDialogOpen(false);
      } else {
        throw new Error('Message signing failed');
      }
    } catch (error: any) {
      console.error('Bet simulation failed:', error);
      
      let errorMessage = 'Failed to simulate bet';
      if (error.code === 4001) {
        errorMessage = 'Message signing rejected by user';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Simulation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsPlacingBet(false);
    }
  };

  const handleCreateMarket = () => {
    if (user.role === "basic") {
      toast({
        title: "Upgrade Required",
        description: "Premium or Validator account required to create markets",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Market Creation",
      description: "Market creation feature coming soon",
    });
  };

  const getMarketIcon = (category: string) => {
    switch (category) {
      case "network": return <Network className="w-5 h-5 text-white" />;
      case "performance": return <ChartLine className="w-5 h-5 text-white" />;
      case "development": return <Users className="w-5 h-5 text-white" />;
      default: return <Flame className="w-5 h-5 text-white" />;
    }
  };

  const getIconColor = (category: string) => {
    switch (category) {
      case "network": return "bg-blue-500";
      case "performance": return "bg-green-500";
      case "development": return "bg-purple-500";
      default: return "bg-orange-500";
    }
  };

  return (
    <section id="markets" className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground flex items-center">
          <ChartLine className="w-6 h-6 text-primary mr-2" />
          Prediction Markets
        </h2>
        <Button 
          onClick={handleCreateMarket}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          data-testid="button-create-market"
        >
          Create Market
        </Button>
      </div>

      {/* Featured Market */}
      <div className="bg-muted/30 border border-border rounded-lg p-4 mb-4 glow-effect" data-testid="featured-market">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-accent to-primary rounded-full flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground" data-testid="text-featured-title">
                {markets[0].title}
              </h3>
              <p className="text-sm text-muted-foreground">
                Ends in 23 days • {markets[0].participantCount.toLocaleString()} participants
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-foreground" data-testid="text-featured-pool">
              Total Pool: {parseInt(markets[0].totalPool).toLocaleString()} BDAG
            </div>
            <div className="text-sm text-muted-foreground">≈ $3,750</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline"
                className="bg-accent/10 hover:bg-accent/20 border-accent/20 text-accent p-4 h-auto flex-col"
                onClick={() => setSelectedPrediction(true)}
                data-testid="button-bet-yes"
              >
                <div className="text-lg font-bold">YES - {markets[0].yesPercentage}%</div>
                <div className="text-sm opacity-75">Odds: 1.49x</div>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Place Your Bet - YES</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="betAmount">Bet Amount (BDAG)</Label>
                  <Input
                    id="betAmount"
                    type="number"
                    placeholder="Enter amount"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    data-testid="input-bet-amount"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Available: {isConnected ? parseFloat(balance).toFixed(4) + ' ETH' : 'Wallet not connected'}
                  </p>
                </div>
                <Button 
                  onClick={() => handlePlaceBet(markets[0].id, true)}
                  disabled={isPlacingBet || !isConnected}
                  className="w-full"
                  data-testid="button-confirm-bet"
                >
                  {isPlacingBet ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    "Confirm Bet"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline"
                className="bg-destructive/10 hover:bg-destructive/20 border-destructive/20 text-destructive p-4 h-auto flex-col"
                onClick={() => setSelectedPrediction(false)}
                data-testid="button-bet-no"
              >
                <div className="text-lg font-bold">NO - {markets[0].noPercentage}%</div>
                <div className="text-sm opacity-75">Odds: 3.03x</div>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Place Your Bet - NO</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="betAmountNo">Bet Amount (BDAG)</Label>
                  <Input
                    id="betAmountNo"
                    type="number"
                    placeholder="Enter amount"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    data-testid="input-bet-amount-no"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Available: {isConnected ? parseFloat(balance).toFixed(4) + ' ETH' : 'Wallet not connected'}
                  </p>
                </div>
                <Button 
                  onClick={() => handlePlaceBet(markets[0].id, false)}
                  disabled={isPlacingBet || !isConnected}
                  className="w-full"
                  data-testid="button-confirm-bet-no"
                >
                  {isPlacingBet ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    "Confirm Bet"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {markets[0].userPosition && (
          <div className="bg-background/50 rounded-lg p-3" data-testid="user-position">
            <div className="text-xs text-muted-foreground mb-1">Your Position</div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-accent">
                {markets[0].userPosition.prediction ? 'YES' : 'NO'} - {markets[0].userPosition.amount} BDAG
              </span>
              <span className="text-sm text-muted-foreground">
                Potential: +{markets[0].userPosition.potentialWin} BDAG
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Market List */}
      <div className="space-y-3">
        {markets.slice(1).map((market) => (
          <div 
            key={market.id}
            className="flex items-center justify-between p-4 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
            data-testid={`market-${market.id}`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 ${getIconColor(market.category)} rounded-full flex items-center justify-center`}>
                {getMarketIcon(market.category)}
              </div>
              <div>
                <div className="font-medium text-foreground" data-testid={`text-market-title-${market.id}`}>
                  {market.title}
                </div>
                <div className="text-sm text-muted-foreground">
                  {market.participantCount} participants • {parseInt(market.totalPool).toLocaleString()} BDAG pool
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-sm font-medium ${parseFloat(market.yesPercentage) > 50 ? 'text-accent' : 'text-destructive'}`}>
                {parseFloat(market.yesPercentage) > 50 ? 'YES' : 'NO'} {Math.max(parseFloat(market.yesPercentage), parseFloat(market.noPercentage)).toFixed(0)}%
              </div>
              <div className="text-xs text-muted-foreground">
                {(parseFloat(market.yesPercentage) > 50 ? (100 / parseFloat(market.yesPercentage)) : (100 / parseFloat(market.noPercentage))).toFixed(2)}x odds
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
