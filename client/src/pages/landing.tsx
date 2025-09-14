import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Target, BarChart3, Shield } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    // Since we're running on localhost:4000, redirect to the login endpoint
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">FinanceTracker</h1>
          </div>
          <Button 
            onClick={handleLogin} 
            data-testid="button-login" 
            className="bg-blue-500 hover:bg-blue-600"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Take Control of Your Financial Future
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Track expenses, manage budgets, set goals, and get insights into your spending habits. 
            Your comprehensive personal finance companion.
          </p>
          <Button 
            onClick={handleLogin} 
            data-testid="button-get-started" 
            className="bg-blue-500 hover:bg-blue-600 px-8 py-3 text-lg"
          >
            Get Started
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-foreground mb-12">
            Everything You Need to Manage Your Money
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <TrendingUp className="w-10 h-10 text-blue-500 mb-2" />
                <CardTitle>Expense Tracking</CardTitle>
                <CardDescription>
                  Monitor your income and expenses with detailed categorization and insights.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <Shield className="w-10 h-10 text-blue-500 mb-2" />
                <CardTitle>Budget Management</CardTitle>
                <CardDescription>
                  Set monthly budgets for different categories and receive alerts when you exceed limits.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <Target className="w-10 h-10 text-blue-500 mb-2" />
                <CardTitle>Goal Setting</CardTitle>
                <CardDescription>
                  Define financial goals and track your progress with visual indicators.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <BarChart3 className="w-10 h-10 text-blue-500 mb-2" />
                <CardTitle>Visual Analytics</CardTitle>
                <CardDescription>
                  Get detailed reports and charts to understand your spending patterns.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <Shield className="w-10 h-10 text-blue-500 mb-2" />
                <CardTitle>Secure & Private</CardTitle>
                <CardDescription>
                  Your financial data is encrypted and securely stored with industry-standard protection.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <DollarSign className="w-10 h-10 text-blue-500 mb-2" />
                <CardTitle>Multi-Currency</CardTitle>
                <CardDescription>
                  Support for multiple currencies with automatic conversion for global users.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-foreground mb-6">
            Ready to Start Your Financial Journey?
          </h3>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users who have already taken control of their finances with FinanceTracker.
          </p>
          <Button 
            onClick={handleLogin} 
            data-testid="button-start-tracking" 
            className="bg-blue-500 hover:bg-blue-600 px-8 py-3 text-lg"
          >
            Start Tracking Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2023 FinanceTracker. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
