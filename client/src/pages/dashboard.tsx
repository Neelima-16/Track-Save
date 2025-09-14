import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/providers/CurrencyProvider";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { DashboardResponse, TransactionsResponse } from "@/types/api";
import type { Transaction } from "@shared/schema";

export default function Dashboard() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery<DashboardResponse>({
    queryKey: ["/api/dashboard"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: recentTransactions, isLoading: isTransactionsLoading } = useQuery<TransactionsResponse>({
    queryKey: ["/api/transactions"],
    enabled: isAuthenticated,
    retry: false,
  });

  if (isLoading || isDashboardLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="p-6 space-y-6" data-testid="page-dashboard">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Balance
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold" data-testid="text-total-balance">
              {formatCurrency(dashboardData?.totalBalance || 0)}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2.5%</span> vs last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Monthly Income
              </CardTitle>
              <ArrowUp className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600" data-testid="text-monthly-income">
              {formatCurrency(dashboardData?.monthlyIncome || 0)}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8.2%</span> vs last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Monthly Expenses
              </CardTitle>
              <ArrowDown className="h-4 w-4 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-600" data-testid="text-monthly-expenses">
              {formatCurrency(dashboardData?.monthlyExpenses || 0)}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">+3.1%</span> vs last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Savings Rate
              </CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold" data-testid="text-savings-rate">
              {formatPercentage(dashboardData?.savingsRate || 0)}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+1.2%</span> vs last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <a 
              href="/transactions" 
              className="text-primary hover:text-primary/80 text-sm font-medium"
              data-testid="link-view-all-transactions"
            >
              View all
            </a>
          </div>
        </CardHeader>
        <CardContent>
          {isTransactionsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentTransactions && recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {recentTransactions.slice(0, 5).map((transaction: any) => (
                <div key={transaction.id} className="flex items-center justify-between" data-testid={`transaction-${transaction.id}`}>
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      transaction.type === 'income' ? 'bg-green-500/10' : 'bg-red-500/10'
                    }`}>
                      {transaction.type === 'income' ? (
                        <TrendingUp className={`w-5 h-5 ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`} />
                      ) : (
                        <TrendingDown className={`w-5 h-5 ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground capitalize">{transaction.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(parseFloat(transaction.amount))}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No transactions yet. Start by adding your first transaction!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
