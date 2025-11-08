import { type User, type InsertUser, type CarbonEntry, type InsertCarbonEntry, type Goal, type InsertGoal, users, carbonEntries, goals } from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createCarbonEntry(entry: InsertCarbonEntry): Promise<CarbonEntry>;
  getCarbonEntriesByUser(userId: string): Promise<CarbonEntry[]>;
  getCarbonEntriesByUserAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<CarbonEntry[]>;
  
  createGoal(goal: InsertGoal): Promise<Goal>;
  getGoalsByUser(userId: string): Promise<Goal[]>;
  getActiveGoalByUser(userId: string): Promise<Goal | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private carbonEntries: Map<string, CarbonEntry>;
  private goals: Map<string, Goal>;

  constructor() {
    this.users = new Map();
    this.carbonEntries = new Map();
    this.goals = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createCarbonEntry(insertEntry: InsertCarbonEntry): Promise<CarbonEntry> {
    const id = randomUUID();
    const entry: CarbonEntry = {
      ...insertEntry,
      description: insertEntry.description || null,
      id,
      date: new Date(),
    };
    this.carbonEntries.set(id, entry);
    return entry;
  }

  async getCarbonEntriesByUser(userId: string): Promise<CarbonEntry[]> {
    return Array.from(this.carbonEntries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async getCarbonEntriesByUserAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<CarbonEntry[]> {
    return Array.from(this.carbonEntries.values())
      .filter(entry => 
        entry.userId === userId &&
        entry.date >= startDate &&
        entry.date <= endDate
      )
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const id = randomUUID();
    const goal: Goal = {
      ...insertGoal,
      id,
      createdAt: new Date(),
    };
    this.goals.set(id, goal);
    return goal;
  }

  async getGoalsByUser(userId: string): Promise<Goal[]> {
    return Array.from(this.goals.values())
      .filter(goal => goal.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getActiveGoalByUser(userId: string): Promise<Goal | undefined> {
    const goals = await this.getGoalsByUser(userId);
    return goals[0];
  }
}

export class DbStorage implements IStorage {
  private db;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    const pool = new Pool({ 
      connectionString
    });
    this.db = drizzle(pool);
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async createCarbonEntry(insertEntry: InsertCarbonEntry): Promise<CarbonEntry> {
    const result = await this.db.insert(carbonEntries).values(insertEntry).returning();
    return result[0];
  }

  async getCarbonEntriesByUser(userId: string): Promise<CarbonEntry[]> {
    return await this.db
      .select()
      .from(carbonEntries)
      .where(eq(carbonEntries.userId, userId))
      .orderBy(desc(carbonEntries.date));
  }

  async getCarbonEntriesByUserAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CarbonEntry[]> {
    return await this.db
      .select()
      .from(carbonEntries)
      .where(
        and(
          eq(carbonEntries.userId, userId),
          gte(carbonEntries.date, startDate),
          lte(carbonEntries.date, endDate)
        )
      )
      .orderBy(desc(carbonEntries.date));
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const result = await this.db.insert(goals).values(insertGoal).returning();
    return result[0];
  }

  async getGoalsByUser(userId: string): Promise<Goal[]> {
    return await this.db
      .select()
      .from(goals)
      .where(eq(goals.userId, userId))
      .orderBy(desc(goals.createdAt));
  }

  async getActiveGoalByUser(userId: string): Promise<Goal | undefined> {
    const result = await this.db
      .select()
      .from(goals)
      .where(eq(goals.userId, userId))
      .orderBy(desc(goals.createdAt))
      .limit(1);
    return result[0];
  }
}

export const storage = new DbStorage();
