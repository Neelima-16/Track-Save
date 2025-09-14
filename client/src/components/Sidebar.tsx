import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Receipt, 
  PiggyBank, 
  Target, 
  FileText,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Transactions", href: "/transactions", icon: Receipt },
  { name: "Budgets", href: "/budgets", icon: PiggyBank },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Reports", href: "/reports", icon: FileText },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile sidebar toggle */}
      <button
        data-testid="button-sidebar-toggle"
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card border border-border rounded-md shadow-md"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          data-testid="overlay-sidebar"
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "w-64 bg-card border-r border-border overflow-y-auto transition-transform duration-300",
          "lg:translate-x-0 fixed lg:relative z-40 h-full",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        <nav className="p-4 space-y-2" data-testid="nav-sidebar">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.name} href={item.href}>
                <a
                  data-testid={`link-nav-${item.name.toLowerCase()}`}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg",
                    "transition-colors duration-200",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </a>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
