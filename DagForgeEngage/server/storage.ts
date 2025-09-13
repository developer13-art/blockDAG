import { 
  type User, 
  type InsertUser, 
  type PredictionMarket, 
  type InsertPredictionMarket,
  type Prediction,
  type InsertPrediction,
  type Task,
  type InsertTask,
  type UserTask,
  type InsertUserTask,
  type Achievement,
  type InsertAchievement,
  type UserAchievement,
  type InsertUserAchievement,
  type Reward,
  type InsertReward
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  getLeaderboard(limit?: number): Promise<User[]>;
  
  // Prediction Market operations
  getPredictionMarkets(): Promise<PredictionMarket[]>;
  getPredictionMarket(id: string): Promise<PredictionMarket | undefined>;
  createPredictionMarket(market: InsertPredictionMarket): Promise<PredictionMarket>;
  updatePredictionMarket(id: string, updates: Partial<PredictionMarket>): Promise<PredictionMarket>;
  
  // Prediction operations
  getUserPredictions(userId: string): Promise<Prediction[]>;
  createPrediction(prediction: InsertPrediction): Promise<Prediction>;
  getPredictionsByMarket(marketId: string): Promise<Prediction[]>;
  
  // Task operations
  getTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task>;
  
  // User Task operations
  getUserTasks(userId: string): Promise<UserTask[]>;
  getUserTask(userId: string, taskId: string): Promise<UserTask | undefined>;
  createUserTask(userTask: InsertUserTask): Promise<UserTask>;
  updateUserTask(id: string, updates: Partial<UserTask>): Promise<UserTask>;
  
  // Achievement operations
  getAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: string): Promise<UserAchievement[]>;
  createUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement>;
  updateUserAchievement(id: string, updates: Partial<UserAchievement>): Promise<UserAchievement>;
  
  // Reward operations
  getUserRewards(userId: string): Promise<Reward[]>;
  createReward(reward: InsertReward): Promise<Reward>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private predictionMarkets: Map<string, PredictionMarket> = new Map();
  private predictions: Map<string, Prediction> = new Map();
  private tasks: Map<string, Task> = new Map();
  private userTasks: Map<string, UserTask> = new Map();
  private achievements: Map<string, Achievement> = new Map();
  private userAchievements: Map<string, UserAchievement> = new Map();
  private rewards: Map<string, Reward> = new Map();

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize sample data
    const sampleUser: User = {
      id: "user-1",
      username: "CryptoDev_42",
      email: "cryptodev@example.com",
      password: "hashed_password",
      walletAddress: "0x742d...7A2F",
      role: "validator",
      level: 10,
      xp: 9847,
      bdagBalance: "25847",
      portfolioValue: "12847.52",
      globalRank: 127,
      weeklyXp: 1247,
      streakDays: 7,
      lastActive: new Date(),
      createdAt: new Date(),
    };
    this.users.set(sampleUser.id, sampleUser);

    // Sample prediction markets
    const sampleMarket: PredictionMarket = {
      id: "market-1",
      title: "Network Hash Rate > 50 TH/s by Dec 2024?",
      description: "Will the BlockDAG network hash rate exceed 50 TH/s by December 2024?",
      category: "network",
      endDate: new Date("2024-12-31"),
      totalPool: "12500",
      participantCount: 1247,
      yesPercentage: "67.00",
      noPercentage: "33.00",
      status: "active",
      result: null,
      createdAt: new Date(),
    };
    this.predictionMarkets.set(sampleMarket.id, sampleMarket);

    // Sample tasks
    const sampleTask: Task = {
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
      maxCompletions: null,
      currentCompletions: 47,
      isActive: true,
      createdAt: new Date(),
    };
    this.tasks.set(sampleTask.id, sampleTask);

    // Sample achievements
    const sampleAchievement: Achievement = {
      id: "achievement-1",
      name: "Network Expert",
      description: "Deploy 5 smart contracts successfully",
      icon: "fas fa-code",
      category: "development",
      requirement: { deployments: 5 },
      xpReward: 500,
      bdagReward: "200",
      isActive: true,
      createdAt: new Date(),
    };
    this.achievements.set(sampleAchievement.id, sampleAchievement);
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
      lastActive: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getLeaderboard(limit = 10): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => b.weeklyXp - a.weeklyXp)
      .slice(0, limit);
  }

  // Prediction Market operations
  async getPredictionMarkets(): Promise<PredictionMarket[]> {
    return Array.from(this.predictionMarkets.values())
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getPredictionMarket(id: string): Promise<PredictionMarket | undefined> {
    return this.predictionMarkets.get(id);
  }

  async createPredictionMarket(insertMarket: InsertPredictionMarket): Promise<PredictionMarket> {
    const id = randomUUID();
    const market: PredictionMarket = {
      ...insertMarket,
      id,
      totalPool: "0",
      participantCount: 0,
      yesPercentage: "50.00",
      noPercentage: "50.00",
      createdAt: new Date(),
    };
    this.predictionMarkets.set(id, market);
    return market;
  }

  async updatePredictionMarket(id: string, updates: Partial<PredictionMarket>): Promise<PredictionMarket> {
    const market = this.predictionMarkets.get(id);
    if (!market) throw new Error("Market not found");
    
    const updatedMarket = { ...market, ...updates };
    this.predictionMarkets.set(id, updatedMarket);
    return updatedMarket;
  }

  // Prediction operations
  async getUserPredictions(userId: string): Promise<Prediction[]> {
    return Array.from(this.predictions.values())
      .filter(prediction => prediction.userId === userId);
  }

  async createPrediction(insertPrediction: InsertPrediction): Promise<Prediction> {
    const id = randomUUID();
    const prediction: Prediction = {
      ...insertPrediction,
      id,
      status: "active",
      createdAt: new Date(),
    };
    this.predictions.set(id, prediction);
    return prediction;
  }

  async getPredictionsByMarket(marketId: string): Promise<Prediction[]> {
    return Array.from(this.predictions.values())
      .filter(prediction => prediction.marketId === marketId);
  }

  // Task operations
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => task.isActive)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const task: Task = {
      ...insertTask,
      id,
      currentCompletions: 0,
      createdAt: new Date(),
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const task = this.tasks.get(id);
    if (!task) throw new Error("Task not found");
    
    const updatedTask = { ...task, ...updates };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  // User Task operations
  async getUserTasks(userId: string): Promise<UserTask[]> {
    return Array.from(this.userTasks.values())
      .filter(userTask => userTask.userId === userId);
  }

  async getUserTask(userId: string, taskId: string): Promise<UserTask | undefined> {
    return Array.from(this.userTasks.values())
      .find(userTask => userTask.userId === userId && userTask.taskId === taskId);
  }

  async createUserTask(insertUserTask: InsertUserTask): Promise<UserTask> {
    const id = randomUUID();
    const userTask: UserTask = {
      ...insertUserTask,
      id,
      createdAt: new Date(),
      completedAt: null,
    };
    this.userTasks.set(id, userTask);
    return userTask;
  }

  async updateUserTask(id: string, updates: Partial<UserTask>): Promise<UserTask> {
    const userTask = this.userTasks.get(id);
    if (!userTask) throw new Error("User task not found");
    
    const updatedUserTask = { ...userTask, ...updates };
    this.userTasks.set(id, updatedUserTask);
    return updatedUserTask;
  }

  // Achievement operations
  async getAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values())
      .filter(achievement => achievement.isActive);
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return Array.from(this.userAchievements.values())
      .filter(userAchievement => userAchievement.userId === userId);
  }

  async createUserAchievement(insertUserAchievement: InsertUserAchievement): Promise<UserAchievement> {
    const id = randomUUID();
    const userAchievement: UserAchievement = {
      ...insertUserAchievement,
      id,
      createdAt: new Date(),
      completedAt: null,
    };
    this.userAchievements.set(id, userAchievement);
    return userAchievement;
  }

  async updateUserAchievement(id: string, updates: Partial<UserAchievement>): Promise<UserAchievement> {
    const userAchievement = this.userAchievements.get(id);
    if (!userAchievement) throw new Error("User achievement not found");
    
    const updatedUserAchievement = { ...userAchievement, ...updates };
    this.userAchievements.set(id, updatedUserAchievement);
    return updatedUserAchievement;
  }

  // Reward operations
  async getUserRewards(userId: string): Promise<Reward[]> {
    return Array.from(this.rewards.values())
      .filter(reward => reward.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createReward(insertReward: InsertReward): Promise<Reward> {
    const id = randomUUID();
    const reward: Reward = {
      ...insertReward,
      id,
      createdAt: new Date(),
    };
    this.rewards.set(id, reward);
    return reward;
  }
}

export const storage = new MemStorage();
