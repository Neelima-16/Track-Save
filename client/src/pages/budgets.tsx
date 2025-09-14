import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BudgetModal } from "@/components/BudgetModal";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, PiggyBank, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Budget } from "@shared/schema";
import type { BudgetsResponse } from "@/types/api";

export default function Budgets() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | undefined>();

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

  const { data: budgets, isLoading: isBudgetsLoading } = useQuery<BudgetsResponse>({
    queryKey: ["/api/budgets"],
    enabled: isAuthenticated,
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/budgets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      toast({
        title: "Success",
        description: "Budget deleted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to delete budget",
        variant: "destructive",
      });
    },
  });

  const handleAddBudget = () => {
    setEditingBudget(undefined);
    setIsModalOpen(true);
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setIsModalOpen(true);
  };

  const handleDeleteBudget = async (id: string) => {
    if (confirm("Are you sure you want to delete this budget?")) {
      deleteMutation.mutate(id);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getCategoryIcon = (category: string) => {
    return <PiggyBank className="w-5 h-5" />;
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      food: "Food & Dining",
      transportation: "Transportation",
      entertainment: "Entertainment",
      utilities: "Utilities",
      healthcare: "Healthcare",
      shopping: "Shopping",
      other: "Other",
    };
    return labels[category] || category;
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
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

  // Calculate budget overview
  const totalBudget = budgets?.reduce((sum: number, budget: Budget) => sum + parseFloat(budget.amount), 0) || 0;
  const totalSpent = 0; // This would come from transaction data
  const remaining = totalBudget - totalSpent;

  return (
    <div className="p-6 space-y-6" data-testid="page-budgets">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Budget Management</h2>
        <Button onClick={handleAddBudget} data-testid="button-add-budget">
          <Plus className="w-4 h-4 mr-2" />
          Add Budget
        </Button>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-card-foreground">
              Monthly Budget
            </CardTitle>
            <div className="text-3xl font-bold text-primary" data-testid="text-total-budget">
              {formatCurrency(totalBudget)}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Total allocated for this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-card-foreground">
              Spent
            </CardTitle>
            <div className="text-3xl font-bold text-red-600" data-testid="text-total-spent">
              {formatCurrency(totalSpent)}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}% of budget used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-card-foreground">
              Remaining
            </CardTitle>
            <div className="text-3xl font-bold text-green-600" data-testid="text-remaining-budget">
              {formatCurrency(remaining)}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {totalBudget > 0 ? ((remaining / totalBudget) * 100).toFixed(1) : 0}% left to spend
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isBudgetsLoading ? (
          [...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-16" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-3 w-full mb-4" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : budgets && budgets.length > 0 ? (
          budgets.map((budget: Budget) => {
            const budgetAmount = parseFloat(budget.amount);
            const spent = 0; // This would come from transaction data
            const remaining = budgetAmount - spent;
            const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
            const isOverBudget = percentage > 100;

            return (
              <Card
                key={budget.id}
                className={isOverBudget ? "border-red-200 bg-red-50 dark:bg-red-950/20" : ""}
                data-testid={`budget-card-${budget.id}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isOverBudget ? 'bg-red-500/10' : 'bg-primary/10'
                      }`}>
                        {isOverBudget ? (
                          <AlertTriangle className={`w-5 h-5 ${isOverBudget ? 'text-red-600' : 'text-primary'}`} />
                        ) : (
                          getCategoryIcon(budget.category)
                        )}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-card-foreground">
                          {getCategoryLabel(budget.category)}
                        </h4>
                        <p className="text-sm text-muted-foreground capitalize">
                          {budget.period} Budget
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(spent)} / {formatCurrency(budgetAmount)}
                      </p>
                      <p className={`text-sm font-medium ${
                        isOverBudget ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {percentage.toFixed(1)}% used {isOverBudget && '⚠️'}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="w-full bg-secondary rounded-full h-3 mb-4">
                    <div
                      className={`h-3 rounded-full ${
                        isOverBudget ? 'bg-red-500' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${
                      isOverBudget ? 'text-red-600 font-medium' : 'text-muted-foreground'
                    }`}>
                      {isOverBudget ? `Over budget by: ${formatCurrency(spent - budgetAmount)}` : `Remaining: ${formatCurrency(remaining)}`}
                    </span>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditBudget(budget)}
                        data-testid={`button-edit-budget-${budget.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBudget(budget.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-budget-${budget.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">No budgets set up yet. Start by creating your first budget!</p>
            <Button className="mt-4" onClick={handleAddBudget}>
              <Plus className="w-4 h-4 mr-2" />
              Add Budget
            </Button>
          </div>
        )}
      </div>

      <BudgetModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        budget={editingBudget}
      />
    </div>
  );
}
