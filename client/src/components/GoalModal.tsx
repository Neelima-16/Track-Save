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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Goal } from "@shared/schema";

const goalSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  targetAmount: z.string().min(1, "Target amount is required"),
  currentAmount: z.string().optional(),
  targetDate: z.string().optional(),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface GoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: Goal;
}

export function GoalModal({ open, onOpenChange, goal }: GoalModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!goal;

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: goal?.name || "",
      description: goal?.description || "",
      targetAmount: goal?.targetAmount || "",
      currentAmount: goal?.currentAmount || "",
      targetDate: goal?.targetDate || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: GoalFormData) => {
      const url = isEditing ? `/api/goals/${goal.id}` : "/api/goals";
      const method = isEditing ? "PUT" : "POST";
      
      return await apiRequest(method, url, {
        ...data,
        targetAmount: parseFloat(data.targetAmount),
        currentAmount: data.currentAmount ? parseFloat(data.currentAmount) : 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Success",
        description: `Goal ${isEditing ? "updated" : "created"} successfully`,
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
        description: `Failed to ${isEditing ? "update" : "create"} goal`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GoalFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="modal-goal">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Goal" : "Add Goal"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter goal name"
                      data-testid="input-goal-name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter goal description"
                      data-testid="input-goal-description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="targetAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      data-testid="input-goal-target-amount"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="currentAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      data-testid="input-goal-current-amount"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="targetDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      data-testid="input-goal-target-date"
                      {...field}
                    />
                  </FormControl>
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
                data-testid="button-cancel-goal"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={mutation.isPending}
                data-testid="button-save-goal"
              >
                {mutation.isPending ? "Saving..." : isEditing ? "Update" : "Add"} Goal
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
