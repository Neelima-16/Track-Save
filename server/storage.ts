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
import { db, hasDatabase } from "./db";
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
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month
    
    const startOfMonthStr = startOfMonth.toISOString().slice(0, 10); // YYYY-MM-DD format
    const endOfMonthStr = endOfMonth.toISOString().slice(0, 10); // YYYY-MM-DD format

    // Get monthly income
    const incomeResult = await db
      .select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'income'),
        gte(transactions.date, startOfMonthStr),
        lte(transactions.date, endOfMonthStr)
      ));

    // Get monthly expenses
    const expenseResult = await db
      .select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'expense'),
        gte(transactions.date, startOfMonthStr),
        lte(transactions.date, endOfMonthStr)
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

export class MemoryStorage implements IStorage {
  private users = new Map<string, User>();
  private transactions = new Map<string, Transaction>();
  private budgets = new Map<string, Budget>();
  private goals = new Map<string, Goal>();

  private generateId(): string {
    return crypto.randomUUID();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const userId = userData.id ?? this.generateId();
    const existing = this.users.get(userId);
    const now = new Date();
    const user: User = {
      id: userId,
      email: userData.email ?? null,
      firstName: userData.firstName ?? null,
      lastName: userData.lastName ?? null,
      profileImageUrl: userData.profileImageUrl ?? null,
      defaultCurrency: userData.defaultCurrency ?? "INR",
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    this.users.set(user.id, user);
    return user;
  }

  async getTransactions(userId: string, filters?: {
    startDate?: string;
    endDate?: string;
    category?: string;
    type?: string;
  }): Promise<Transaction[]> {
    let list = Array.from(this.transactions.values()).filter((t) => t.userId === userId);

    if (filters?.startDate) {
      list = list.filter((t) => t.date >= filters.startDate!);
    }
    if (filters?.endDate) {
      list = list.filter((t) => t.date <= filters.endDate!);
    }
    if (filters?.category) {
      list = list.filter((t) => t.category === filters.category);
    }
    if (filters?.type) {
      list = list.filter((t) => t.type === filters.type);
    }

    return list.sort((a, b) => b.date.localeCompare(a.date));
  }

  async createTransaction(transaction: InsertTransaction & { userId: string }): Promise<Transaction> {
    const now = new Date();
    const row: Transaction = {
      id: this.generateId(),
      userId: transaction.userId,
      type: transaction.type,
      description: transaction.description,
      amount: transaction.amount,
      category: transaction.category,
      date: transaction.date,
      currency: transaction.currency ?? "INR",
      createdAt: now,
      updatedAt: now,
    };
    this.transactions.set(row.id, row);
    return row;
  }

  async updateTransaction(id: string, userId: string, updates: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const existing = this.transactions.get(id);
    if (!existing || existing.userId !== userId) {
      return undefined;
    }

    const updated: Transaction = {
      ...existing,
      ...updates,
      currency: updates.currency ?? existing.currency,
      updatedAt: new Date(),
    };
    this.transactions.set(id, updated);
    return updated;
  }

  async deleteTransaction(id: string, userId: string): Promise<boolean> {
    const existing = this.transactions.get(id);
    if (!existing || existing.userId !== userId) {
      return false;
    }
    return this.transactions.delete(id);
  }

  async getBudgets(userId: string): Promise<Budget[]> {
    return Array.from(this.budgets.values())
      .filter((b) => b.userId === userId)
      .sort((a, b) => a.category.localeCompare(b.category));
  }

  async createBudget(budget: InsertBudget & { userId: string }): Promise<Budget> {
    const now = new Date();
    const row: Budget = {
      id: this.generateId(),
      userId: budget.userId,
      category: budget.category,
      amount: budget.amount,
      period: budget.period ?? "monthly",
      currency: budget.currency ?? "INR",
      createdAt: now,
      updatedAt: now,
    };
    this.budgets.set(row.id, row);
    return row;
  }

  async updateBudget(id: string, userId: string, updates: Partial<InsertBudget>): Promise<Budget | undefined> {
    const existing = this.budgets.get(id);
    if (!existing || existing.userId !== userId) {
      return undefined;
    }

    const updated: Budget = {
      ...existing,
      ...updates,
      period: updates.period ?? existing.period,
      currency: updates.currency ?? existing.currency,
      updatedAt: new Date(),
    };
    this.budgets.set(id, updated);
    return updated;
  }

  async deleteBudget(id: string, userId: string): Promise<boolean> {
    const existing = this.budgets.get(id);
    if (!existing || existing.userId !== userId) {
      return false;
    }
    return this.budgets.delete(id);
  }

  async getGoals(userId: string): Promise<Goal[]> {
    return Array.from(this.goals.values())
      .filter((g) => g.userId === userId)
      .sort((a, b) => (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0));
  }

  async createGoal(goal: InsertGoal & { userId: string }): Promise<Goal> {
    const now = new Date();
    const row: Goal = {
      id: this.generateId(),
      userId: goal.userId,
      name: goal.name,
      description: goal.description ?? null,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount ?? "0",
      targetDate: goal.targetDate ?? null,
      currency: goal.currency ?? "INR",
      createdAt: now,
      updatedAt: now,
    };
    this.goals.set(row.id, row);
    return row;
  }

  async updateGoal(id: string, userId: string, updates: Partial<InsertGoal>): Promise<Goal | undefined> {
    const existing = this.goals.get(id);
    if (!existing || existing.userId !== userId) {
      return undefined;
    }

    const updated: Goal = {
      ...existing,
      ...updates,
      description: updates.description ?? existing.description,
      currentAmount: updates.currentAmount ?? existing.currentAmount,
      targetDate: updates.targetDate ?? existing.targetDate,
      currency: updates.currency ?? existing.currency,
      updatedAt: new Date(),
    };
    this.goals.set(id, updated);
    return updated;
  }

  async deleteGoal(id: string, userId: string): Promise<boolean> {
    const existing = this.goals.get(id);
    if (!existing || existing.userId !== userId) {
      return false;
    }
    return this.goals.delete(id);
  }

  async getDashboardData(userId: string): Promise<{
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    savingsRate: number;
  }> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const monthPrefix = `${year}-${month}`;

    const userTransactions = Array.from(this.transactions.values()).filter(
      (t) => t.userId === userId && t.date.startsWith(monthPrefix),
    );

    const monthlyIncome = userTransactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const monthlyExpenses = userTransactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const totalBalance = monthlyIncome - monthlyExpenses;
    const savingsRate = monthlyIncome > 0
      ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100
      : 0;

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
    const byCategory = new Map<string, number>();

    Array.from(this.transactions.values())
      .filter((t) => t.userId === userId)
      .filter((t) => t.type === "expense")
      .filter((t) => t.date >= startDate && t.date <= endDate)
      .forEach((t) => {
        byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + Number(t.amount));
      });

    return Array.from(byCategory.entries()).map(([category, amount]) => ({
      category,
      amount,
    }));
  }

  async getIncomeVsExpenses(userId: string, months: number): Promise<Array<{
    month: string;
    income: number;
    expenses: number;
  }>> {
    const result = new Map<string, { income: number; expenses: number }>();
    const start = new Date();
    start.setMonth(start.getMonth() - months);

    Array.from(this.transactions.values())
      .filter((t) => t.userId === userId)
      .filter((t) => new Date(t.date) >= start)
      .forEach((t) => {
        const key = t.date.slice(0, 7);
        const item = result.get(key) ?? { income: 0, expenses: 0 };

        if (t.type === "income") {
          item.income += Number(t.amount);
        } else {
          item.expenses += Number(t.amount);
        }

        result.set(key, item);
      });

    return Array.from(result.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, values]) => ({ month, ...values }));
  }
}

export const storage = hasDatabase && db
  ? new DatabaseStorage()
  : new MemoryStorage();
