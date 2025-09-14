import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GoalModal } from "@/components/GoalModal";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, Target, PiggyBank, Plane, Car, Home } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Goal } from "@shared/schema";
import type { GoalsResponse } from "@/types/api";

export default function Goals() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>();

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

  const { data: goals, isLoading: isGoalsLoading } = useQuery<GoalsResponse>({
    queryKey: ["/api/goals"],
    enabled: isAuthenticated,
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/goals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Success",
        description: "Goal deleted successfully",
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
        description: "Failed to delete goal",
        variant: "destructive",
      });
    },
  });

  const addMoneyMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      const goal = goals?.find((g: Goal) => g.id === id);
      if (!goal) throw new Error("Goal not found");
      
      const newCurrentAmount = parseFloat(goal.currentAmount || "0") + amount;
      return await apiRequest("PUT", `/api/goals/${id}`, {
        currentAmount: newCurrentAmount,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Success",
        description: "Money added to goal successfully",
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
        description: "Failed to add money to goal",
        variant: "destructive",
      });
    },
  });

  const handleAddGoal = () => {
    setEditingGoal(undefined);
    setIsModalOpen(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleDeleteGoal = async (id: string) => {
    if (confirm("Are you sure you want to delete this goal?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleAddMoney = (id: string) => {
    const amount = prompt("How much would you like to add to this goal?");
    if (amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0) {
      addMoneyMutation.mutate({ id, amount: parseFloat(amount) });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getGoalIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('emergency') || lowerName.includes('fund')) {
      return <PiggyBank className="w-6 h-6 text-green-600" />;
    }
    if (lowerName.includes('vacation') || lowerName.includes('travel') || lowerName.includes('trip')) {
      return <Plane className="w-6 h-6 text-blue-600" />;
    }
    if (lowerName.includes('car') || lowerName.includes('vehicle')) {
      return <Car className="w-6 h-6 text-purple-600" />;
    }
    if (lowerName.includes('house') || lowerName.includes('home')) {
      return <Home className="w-6 h-6 text-orange-600" />;
    }
    return <Target className="w-6 h-6 text-primary" />;
  };

  const calculateMonthlyRequired = (goal: Goal) => {
    if (!goal.targetDate) return 0;
    
    const targetDate = new Date(goal.targetDate);
    const today = new Date();
    const monthsRemaining = Math.max(1, (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30));
    const remaining = parseFloat(goal.targetAmount) - parseFloat(goal.currentAmount || "0");
    
    return Math.max(0, remaining / monthsRemaining);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-16" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-2 w-full mb-4" />
                <div className="flex justify-between mb-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex space-x-2">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 w-16" />
                </div>
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

  return (
    <div className="p-6 space-y-6" data-testid="page-goals">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Financial Goals</h2>
        <Button onClick={handleAddGoal} data-testid="button-add-goal">
          <Plus className="w-4 h-4 mr-2" />
          Add Goal
        </Button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isGoalsLoading ? (
          [...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-16" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-2 w-full mb-4" />
                <div className="flex justify-between mb-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex space-x-2">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : goals && goals.length > 0 ? (
          goals.map((goal: Goal) => {
            const currentAmount = parseFloat(goal.currentAmount || "0");
            const targetAmount = parseFloat(goal.targetAmount);
            const percentage = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
            const monthlyRequired = calculateMonthlyRequired(goal);

            return (
              <Card key={goal.id} data-testid={`goal-card-${goal.id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        {getGoalIcon(goal.name)}
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold text-card-foreground">
                          {goal.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {goal.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(currentAmount)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        of {formatCurrency(targetAmount)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Progress</span>
                      <span className="text-sm font-medium text-card-foreground">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={Math.min(percentage, 100)} className="h-2" />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span>
                      Target Date: {goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : "Not set"}
                    </span>
                    {goal.targetDate && (
                      <span>Need: {formatCurrency(monthlyRequired)}/month</span>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleAddMoney(goal.id)}
                      disabled={addMoneyMutation.isPending}
                      data-testid={`button-add-money-${goal.id}`}
                    >
                      Add Money
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleEditGoal(goal)}
                      data-testid={`button-edit-goal-${goal.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDeleteGoal(goal.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-goal-${goal.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">No goals set yet. Start by creating your first financial goal!</p>
            <Button className="mt-4" onClick={handleAddGoal}>
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </div>
        )}
      </div>

      <GoalModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        goal={editingGoal}
      />
    </div>
  );
}
