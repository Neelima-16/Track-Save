import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/providers/ThemeProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign, Moon, Sun, User, LogOut } from "lucide-react";
import { useState } from "react";

const currencies = [
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "JPY", label: "JPY (¥)" },
];

export function Header() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [currency, setCurrency] = useState("USD");

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-card-foreground">FinanceTracker</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Currency Selector */}
          <Select value={currency} onValueChange={setCurrency} data-testid="select-currency">
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((curr) => (
                <SelectItem key={curr.value} value={curr.value}>
                  {curr.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild data-testid="button-user-menu">
              <Button variant="ghost" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-foreground">
                    {getInitials(user?.firstName, user?.lastName)}
                  </span>
                </div>
                <span className="text-sm font-medium text-card-foreground hidden sm:block">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email || "User"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem data-testid="menu-item-profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} data-testid="menu-item-logout">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
