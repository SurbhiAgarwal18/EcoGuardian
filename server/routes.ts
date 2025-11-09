import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertCarbonEntrySchema, insertGoalSchema } from "@shared/schema";
import { getChatResponse, getProductRecommendations, generateResourcePredictions, generateRoomRedesign } from "./ai";
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
  app.set('trust proxy', 1);
  
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "ecoguardian-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: 'auto',
        httpOnly: true,
        sameSite: 'lax',
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

  app.get("/api/dashboard-metrics", requireAuth, async (req: Request, res: Response) => {
    try {
      const entries = await storage.getCarbonEntriesByUser(req.session.userId!);
      
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayEntries = entries.filter(e => new Date(e.date) >= startOfToday);
      const todayTotal = todayEntries.reduce((sum, entry) => sum + entry.amount, 0);
      
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const last7Days = entries.filter(e => new Date(e.date) >= sevenDaysAgo);
      const weeklyTotal = last7Days.reduce((sum, e) => sum + e.amount, 0);
      const averageDaily = last7Days.length > 0 ? weeklyTotal / 7 : 0;
      
      const potentialCarbon = averageDaily > 0 ? averageDaily * 1.5 : 0;
      const carbonSavedToday = averageDaily > 0 ? Math.max(0, potentialCarbon - todayTotal) : 0;
      
      const categoryCount = Object.keys(entries.reduce((acc, e) => {
        acc[e.category] = true;
        return acc;
      }, {} as Record<string, boolean>)).length;
      
      const sustainabilityScore = Math.min(100, Math.round(
        (entries.length >= 7 ? 30 : entries.length * 4) +
        (averageDaily > 0 && carbonSavedToday > 0 ? 25 : 0) +
        (categoryCount >= 3 ? 25 : categoryCount * 8) +
        (averageDaily > 0 && averageDaily < 15 ? 20 : averageDaily > 0 && averageDaily < 25 ? 10 : 0)
      ));
      
      res.json({
        carbonSavedToday: carbonSavedToday.toFixed(1),
        sustainabilityScore,
        todayTotal: todayTotal.toFixed(1),
        averageDaily: averageDaily.toFixed(1)
      });
    } catch (error) {
      console.error("Dashboard metrics error:", error);
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

  app.post("/api/room-redesign", requireAuth, async (req: Request, res: Response) => {
    try {
      const { roomRequest } = req.body;

      if (!roomRequest || typeof roomRequest !== 'string') {
        return res.status(400).json({ error: "Room request is required" });
      }

      const { recommendations, roomType } = await generateRoomRedesign(roomRequest);

      const imageMap: Record<string, string> = {
        bedroom: "Sustainable_bedroom_with_eco_furniture_d9ade003.png",
        living_room: "Sustainable_living_room_eco_design_4d099e2b.png",
        kitchen: "Sustainable_kitchen_eco_design_d360f33b.png",
        office: "Sustainable_home_office_eco_design_6b5e70f5.png",
        general: "Sustainable_bedroom_with_eco_furniture_d9ade003.png"
      };

      const imagePath = imageMap[roomType] || imageMap.general;

      res.json({ 
        recommendations, 
        roomType,
        imagePath
      });
    } catch (error) {
      console.error("Room redesign error:", error);
      res.status(500).json({ error: "Failed to generate room redesign" });
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

  app.post("/api/eco-route", requireAuth, async (req: Request, res: Response) => {
    try {
      const { start, end } = req.body;
      
      if (!start || !end) {
        return res.status(400).json({ error: "Start and end locations are required" });
      }

      const baseDistance = 10 + Math.random() * 20;
      const ecoDistance = baseDistance * (1.05 + Math.random() * 0.1);
      
      const standardTime = baseDistance * 2.5 + Math.random() * 10;
      const ecoTime = ecoDistance * 2.2 + Math.random() * 5;
      
      const avgFuelConsumption = 0.08;
      const standardFuel = baseDistance * avgFuelConsumption;
      const ecoFuel = ecoDistance * (avgFuelConsumption * 0.65);
      const fuelSaved = standardFuel - ecoFuel;
      
      const co2PerLiter = 2.31;
      const standardCO2 = standardFuel * co2PerLiter;
      const ecoCO2 = ecoFuel * co2PerLiter;
      const co2Saved = standardCO2 - ecoCO2;
      
      const trafficLevels = ["Low", "Moderate", "High"];
      const standardTraffic = trafficLevels[Math.floor(Math.random() * 3)];
      const ecoTraffic = trafficLevels[Math.floor(Math.random() * 2)];
      
      const waypoints = [
        { lat: 40.7128 + Math.random() * 0.1, lng: -74.0060 + Math.random() * 0.1, name: start },
        { lat: 40.7128 + Math.random() * 0.15, lng: -74.0060 + Math.random() * 0.15, name: "Via Green Park" },
        { lat: 40.7128 + Math.random() * 0.2, lng: -74.0060 + Math.random() * 0.2, name: "Via Eco Boulevard" },
        { lat: 40.7128 + Math.random() * 0.25, lng: -74.0060 + Math.random() * 0.25, name: end },
      ];

      const route = {
        standardRoute: {
          distance: parseFloat(baseDistance.toFixed(2)),
          time: parseFloat(standardTime.toFixed(1)),
          fuel: parseFloat(standardFuel.toFixed(2)),
          co2: parseFloat(standardCO2.toFixed(2)),
          traffic: standardTraffic,
        },
        ecoRoute: {
          distance: parseFloat(ecoDistance.toFixed(2)),
          time: parseFloat(ecoTime.toFixed(1)),
          fuel: parseFloat(ecoFuel.toFixed(2)),
          co2: parseFloat(ecoCO2.toFixed(2)),
          traffic: ecoTraffic,
          waypoints,
        },
        savings: {
          fuel: parseFloat(fuelSaved.toFixed(2)),
          co2: parseFloat(co2Saved.toFixed(2)),
          cost: parseFloat((fuelSaved * 1.5).toFixed(2)),
        },
      };

      res.json(route);
    } catch (error) {
      console.error("Eco-route error:", error);
      res.status(500).json({ error: "Failed to calculate eco-route" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
