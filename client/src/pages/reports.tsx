import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/providers/CurrencyProvider";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, FileText, TrendingUp, TrendingDown, DollarSign, PiggyBank } from "lucide-react";
import type { DashboardResponse, TransactionsResponse } from "@/types/api";
import type { Transaction } from "@shared/schema";

export default function Reports() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();
  const [reportPeriod, setReportPeriod] = useState("month");
  const [reportType, setReportType] = useState("overview");

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

  const { data: transactions, isLoading: isTransactionsLoading } = useQuery<TransactionsResponse>({
    queryKey: ["/api/transactions"],
    enabled: isAuthenticated,
    retry: false,
  });

  const handleExportCSV = () => {
    if (!transactions || transactions.length === 0) {
      toast({
        title: "No Data",
        description: "No transactions available to export",
        variant: "destructive",
      });
      return;
    }

    const headers = ["Date", "Description", "Category", "Type", "Amount"];
    const csvContent = [
      headers.join(","),
      ...transactions.map((transaction: any) => [
        transaction.date,
        `"${transaction.description}"`,
        transaction.category,
        transaction.type,
        transaction.amount
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `financial_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Success",
      description: "Report exported as CSV successfully",
    });
  };

  const handleExportPDF = () => {
    toast({
      title: "Coming Soon",
      description: "PDF export functionality will be available soon",
    });
  };

  const calculateNetWorth = () => {
    const totalIncome = dashboardData?.monthlyIncome || 0;
    const totalExpenses = dashboardData?.monthlyExpenses || 0;
    return totalIncome - totalExpenses;
  };

  const getCategoryBreakdown = () => {
    if (!transactions) return [];

    const categoryTotals: { [key: string]: number } = {};
    
    transactions.forEach((transaction: any) => {
      if (transaction.type === 'expense') {
        categoryTotals[transaction.category] = (categoryTotals[transaction.category] || 0) + parseFloat(transaction.amount);
      }
    });

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </CardHeader>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
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

  const categoryBreakdown = getCategoryBreakdown();
  const netWorth = calculateNetWorth();

  return (
    <div className="p-6 space-y-6" data-testid="page-reports">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Reports & Analytics</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleExportCSV}
            data-testid="button-export-csv"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button 
            onClick={handleExportPDF}
            data-testid="button-export-pdf"
          >
            <FileText className="w-4 h-4 mr-2" />
            Generate PDF
          </Button>
        </div>
      </div>

      {/* Report Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Report Period
              </label>
              <Select 
                value={reportPeriod} 
                onValueChange={setReportPeriod}
                data-testid="select-report-period"
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Report Type
              </label>
              <Select 
                value={reportType} 
                onValueChange={setReportType}
                data-testid="select-report-type"
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Financial Overview</SelectItem>
                  <SelectItem value="spending">Spending Analysis</SelectItem>
                  <SelectItem value="trends">Trend Analysis</SelectItem>
                  <SelectItem value="goals">Goal Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Net Worth
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold text-primary" data-testid="text-net-worth">
              {formatCurrency(netWorth)}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">↗ +12.5%</span> vs last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Income
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600" data-testid="text-total-income">
              {formatCurrency(dashboardData?.monthlyIncome || 0)}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">↗ +8.2%</span> vs last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Expenses
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-600" data-testid="text-total-expenses">
              {formatCurrency(dashboardData?.monthlyExpenses || 0)}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">↗ +3.1%</span> vs last period
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
            <div className="text-2xl font-bold text-primary" data-testid="text-savings-rate">
              {(dashboardData?.savingsRate || 0).toFixed(1)}%
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">↗ +2.1%</span> vs last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {isDashboardLoading || isTransactionsLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="w-3 h-3 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="text-right space-y-1">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                ))}
              </div>
            ) : categoryBreakdown.length > 0 ? (
              <div className="space-y-4">
                {categoryBreakdown.slice(0, 8).map((category, index) => {
                  const total = categoryBreakdown.reduce((sum, cat) => sum + cat.amount, 0);
                  const percentage = total > 0 ? (category.amount / total) * 100 : 0;
                  
                  return (
                    <div key={category.category} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: `hsl(${index * 45}, 70%, 50%)` }}
                        />
                        <span className="text-sm font-medium text-card-foreground capitalize">
                          {category.category.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-card-foreground">
                          {formatCurrency(category.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {percentage.toFixed(1)}% of expenses
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No expense data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">Total Transactions</p>
                    <p className="text-xs text-muted-foreground">This period</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-green-600">
                  {transactions?.length || 0}
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">Average Transaction</p>
                    <p className="text-xs text-muted-foreground">This period</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-blue-600">
                  {transactions && transactions.length > 0 
                    ? formatCurrency(
                        transactions.reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0) / transactions.length
                      )
                    : formatCurrency(0)
                  }
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <PiggyBank className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">Categories Used</p>
                    <p className="text-xs text-muted-foreground">This period</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-purple-600">
                  {categoryBreakdown.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
