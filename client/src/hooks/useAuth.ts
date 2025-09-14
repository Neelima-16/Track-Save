import { useQuery } from "@tanstack/react-query";
import type { UserResponse } from "@/types/api";

export function useAuth() {
  const { data: user, isLoading } = useQuery<UserResponse>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
