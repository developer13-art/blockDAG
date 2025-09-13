import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { insertUserSchema, insertPredictionSchema, insertTaskSchema } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

// JWT middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// WebSocket connection management
interface WebSocketClient {
  ws: WebSocket;
  userId?: string;
  rooms: Set<string>;
}

const wsClients = new Map<WebSocket, WebSocketClient>();

const broadcastToRoom = (room: string, message: any) => {
  const messageStr = JSON.stringify(message);
  wsClients.forEach((client) => {
    if (client.rooms.has(room) && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(messageStr);
    }
  });
};

const broadcastToUser = (userId: string, message: any) => {
  const messageStr = JSON.stringify(message);
  wsClients.forEach((client) => {
    if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(messageStr);
    }
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
      
      res.json({ 
        token, 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email, 
          role: user.role,
          walletAddress: user.walletAddress,
          level: user.level,
          xp: user.xp,
          bdagBalance: user.bdagBalance,
          portfolioValue: user.portfolioValue,
          globalRank: user.globalRank,
          weeklyXp: user.weeklyXp,
          streakDays: user.streakDays
        } 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
      
      res.json({ 
        token, 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email, 
          role: user.role,
          walletAddress: user.walletAddress,
          level: user.level,
          xp: user.xp,
          bdagBalance: user.bdagBalance,
          portfolioValue: user.portfolioValue,
          globalRank: user.globalRank,
          weeklyXp: user.weeklyXp,
          streakDays: user.streakDays
        } 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Protected routes
  app.get("/api/user/profile", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress,
        level: user.level,
        xp: user.xp,
        bdagBalance: user.bdagBalance,
        portfolioValue: user.portfolioValue,
        globalRank: user.globalRank,
        weeklyXp: user.weeklyXp,
        streakDays: user.streakDays
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/user/wallet", authenticateToken, async (req: any, res) => {
    try {
      const { walletAddress } = req.body;
      const user = await storage.updateUser(req.user.userId, { walletAddress });
      
      // Broadcast user update
      broadcastToUser(req.user.userId, {
        type: 'user_stats_update',
        data: {
          id: user.id,
          walletAddress: user.walletAddress,
          bdagBalance: user.bdagBalance,
          portfolioValue: user.portfolioValue
        }
      });
      
      res.json({ walletAddress: user.walletAddress });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Prediction Markets
  app.get("/api/prediction-markets", async (req, res) => {
    try {
      const markets = await storage.getPredictionMarkets();
      res.json(markets);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/prediction-markets", authenticateToken, async (req: any, res) => {
    try {
      // Check if user has permission to create markets (premium/validator only)
      if (req.user.role === "basic") {
        return res.status(403).json({ message: "Upgrade required to create markets" });
      }

      const marketData = req.body;
      const market = await storage.createPredictionMarket(marketData);
      
      // Broadcast new market to all clients
      broadcastToRoom('markets', {
        type: 'market_update',
        data: await storage.getPredictionMarkets()
      });
      
      res.json(market);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/predictions", authenticateToken, async (req: any, res) => {
    try {
      const predictionData = insertPredictionSchema.parse({
        ...req.body,
        userId: req.user.userId,
      });

      // Update user's BDAG balance
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const currentBalance = parseFloat(user.bdagBalance);
      const betAmount = parseFloat(predictionData.amount);
      
      if (currentBalance < betAmount) {
        return res.status(400).json({ message: "Insufficient BDAG balance" });
      }

      const prediction = await storage.createPrediction(predictionData);
      
      // Update user balance
      const updatedUser = await storage.updateUser(req.user.userId, {
        bdagBalance: (currentBalance - betAmount).toString()
      });

      // Update market statistics
      const market = await storage.getPredictionMarket(predictionData.marketId);
      if (market) {
        const predictions = await storage.getPredictionsByMarket(predictionData.marketId);
        const totalPool = predictions.reduce((sum, p) => sum + parseFloat(p.amount), 0);
        const yesAmount = predictions.filter(p => p.prediction).reduce((sum, p) => sum + parseFloat(p.amount), 0);
        const noAmount = predictions.filter(p => !p.prediction).reduce((sum, p) => sum + parseFloat(p.amount), 0);
        
        const updatedMarket = await storage.updatePredictionMarket(predictionData.marketId, {
          totalPool: totalPool.toString(),
          participantCount: predictions.length,
          yesPercentage: totalPool > 0 ? ((yesAmount / totalPool) * 100).toFixed(2) : "50.00",
          noPercentage: totalPool > 0 ? ((noAmount / totalPool) * 100).toFixed(2) : "50.00"
        });

        // Broadcast market update
        broadcastToRoom('markets', {
          type: 'price_update',
          data: {
            marketId: predictionData.marketId,
            totalPool: updatedMarket.totalPool,
            yesPercentage: updatedMarket.yesPercentage,
            noPercentage: updatedMarket.noPercentage,
            participantCount: updatedMarket.participantCount
          }
        });
      }

      // Broadcast user balance update
      broadcastToUser(req.user.userId, {
        type: 'user_stats_update',
        data: {
          id: updatedUser.id,
          bdagBalance: updatedUser.bdagBalance,
          portfolioValue: updatedUser.portfolioValue
        }
      });

      res.json(prediction);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/predictions/user", authenticateToken, async (req: any, res) => {
    try {
      const predictions = await storage.getUserPredictions(req.user.userId);
      res.json(predictions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Tasks
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/tasks", authenticateToken, async (req: any, res) => {
    try {
      // Only validators can create tasks
      if (req.user.role !== "validator") {
        return res.status(403).json({ message: "Only validators can create tasks" });
      }

      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      
      // Broadcast task update
      broadcastToRoom('tasks', {
        type: 'task_update',
        data: await storage.getTasks()
      });
      
      res.json(task);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/tasks/:taskId/start", authenticateToken, async (req: any, res) => {
    try {
      const { taskId } = req.params;
      const userId = req.user.userId;

      // Check if user already started this task
      const existingUserTask = await storage.getUserTask(userId, taskId);
      if (existingUserTask) {
        return res.status(400).json({ message: "Task already started" });
      }

      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      const userTask = await storage.createUserTask({
        userId,
        taskId,
        status: "in_progress",
        progress: 0,
        maxProgress: Array.isArray(task.requirements) ? task.requirements.length : 1,
      });

      // Broadcast user task update
      broadcastToUser(userId, {
        type: 'user_task_update',
        data: await storage.getUserTasks(userId)
      });

      res.json(userTask);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/user-tasks/:userTaskId", authenticateToken, async (req: any, res) => {
    try {
      const { userTaskId } = req.params;
      const { progress } = req.body;

      const existingUserTask = await storage.getUserTasks(req.user.userId);
      const userTaskToUpdate = existingUserTask.find(ut => ut.id === userTaskId);
      
      if (!userTaskToUpdate) {
        return res.status(404).json({ message: "User task not found" });
      }

      const userTask = await storage.updateUserTask(userTaskId, {
        progress,
        status: progress >= userTaskToUpdate.maxProgress ? "completed" : "in_progress",
        completedAt: progress >= userTaskToUpdate.maxProgress ? new Date() : null,
      });

      // If task completed, award rewards
      if (userTask.status === "completed") {
        const task = await storage.getTask(userTask.taskId);
        if (task) {
          // Create reward
          await storage.createReward({
            userId: req.user.userId,
            type: "task_completion",
            source: task.id,
            xpAmount: task.xpReward,
            bdagAmount: task.bdagReward,
            description: `Completed task: ${task.title}`,
          });

          // Update user XP and BDAG balance
          const user = await storage.getUser(req.user.userId);
          if (user) {
            const updatedUser = await storage.updateUser(req.user.userId, {
              xp: user.xp + task.xpReward,
              weeklyXp: user.weeklyXp + task.xpReward,
              bdagBalance: (parseFloat(user.bdagBalance) + parseFloat(task.bdagReward)).toString(),
            });

            // Broadcast user stats update
            broadcastToUser(req.user.userId, {
              type: 'user_stats_update',
              data: {
                id: updatedUser.id,
                xp: updatedUser.xp,
                weeklyXp: updatedUser.weeklyXp,
                bdagBalance: updatedUser.bdagBalance,
                level: updatedUser.level
              }
            });

            // Update leaderboard
            const leaderboard = await storage.getLeaderboard(100);
            broadcastToRoom('leaderboard', {
              type: 'leaderboard_update',
              data: leaderboard.map(u => ({
                id: u.id,
                username: u.username,
                level: u.level,
                xp: u.xp,
                weeklyXp: u.weeklyXp,
                globalRank: u.globalRank,
                role: u.role
              }))
            });
          }
        }
      }

      // Broadcast user task update
      broadcastToUser(req.user.userId, {
        type: 'user_task_update',
        data: await storage.getUserTasks(req.user.userId)
      });

      res.json(userTask);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/user-tasks", authenticateToken, async (req: any, res) => {
    try {
      const userTasks = await storage.getUserTasks(req.user.userId);
      res.json(userTasks);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const leaderboard = await storage.getLeaderboard(Number(limit));
      res.json(leaderboard.map(user => ({
        id: user.id,
        username: user.username,
        level: user.level,
        xp: user.xp,
        weeklyXp: user.weeklyXp,
        globalRank: user.globalRank,
        role: user.role
      })));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Achievements
  app.get("/api/achievements", async (req, res) => {
    try {
      const achievements = await storage.getAchievements();
      res.json(achievements);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/user-achievements", authenticateToken, async (req: any, res) => {
    try {
      const userAchievements = await storage.getUserAchievements(req.user.userId);
      res.json(userAchievements);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Rewards
  app.get("/api/rewards", authenticateToken, async (req: any, res) => {
    try {
      const rewards = await storage.getUserRewards(req.user.userId);
      res.json(rewards);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');

    // Initialize client
    const client: WebSocketClient = {
      ws,
      rooms: new Set(),
    };
    wsClients.set(ws, client);

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        
        // Handle different message types
        switch (data.type) {
          case 'join_room':
            if (data.data && data.data.room) {
              client.rooms.add(data.data.room);
              console.log(`Client joined room: ${data.data.room}`);
              
              // Send initial data for the room
              if (data.data.room === 'leaderboard') {
                storage.getLeaderboard(100).then(leaderboard => {
                  if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                      type: 'leaderboard_update',
                      data: leaderboard.map(u => ({
                        id: u.id,
                        username: u.username,
                        level: u.level,
                        xp: u.xp,
                        weeklyXp: u.weeklyXp,
                        globalRank: u.globalRank,
                        role: u.role
                      }))
                    }));
                  }
                });
              } else if (data.data.room === 'markets') {
                storage.getPredictionMarkets().then(markets => {
                  if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                      type: 'market_update',
                      data: markets
                    }));
                  }
                });
              } else if (data.data.room === 'tasks') {
                storage.getTasks().then(tasks => {
                  if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                      type: 'task_update',
                      data: tasks
                    }));
                  }
                });
              }
            }
            break;
          case 'ping':
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'pong' }));
            }
            break;
          case 'authenticate':
            // Handle user authentication for personalized updates
            if (data.token) {
              try {
                const decoded = jwt.verify(data.token, JWT_SECRET) as any;
                client.userId = decoded.userId;
                console.log(`Client authenticated as user: ${decoded.userId}`);
              } catch (error) {
                console.error('WebSocket authentication failed:', error);
              }
            }
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      wsClients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      wsClients.delete(ws);
    });

    // Send periodic heartbeat and updates
    const interval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        // Send heartbeat
        ws.send(JSON.stringify({
          type: 'heartbeat',
          data: {
            timestamp: new Date().toISOString(),
            connectedClients: wsClients.size
          }
        }));
      } else {
        clearInterval(interval);
      }
    }, 30000); // Every 30 seconds

    ws.on('close', () => {
      clearInterval(interval);
    });
  });

  // Periodic leaderboard updates
  setInterval(async () => {
    try {
      const leaderboard = await storage.getLeaderboard(100);
      broadcastToRoom('leaderboard', {
        type: 'leaderboard_update',
        data: leaderboard.map(u => ({
          id: u.id,
          username: u.username,
          level: u.level,
          xp: u.xp,
          weeklyXp: u.weeklyXp,
          globalRank: u.globalRank,
          role: u.role
        }))
      });
    } catch (error) {
      console.error('Error broadcasting leaderboard update:', error);
    }
  }, 60000); // Every minute

  return httpServer;
}
