import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertCarbonEntrySchema, insertGoalSchema } from "@shared/schema";
import { getChatResponse, getProductRecommendations, generateResourcePredictions } from "./ai";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePassword(supplied: string, stored: string): Promise<boolean> {
  const [hashedPassword, salt] = stored.split(".");
  const hashedPasswordBuf = Buffer.from(hashedPassword, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedPasswordBuf, suppliedBuf);
}

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "ecoguardian-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    })
  );

  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid input", details: result.error });
      }

      const { username, password } = result.data;

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        password: hashedPassword,
      });

      req.session.userId = user.id;

      res.json({ id: user.id, username: user.username });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid input" });
      }

      const { username, password } = result.data;

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      req.session.userId = user.id;

      res.json({ id: user.id, username: user.username });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ id: user.id, username: user.username });
  });

  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    next();
  };

  app.post("/api/carbon-entries", requireAuth, async (req: Request, res: Response) => {
    try {
      const result = insertCarbonEntrySchema.safeParse({
        ...req.body,
        userId: req.session.userId,
      });

      if (!result.success) {
        return res.status(400).json({ error: "Invalid input", details: result.error });
      }

      const entry = await storage.createCarbonEntry(result.data);
      res.json(entry);
    } catch (error) {
      console.error("Create carbon entry error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/carbon-entries", requireAuth, async (req: Request, res: Response) => {
    try {
      const entries = await storage.getCarbonEntriesByUser(req.session.userId!);
      res.json(entries);
    } catch (error) {
      console.error("Get carbon entries error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/carbon-entries/stats", requireAuth, async (req: Request, res: Response) => {
    try {
      const entries = await storage.getCarbonEntriesByUser(req.session.userId!);
      
      const total = entries.reduce((sum, entry) => sum + entry.amount, 0);
      
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEntries = entries.filter(e => e.date >= startOfMonth);
      const monthTotal = monthEntries.reduce((sum, entry) => sum + entry.amount, 0);
      
      const categoryBreakdown = entries.reduce((acc, entry) => {
        acc[entry.category] = (acc[entry.category] || 0) + entry.amount;
        return acc;
      }, {} as Record<string, number>);

      res.json({
        total,
        monthTotal,
        categoryBreakdown,
        entryCount: entries.length,
      });
    } catch (error) {
      console.error("Get stats error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/carbon-entries/analytics", requireAuth, async (req: Request, res: Response) => {
    try {
      const entries = await storage.getCarbonEntriesByUser(req.session.userId!);
      
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const last30Days = entries.filter(e => e.date >= thirtyDaysAgo);
      const last7Days = entries.filter(e => e.date >= sevenDaysAgo);
      const previousWeek = entries.filter(e => {
        const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        return e.date >= fourteenDaysAgo && e.date < sevenDaysAgo;
      });

      const dailyTotals: Array<{ date: string; amount: number }> = [];
      const dailyMap: Record<string, number> = {};
      
      for (let i = 0; i <= 29; i++) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateKey = date.toISOString().split('T')[0];
        dailyMap[dateKey] = 0;
      }
      
      last30Days.forEach(entry => {
        const dateKey = entry.date.toISOString().split('T')[0];
        if (dateKey in dailyMap) {
          dailyMap[dateKey] += entry.amount;
        }
      });
      
      Object.entries(dailyMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([date, amount]) => {
          dailyTotals.push({ date, amount });
        });

      const categoryTrends: Record<string, Array<{ date: string; amount: number }>> = {
        transportation: [],
        energy: [],
        food: [],
        shopping: [],
      };
      
      ['transportation', 'energy', 'food', 'shopping'].forEach(category => {
        const categoryMap: Record<string, number> = {};
        
        for (let i = 0; i <= 29; i++) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const dateKey = date.toISOString().split('T')[0];
          categoryMap[dateKey] = 0;
        }
        
        last30Days
          .filter(e => e.category === category)
          .forEach(entry => {
            const dateKey = entry.date.toISOString().split('T')[0];
            if (dateKey in categoryMap) {
              categoryMap[dateKey] += entry.amount;
            }
          });
        
        Object.entries(categoryMap)
          .sort(([a], [b]) => a.localeCompare(b))
          .forEach(([date, amount]) => {
            categoryTrends[category].push({ date, amount });
          });
      });

      const thisWeekTotal = last7Days.reduce((sum, e) => sum + e.amount, 0);
      const lastWeekTotal = previousWeek.reduce((sum, e) => sum + e.amount, 0);
      const weekOverWeekChange = lastWeekTotal > 0 
        ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100 
        : 0;

      const categoryBreakdown30Days = last30Days.reduce((acc, entry) => {
        acc[entry.category] = (acc[entry.category] || 0) + entry.amount;
        return acc;
      }, {} as Record<string, number>);

      const topCategory = Object.entries(categoryBreakdown30Days)
        .sort(([, a], [, b]) => b - a)[0];

      res.json({
        dailyTotals,
        categoryTrends,
        weekOverWeekChange,
        thisWeekTotal,
        lastWeekTotal,
        topCategory: topCategory ? { category: topCategory[0], amount: topCategory[1] } : null,
        totalEntries: entries.length,
        averageDaily: last30Days.length > 0 
          ? last30Days.reduce((sum, e) => sum + e.amount, 0) / 30 
          : 0,
      });
    } catch (error) {
      console.error("Get analytics error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/goals", requireAuth, async (req: Request, res: Response) => {
    try {
      const result = insertGoalSchema.safeParse({
        ...req.body,
        userId: req.session.userId,
      });

      if (!result.success) {
        return res.status(400).json({ error: "Invalid input", details: result.error });
      }

      const goal = await storage.createGoal(result.data);
      res.json(goal);
    } catch (error) {
      console.error("Create goal error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/goals", requireAuth, async (req: Request, res: Response) => {
    try {
      const goals = await storage.getGoalsByUser(req.session.userId!);
      res.json(goals);
    } catch (error) {
      console.error("Get goals error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/goals/active", requireAuth, async (req: Request, res: Response) => {
    try {
      const goal = await storage.getActiveGoalByUser(req.session.userId!);
      res.json(goal || null);
    } catch (error) {
      console.error("Get active goal error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/chat", requireAuth, async (req: Request, res: Response) => {
    try {
      const { message } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }

      const entries = await storage.getCarbonEntriesByUser(req.session.userId!);
      const total = entries.reduce((sum, entry) => sum + entry.amount, 0);
      
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEntries = entries.filter(e => e.date >= startOfMonth);
      const monthTotal = monthEntries.reduce((sum, entry) => sum + entry.amount, 0);
      
      const categoryBreakdown = entries.reduce((acc, entry) => {
        acc[entry.category] = (acc[entry.category] || 0) + entry.amount;
        return acc;
      }, {} as Record<string, number>);

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const response = await getChatResponse(message, {
        totalCarbon: total,
        monthCarbon: monthTotal,
        categoryBreakdown,
      });

      res.write(`data: ${JSON.stringify({ response })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to get AI response" });
    }
  });

  app.get("/api/recommendations", requireAuth, async (req: Request, res: Response) => {
    try {
      const entries = await storage.getCarbonEntriesByUser(req.session.userId!);
      const total = entries.reduce((sum, entry) => sum + entry.amount, 0);
      
      const categoryBreakdown = entries.reduce((acc, entry) => {
        acc[entry.category] = (acc[entry.category] || 0) + entry.amount;
        return acc;
      }, {} as Record<string, number>);

      const recommendations = await getProductRecommendations({
        totalCarbon: total,
        categoryBreakdown,
      });

      res.json({ recommendations });
    } catch (error) {
      console.error("Recommendations error:", error);
      res.status(500).json({ error: "Failed to get recommendations" });
    }
  });

  app.get("/api/predictions", requireAuth, async (req: Request, res: Response) => {
    try {
      const entries = await storage.getCarbonEntriesByUser(req.session.userId!);
      
      if (entries.length === 0) {
        return res.json({
          energyPrediction: { value: 0, trend: "stable", confidence: 0 },
          waterPrediction: { value: 0, trend: "stable", confidence: 0 },
          carbonPrediction: { value: 0, trend: "stable", confidence: 0 },
          insights: ["Start tracking your carbon footprint to receive AI-powered predictions"],
          recommendations: ["Add your first carbon entry to get personalized recommendations"]
        });
      }

      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const last7Days = entries.filter(e => e.date >= sevenDaysAgo);
      
      const weeklyTotal = last7Days.reduce((sum, e) => sum + e.amount, 0);
      const dailyAverage = entries.reduce((sum, e) => sum + e.amount, 0) / Math.max(entries.length, 1);
      
      const categoryBreakdown = entries.reduce((acc, entry) => {
        acc[entry.category] = (acc[entry.category] || 0) + entry.amount;
        return acc;
      }, {} as Record<string, number>);

      const topCategory = Object.entries(categoryBreakdown)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || "transportation";

      const predictions = await generateResourcePredictions({
        dailyAverage,
        weeklyTotal,
        topCategory,
        categoryBreakdown,
      });

      res.json(predictions);
    } catch (error) {
      console.error("Predictions error:", error);
      res.status(500).json({ error: "Failed to generate predictions" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
