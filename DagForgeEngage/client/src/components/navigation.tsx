import { Link } from "wouter";
import { Group } from "lucide-react";

interface User {
  id: string;
  username: string;
  role: string;
  walletAddress?: string;
}

interface NavigationProps {
  user: User;
}

export default function Navigation({ user }: NavigationProps) {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-blue-500 rounded-lg flex items-center justify-center">
                <Group className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text" data-testid="text-logo">DAGForge</span>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link href="/dashboard" data-testid="link-dashboard">
                <a className="text-foreground hover:text-primary transition-colors">Dashboard</a>
              </Link>
              <a href="#markets" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-markets">
                Markets
              </a>
              <a href="#tasks" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-tasks">
                Tasks
              </a>
              <a href="#leaderboard" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-leaderboard">
                Leaderboard
              </a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            {/* Wallet Connection Status */}
            <div className="flex items-center space-x-2 bg-accent/10 border border-accent/20 rounded-lg px-3 py-2" data-testid="wallet-status">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
              <span className="text-sm font-medium" data-testid="text-wallet-address">
                {user.walletAddress || "Not Connected"}
              </span>
              <div className="w-4 h-4 text-accent">💳</div>
            </div>
            {/* User Role Badge */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg px-3 py-1" data-testid="user-role-badge">
              <span className="text-xs font-semibold text-primary uppercase" data-testid="text-user-role">
                {user.role}
              </span>
            </div>
            {/* Profile */}
            <div className="w-8 h-8 bg-gradient-to-r from-accent to-primary rounded-full flex items-center justify-center" data-testid="user-avatar">
              <span className="text-white text-sm font-bold">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
