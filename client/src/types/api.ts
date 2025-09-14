import type { User, Transaction, Budget, Goal } from "@shared/schema";

export interface DashboardData {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
}

export interface ExpenseCategory {
  category: string;
  amount: number;
}

export interface IncomeVsExpense {
  month: string;
  income: number;
  expenses: number;
}

// API Response types
export type UserResponse = User | null;
export type TransactionsResponse = Transaction[];
export type BudgetsResponse = Budget[];
export type GoalsResponse = Goal[];
export type DashboardResponse = DashboardData;
export type ExpensesByCategoryResponse = ExpenseCategory[];
export type IncomeVsExpensesResponse = IncomeVsExpense[];