import { ethers } from 'ethers';

export interface WalletConnection {
  address: string;
  balance: string;
  chainId: number;
  provider: ethers.BrowserProvider;
  signer: ethers.JsonRpcSigner;
}

export interface Web3State {
  isConnected: boolean;
  account: string | null;
  balance: string;
  chainId: number | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  isLoading: boolean;
  error: string | null;
}

class Web3Manager {
  private static instance: Web3Manager;
  private state: Web3State = {
    isConnected: false,
    account: null,
    balance: '0',
    chainId: null,
    provider: null,
    signer: null,
    isLoading: false,
    error: null
  };
  private listeners: ((state: Web3State) => void)[] = [];

  static getInstance(): Web3Manager {
    if (!Web3Manager.instance) {
      Web3Manager.instance = new Web3Manager();
    }
    return Web3Manager.instance;
  }

  constructor() {
    this.initializeEventListeners();
  }

  private initializeEventListeners() {
    if (typeof window !== 'undefined' && window.ethereum) {
      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          this.disconnect();
        } else {
          this.handleAccountChange(accounts[0]);
        }
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', (chainId: string) => {
        this.handleChainChange(parseInt(chainId, 16));
      });

      // Listen for disconnect
      window.ethereum.on('disconnect', () => {
        this.disconnect();
      });
    }
  }

  private async handleAccountChange(newAccount: string) {
    if (newAccount !== this.state.account) {
      this.state.account = newAccount;
      await this.updateBalance();
      this.notifyListeners();
    }
  }

  private async handleChainChange(newChainId: number) {
    this.state.chainId = newChainId;
    await this.updateBalance();
    this.notifyListeners();
  }

  private async updateBalance() {
    if (this.state.provider && this.state.account) {
      try {
        const balance = await this.state.provider.getBalance(this.state.account);
        this.state.balance = ethers.formatEther(balance);
      } catch (error) {
        console.error('Failed to update balance:', error);
        this.state.error = 'Failed to fetch balance';
      }
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener({ ...this.state }));
  }

  subscribe(listener: (state: Web3State) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  getState(): Web3State {
    return { ...this.state };
  }

  isMetaMaskInstalled(): boolean {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }

  async connectWallet(): Promise<{ success: boolean; error?: string }> {
    if (!this.isMetaMaskInstalled()) {
      return { 
        success: false, 
        error: 'MetaMask is not installed. Please install MetaMask extension to continue.' 
      };
    }

    this.state.isLoading = true;
    this.state.error = null;
    this.notifyListeners();

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Initialize provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const chainId = Number(await window.ethereum.request({ method: 'eth_chainId' }));

      // Get balance
      const balance = await provider.getBalance(accounts[0]);

      this.state = {
        ...this.state,
        isConnected: true,
        account: accounts[0],
        balance: ethers.formatEther(balance),
        chainId,
        provider,
        signer,
        isLoading: false,
        error: null
      };

      this.notifyListeners();
      return { success: true };
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      
      let errorMessage = 'Failed to connect wallet';
      if (error.code === 4001) {
        errorMessage = 'Connection rejected by user';
      } else if (error.code === -32002) {
        errorMessage = 'Connection request already pending';
      } else if (error.message) {
        errorMessage = error.message;
      }

      this.state.isLoading = false;
      this.state.error = errorMessage;
      this.notifyListeners();

      return { success: false, error: errorMessage };
    }
  }

  async switchToBlockDAGNetwork(): Promise<{ success: boolean; error?: string }> {
    if (!this.isMetaMaskInstalled()) {
      return { success: false, error: 'MetaMask is not installed' };
    }

    try {
      // BlockDAG Testnet configuration (example - replace with actual BlockDAG network details)
      const blockDAGNetwork = {
        chainId: '0x1A4', // 420 in hex (example chain ID)
        chainName: 'BlockDAG Testnet',
        nativeCurrency: {
          name: 'BlockDAG',
          symbol: 'BDAG',
          decimals: 18,
        },
        rpcUrls: ['https://rpc.blockdag-testnet.io'], // Replace with actual RPC URL
        blockExplorerUrls: ['https://explorer.blockdag-testnet.io'], // Replace with actual explorer URL
      };

      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [blockDAGNetwork],
      });

      return { success: true };
    } catch (error: any) {
      console.error('Failed to switch network:', error);
      return { success: false, error: error.message || 'Failed to switch network' };
    }
  }

  async sendTransaction(to: string, value: string): Promise<{ success: boolean; hash?: string; error?: string }> {
    if (!this.state.isConnected || !this.state.signer) {
      return { success: false, error: 'Wallet not connected' };
    }

    try {
      const tx = await this.state.signer.sendTransaction({
        to,
        value: ethers.parseEther(value),
      });

      await tx.wait(); // Wait for transaction confirmation
      await this.updateBalance(); // Update balance after transaction
      this.notifyListeners();

      return { success: true, hash: tx.hash };
    } catch (error: any) {
      console.error('Transaction failed:', error);
      return { success: false, error: error.message || 'Transaction failed' };
    }
  }

  async signMessage(message: string): Promise<{ success: boolean; signature?: string; error?: string }> {
    if (!this.state.isConnected || !this.state.signer) {
      return { success: false, error: 'Wallet not connected' };
    }

    try {
      const signature = await this.state.signer.signMessage(message);
      return { success: true, signature };
    } catch (error: any) {
      console.error('Message signing failed:', error);
      return { success: false, error: error.message || 'Message signing failed' };
    }
  }

  disconnect(): void {
    this.state = {
      isConnected: false,
      account: null,
      balance: '0',
      chainId: null,
      provider: null,
      signer: null,
      isLoading: false,
      error: null
    };
    this.notifyListeners();
  }

  getFormattedAddress(address?: string): string {
    const addr = address || this.state.account;
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }

  getNetworkName(chainId?: number): string {
    const id = chainId || this.state.chainId;
    switch (id) {
      case 1:
        return 'Ethereum Mainnet';
      case 5:
        return 'Goerli Testnet';
      case 11155111:
        return 'Sepolia Testnet';
      case 137:
        return 'Polygon Mainnet';
      case 80001:
        return 'Polygon Mumbai';
      case 420:
        return 'BlockDAG Testnet';
      default:
        return `Chain ${id}`;
    }
  }

  async addTokenToWallet(tokenAddress: string, tokenSymbol: string, tokenDecimals: number): Promise<{ success: boolean; error?: string }> {
    if (!this.isMetaMaskInstalled()) {
      return { success: false, error: 'MetaMask is not installed' };
    }

    try {
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: tokenAddress,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
          },
        },
      });

      return { success: true };
    } catch (error: any) {
      console.error('Failed to add token:', error);
      return { success: false, error: error.message || 'Failed to add token' };
    }
  }
}

// Export singleton instance
export const web3Manager = Web3Manager.getInstance();

// Helper functions for React components
export const useWeb3 = () => {
  const [web3State, setWeb3State] = useState(web3Manager.getState());

  useEffect(() => {
    const unsubscribe = web3Manager.subscribe(setWeb3State);
    return unsubscribe;
  }, []);

  return {
    ...web3State,
    connectWallet: web3Manager.connectWallet.bind(web3Manager),
    disconnect: web3Manager.disconnect.bind(web3Manager),
    sendTransaction: web3Manager.sendTransaction.bind(web3Manager),
    signMessage: web3Manager.signMessage.bind(web3Manager),
    switchToBlockDAGNetwork: web3Manager.switchToBlockDAGNetwork.bind(web3Manager),
    addTokenToWallet: web3Manager.addTokenToWallet.bind(web3Manager),
    getFormattedAddress: web3Manager.getFormattedAddress.bind(web3Manager),
    getNetworkName: web3Manager.getNetworkName.bind(web3Manager),
    isMetaMaskInstalled: web3Manager.isMetaMaskInstalled.bind(web3Manager),
  };
};

// Extend window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}

// React import for useState and useEffect
import { useState, useEffect } from 'react';