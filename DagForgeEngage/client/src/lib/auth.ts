interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  walletAddress?: string;
  level: number;
  xp: number;
  bdagBalance: string;
  portfolioValue: string;
  globalRank?: number;
  weeklyXp: number;
  streakDays: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

class AuthManager {
  private static instance: AuthManager;
  private state: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false
  };
  private listeners: ((state: AuthState) => void)[] = [];

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  constructor() {
    // Load auth state from localStorage on initialization
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const token = localStorage.getItem('auth_token');
      const userStr = localStorage.getItem('auth_user');
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        this.state = {
          user,
          token,
          isAuthenticated: true
        };
      }
    } catch (error) {
      console.error('Failed to load auth state from storage:', error);
      this.clearStorage();
    }
  }

  private saveToStorage() {
    try {
      if (this.state.token && this.state.user) {
        localStorage.setItem('auth_token', this.state.token);
        localStorage.setItem('auth_user', JSON.stringify(this.state.user));
      } else {
        this.clearStorage();
      }
    } catch (error) {
      console.error('Failed to save auth state to storage:', error);
    }
  }

  private clearStorage() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  getState(): AuthState {
    return { ...this.state };
  }

  getToken(): string | null {
    return this.state.token;
  }

  getUser(): User | null {
    return this.state.user;
  }

  isAuthenticated(): boolean {
    return this.state.isAuthenticated && !!this.state.token && !!this.state.user;
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Login failed' };
      }

      const data = await response.json();
      
      this.state = {
        user: data.user,
        token: data.token,
        isAuthenticated: true
      };

      this.saveToStorage();
      this.notifyListeners();

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    walletAddress?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Registration failed' };
      }

      const data = await response.json();
      
      this.state = {
        user: data.user,
        token: data.token,
        isAuthenticated: true
      };

      this.saveToStorage();
      this.notifyListeners();

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }

  logout(): void {
    this.state = {
      user: null,
      token: null,
      isAuthenticated: false
    };

    this.clearStorage();
    this.notifyListeners();
  }

  updateUser(updates: Partial<User>): void {
    if (this.state.user) {
      this.state = {
        ...this.state,
        user: { ...this.state.user, ...updates }
      };
      
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  async updateWalletAddress(walletAddress: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isAuthenticated()) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await fetch('/api/user/wallet', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.state.token}`,
        },
        body: JSON.stringify({ walletAddress }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Failed to update wallet' };
      }

      this.updateUser({ walletAddress });
      return { success: true };
    } catch (error) {
      console.error('Wallet update error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }

  async refreshProfile(): Promise<{ success: boolean; error?: string }> {
    if (!this.isAuthenticated()) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${this.state.token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Token is invalid, logout user
          this.logout();
          return { success: false, error: 'Session expired. Please login again.' };
        }
        
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Failed to refresh profile' };
      }

      const userData = await response.json();
      this.updateUser(userData);
      
      return { success: true };
    } catch (error) {
      console.error('Profile refresh error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }

  // Helper method to get authorization headers
  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.state.token) {
      headers['Authorization'] = `Bearer ${this.state.token}`;
    }

    return headers;
  }

  // Check if token is expired (basic check)
  isTokenExpired(): boolean {
    if (!this.state.token) return true;
    
    try {
      // JWT tokens have 3 parts separated by dots
      const tokenParts = this.state.token.split('.');
      if (tokenParts.length !== 3) return true;
      
      // Decode the payload (second part)
      const payload = JSON.parse(atob(tokenParts[1]));
      const currentTime = Date.now() / 1000;
      
      // Check if token has expired
      return payload.exp && payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }
}

// Export singleton instance
export const authManager = AuthManager.getInstance();

// Helper functions for React components
export const useAuth = () => {
  const [authState, setAuthState] = useState(authManager.getState());

  useEffect(() => {
    const unsubscribe = authManager.subscribe(setAuthState);
    
    // Check token expiration on mount
    if (authManager.isTokenExpired()) {
      authManager.logout();
    }
    
    return unsubscribe;
  }, []);

  return {
    ...authState,
    login: authManager.login.bind(authManager),
    register: authManager.register.bind(authManager),
    logout: authManager.logout.bind(authManager),
    updateUser: authManager.updateUser.bind(authManager),
    updateWalletAddress: authManager.updateWalletAddress.bind(authManager),
    refreshProfile: authManager.refreshProfile.bind(authManager),
    getAuthHeaders: authManager.getAuthHeaders.bind(authManager),
  };
};

// Helper for making authenticated API requests
export const apiRequest = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const authHeaders = authManager.getAuthHeaders();
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...authHeaders,
      ...options.headers,
    },
  });

  // Handle authentication errors globally
  if (response.status === 401 || response.status === 403) {
    authManager.logout();
    window.location.href = '/login';
  }

  return response;
};

export type { User, AuthState };
