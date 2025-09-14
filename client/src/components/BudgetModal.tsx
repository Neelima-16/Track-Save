import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Budget } from "@shared/schema";

const budgetSchema = z.object({
  category: z.enum([
    "food", "transportation", "entertainment", "utilities", "healthcare", 
    "shopping", "other"
  ]),
  amount: z.string().min(1, "Amount is required"),
  period: z.string().default("monthly"),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

interface BudgetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget?: Budget;
}

const categories = [
  { value: "food", label: "Food & Dining" },
  { value: "transportation", label: "Transportation" },
  { value: "entertainment", label: "Entertainment" },
  { value: "utilities", label: "Utilities" },
  { value: "healthcare", label: "Healthcare" },
  { value: "shopping", label: "Shopping" },
  { value: "other", label: "Other" },
];

const periods = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export function BudgetModal({ open, onOpenChange, budget }: BudgetModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!budget;

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category: (budget?.category && ["food", "transportation", "entertainment", "utilities", "healthcare", "shopping", "other"].includes(budget.category)) ? budget.category as any : "other",
      amount: budget?.amount || "",
      period: budget?.period || "monthly",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: BudgetFormData) => {
      const url = isEditing ? `/api/budgets/${budget.id}` : "/api/budgets";
      const method = isEditing ? "PUT" : "POST";
      
      return await apiRequest(method, url, {
        ...data,
        amount: parseFloat(data.amount),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      toast({
        title: "Success",
        description: `Budget ${isEditing ? "updated" : "created"} successfully`,
      });
      onOpenChange(false);
      form.reset();
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
        description: `Failed to ${isEditing ? "update" : "create"} budget`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BudgetFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="modal-budget">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Budget" : "Add Budget"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-budget-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      data-testid="input-budget-amount"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Period</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-budget-period">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {periods.map((period) => (
                        <SelectItem key={period.value} value={period.value}>
                          {period.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-budget"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={mutation.isPending}
                data-testid="button-save-budget"
              >
                {mutation.isPending ? "Saving..." : isEditing ? "Update" : "Add"} Budget
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
