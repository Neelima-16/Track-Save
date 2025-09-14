import {
  users,
  transactions,
  budgets,
  goals,
  type User,
  type UpsertUser,
  type Transaction,
  type InsertTransaction,
  type Budget,
  type InsertBudget,
  type Goal,
  type InsertGoal,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, sum, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Transaction operations
  getTransactions(userId: string, filters?: {
    startDate?: string;
    endDate?: string;
    category?: string;
    type?: string;
  }): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction & { userId: string }): Promise<Transaction>;
  updateTransaction(id: string, userId: string, updates: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: string, userId: string): Promise<boolean>;
  
  // Budget operations
  getBudgets(userId: string): Promise<Budget[]>;
  createBudget(budget: InsertBudget & { userId: string }): Promise<Budget>;
  updateBudget(id: string, userId: string, updates: Partial<InsertBudget>): Promise<Budget | undefined>;
  deleteBudget(id: string, userId: string): Promise<boolean>;
  
  // Goal operations
  getGoals(userId: string): Promise<Goal[]>;
  createGoal(goal: InsertGoal & { userId: string }): Promise<Goal>;
  updateGoal(id: string, userId: string, updates: Partial<InsertGoal>): Promise<Goal | undefined>;
  deleteGoal(id: string, userId: string): Promise<boolean>;
  
  // Analytics operations
  getDashboardData(userId: string): Promise<{
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    savingsRate: number;
  }>;
  
  getExpensesByCategory(userId: string, startDate: string, endDate: string): Promise<Array<{
    category: string;
    amount: number;
  }>>;
  
  getIncomeVsExpenses(userId: string, months: number): Promise<Array<{
    month: string;
    income: number;
    expenses: number;
  }>>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Transaction operations
  async getTransactions(userId: string, filters?: {
    startDate?: string;
    endDate?: string;
    category?: string;
    type?: string;
  }): Promise<Transaction[]> {
    let query = db.select().from(transactions).where(eq(transactions.userId, userId));
    
    const conditions = [eq(transactions.userId, userId)];
    
    if (filters?.startDate) {
      conditions.push(gte(transactions.date, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(transactions.date, filters.endDate));
    }
    if (filters?.category) {
      conditions.push(eq(transactions.category, filters.category as any));
    }
    if (filters?.type) {
      conditions.push(eq(transactions.type, filters.type as any));
    }
    
    return await db.select().from(transactions)
      .where(and(...conditions))
      .orderBy(desc(transactions.date));
  }

  async createTransaction(transaction: InsertTransaction & { userId: string }): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async updateTransaction(id: string, userId: string, updates: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const [updated] = await db
      .update(transactions)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .returning();
    return updated;
  }

  async deleteTransaction(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  // Budget operations
  async getBudgets(userId: string): Promise<Budget[]> {
    return await db.select().from(budgets)
      .where(eq(budgets.userId, userId))
      .orderBy(budgets.category);
  }

  async createBudget(budget: InsertBudget & { userId: string }): Promise<Budget> {
    const [newBudget] = await db
      .insert(budgets)
      .values(budget)
      .returning();
    return newBudget;
  }

  async updateBudget(id: string, userId: string, updates: Partial<InsertBudget>): Promise<Budget | undefined> {
    const [updated] = await db
      .update(budgets)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(budgets.id, id), eq(budgets.userId, userId)))
      .returning();
    return updated;
  }

  async deleteBudget(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(budgets)
      .where(and(eq(budgets.id, id), eq(budgets.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  // Goal operations
  async getGoals(userId: string): Promise<Goal[]> {
    return await db.select().from(goals)
      .where(eq(goals.userId, userId))
      .orderBy(goals.createdAt);
  }

  async createGoal(goal: InsertGoal & { userId: string }): Promise<Goal> {
    const [newGoal] = await db
      .insert(goals)
      .values(goal)
      .returning();
    return newGoal;
  }

  async updateGoal(id: string, userId: string, updates: Partial<InsertGoal>): Promise<Goal | undefined> {
    const [updated] = await db
      .update(goals)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(goals.id, id), eq(goals.userId, userId)))
      .returning();
    return updated;
  }

  async deleteGoal(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(goals)
      .where(and(eq(goals.id, id), eq(goals.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  // Analytics operations
  async getDashboardData(userId: string): Promise<{
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    savingsRate: number;
  }> {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const startOfMonth = `${currentMonth}-01`;
    const endOfMonth = `${currentMonth}-31`;

    // Get monthly income
    const incomeResult = await db
      .select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'income'),
        gte(transactions.date, startOfMonth),
        lte(transactions.date, endOfMonth)
      ));

    // Get monthly expenses
    const expenseResult = await db
      .select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'expense'),
        gte(transactions.date, startOfMonth),
        lte(transactions.date, endOfMonth)
      ));

    const monthlyIncome = Number(incomeResult[0]?.total || 0);
    const monthlyExpenses = Number(expenseResult[0]?.total || 0);
    const totalBalance = monthlyIncome - monthlyExpenses;
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

    return {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      savingsRate,
    };
  }

  async getExpensesByCategory(userId: string, startDate: string, endDate: string): Promise<Array<{
    category: string;
    amount: number;
  }>> {
    const result = await db
      .select({
        category: transactions.category,
        amount: sum(transactions.amount),
      })
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'expense'),
        gte(transactions.date, startDate),
        lte(transactions.date, endDate)
      ))
      .groupBy(transactions.category);

    return result.map(row => ({
      category: row.category,
      amount: Number(row.amount || 0),
    }));
  }

  async getIncomeVsExpenses(userId: string, months: number): Promise<Array<{
    month: string;
    income: number;
    expenses: number;
  }>> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    const result = await db
      .select({
        month: sql<string>`to_char(${transactions.date}, 'YYYY-MM')`,
        type: transactions.type,
        amount: sum(transactions.amount),
      })
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        gte(transactions.date, startDate.toISOString().slice(0, 10))
      ))
      .groupBy(sql`to_char(${transactions.date}, 'YYYY-MM')`, transactions.type)
      .orderBy(sql`to_char(${transactions.date}, 'YYYY-MM')`);

    // Transform the result into the expected format
    const monthlyData: { [key: string]: { income: number; expenses: number } } = {};
    
    result.forEach(row => {
      if (!monthlyData[row.month]) {
        monthlyData[row.month] = { income: 0, expenses: 0 };
      }
      
      if (row.type === 'income') {
        monthlyData[row.month].income = Number(row.amount || 0);
      } else {
        monthlyData[row.month].expenses = Number(row.amount || 0);
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      ...data,
    }));
  }
}

export const storage = new DatabaseStorage();
