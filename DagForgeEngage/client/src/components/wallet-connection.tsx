import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Wallet, CheckCircle, AlertCircle, ExternalLink, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWeb3 } from "@/lib/web3";

export default function WalletConnection() {
  const { 
    isConnected, 
    isLoading, 
    account, 
    balance, 
    chainId,
    connectWallet,
    disconnect,
    switchToBlockDAGNetwork,
    addTokenToWallet,
    getFormattedAddress,
    getNetworkName,
    isMetaMaskInstalled,
    error
  } = useWeb3();
  
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleConnectWallet = async () => {
    const result = await connectWallet();
    
    if (result.success) {
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to MetaMask wallet",
      });
      setIsDialogOpen(false);
    } else {
      toast({
        title: "Connection Failed",
        description: result.error || "Failed to connect wallet",
        variant: "destructive",
      });
    }
  };

  const handleSwitchNetwork = async () => {
    const result = await switchToBlockDAGNetwork();
    
    if (result.success) {
      toast({
        title: "Network Switched",
        description: "Successfully switched to BlockDAG network",
      });
    } else {
      toast({
        title: "Network Switch Failed",
        description: result.error || "Failed to switch network",
        variant: "destructive",
      });
    }
  };

  const handleAddBDAGToken = async () => {
    // Example BDAG token address - replace with actual token address
    const result = await addTokenToWallet(
      "0x1234567890123456789012345678901234567890", // Replace with actual BDAG token address
      "BDAG",
      18
    );
    
    if (result.success) {
      toast({
        title: "Token Added",
        description: "BDAG token added to MetaMask",
      });
    } else {
      toast({
        title: "Failed to Add Token",
        description: result.error || "Failed to add BDAG token",
        variant: "destructive",
      });
    }
  };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const openEtherscan = () => {
    if (account) {
      // Open in blockchain explorer - replace with BlockDAG explorer when available
      window.open(`https://etherscan.io/address/${account}`, '_blank');
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center space-x-2"
          data-testid="button-wallet-connect"
        >
          <Wallet className="w-4 h-4" />
          {isConnected ? (
            <CheckCircle className="w-4 h-4 text-accent" />
          ) : (
            <AlertCircle className="w-4 h-4 text-destructive" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" data-testid="dialog-wallet">
        <DialogHeader>
          <DialogTitle>
            {isConnected ? "Wallet Connected" : "Connect Your Wallet"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {isConnected ? "MetaMask Connected" : "Connect MetaMask"}
            </h3>
            <p className="text-muted-foreground text-sm">
              {isConnected 
                ? "Your MetaMask wallet is connected and ready to use"
                : !isMetaMaskInstalled() 
                ? "Please install MetaMask extension to continue"
                : "Connect your wallet to participate in prediction markets and earn rewards"
              }
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {isConnected ? (
            <>
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4" data-testid="wallet-info">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Address:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-mono" data-testid="text-wallet-address">
                      {getFormattedAddress(account)}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={copyAddress}
                      className="p-1 h-6 w-6"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Network:</span>
                  <span className="text-sm text-accent">{getNetworkName(chainId)}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Balance:</span>
                  <span className="text-sm font-mono">{parseFloat(balance).toFixed(4)} ETH</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                    <span className="text-sm text-accent">Connected</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {chainId !== 420 && ( // Not on BlockDAG network
                  <Button 
                    onClick={handleSwitchNetwork}
                    variant="outline"
                    className="w-full"
                    data-testid="button-switch-network"
                  >
                    Switch to BlockDAG Network
                  </Button>
                )}
                
                <Button 
                  onClick={handleAddBDAGToken}
                  variant="outline"
                  className="w-full"
                  data-testid="button-add-bdag-token"
                >
                  Add BDAG Token
                </Button>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="font-medium mb-2">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={openEtherscan}
                    data-testid="button-view-transactions"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Explorer
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={disconnect}
                    data-testid="button-disconnect"
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              {!isMetaMaskInstalled() ? (
                <Button 
                  onClick={() => window.open('https://metamask.io/download/', '_blank')}
                  className="w-full"
                  data-testid="button-install-metamask"
                >
                  Install MetaMask
                </Button>
              ) : (
                <Button 
                  onClick={handleConnectWallet}
                  disabled={isLoading}
                  className="w-full"
                  data-testid="button-connect-wallet"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Connecting...
                    </>
                  ) : (
                    "Connect MetaMask"
                  )}
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
