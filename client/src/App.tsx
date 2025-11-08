import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import ThemeToggle from "@/components/ThemeToggle";
import Footer from "@/components/Footer";
import Landing from "@/pages/Landing";
import LearnMore from "@/pages/LearnMore";
import Dashboard from "@/pages/Dashboard";
import Calculator from "@/pages/Calculator";
import Goals from "@/pages/Goals";
import Recommendations from "@/pages/Recommendations";
import Analytics from "@/pages/Analytics";
import Predictions from "@/pages/Predictions";
import EcoRoute from "@/pages/EcoRoute";
import Settings from "@/pages/Settings";
import AuthForm from "@/components/AuthForm";
import MapModule from "@/components/MapModule";
import ChatInterface from "@/components/ChatInterface";
import ProductCard from "@/components/ProductCard";
import bottleImage from "@assets/generated_images/Reusable_water_bottle_product_3de846b6.png";
import toothbrushImage from "@assets/generated_images/Bamboo_toothbrush_product_716afcae.png";
import bagImage from "@assets/generated_images/Reusable_shopping_bag_product_5094c408.png";
import chargerImage from "@assets/generated_images/Solar_charger_product_34767e19.png";

function AppContent() {
  const [location, setLocation] = useLocation();

  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const handleAuthSuccess = () => {
    refetch();
    const redirectTo = sessionStorage.getItem("redirectAfterAuth") || "/dashboard";
    sessionStorage.removeItem("redirectAfterAuth");
    setLocation(redirectTo);
  };

  const handleGetStarted = () => {
    sessionStorage.setItem("redirectAfterAuth", "/calculator");
    setLocation("/auth");
  };

  const handleFeatureClick = () => {
    sessionStorage.setItem("redirectAfterAuth", "/dashboard");
    setLocation("/auth");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user && location !== "/" && location !== "/auth" && location !== "/learn-more") {
    return (
      <Switch>
        <Route path="/auth">
          <AuthForm onAuthSuccess={handleAuthSuccess} />
        </Route>
        <Route path="/learn-more">
          <div className="min-h-screen flex flex-col">
            <div className="flex-1">
              <LearnMore />
            </div>
            <Footer />
          </div>
        </Route>
        <Route path="/">
          <Landing onGetStarted={handleGetStarted} onFeatureClick={handleFeatureClick} />
        </Route>
      </Switch>
    );
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/auth">
          <AuthForm onAuthSuccess={handleAuthSuccess} />
        </Route>
        <Route path="/learn-more">
          <div className="min-h-screen flex flex-col">
            <div className="flex-1">
              <LearnMore />
            </div>
            <Footer />
          </div>
        </Route>
        <Route path="/">
          <Landing onGetStarted={handleGetStarted} onFeatureClick={handleFeatureClick} />
        </Route>
        <Route>
          <Landing onGetStarted={handleGetStarted} onFeatureClick={handleFeatureClick} />
        </Route>
      </Switch>
    );
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto">
            <div className="min-h-full flex flex-col">
              <div className="flex-1 p-6">
                <Switch>
                  <Route path="/dashboard">
                    <Dashboard />
                  </Route>
                  <Route path="/analytics">
                    <Analytics />
                  </Route>
                  <Route path="/predictions">
                    <Predictions />
                  </Route>
                  <Route path="/eco-route">
                    <EcoRoute />
                  </Route>
                  <Route path="/calculator">
                    <Calculator />
                  </Route>
                  <Route path="/goals">
                    <Goals />
                  </Route>
                  <Route path="/recommendations">
                    <Recommendations />
                  </Route>
                  <Route path="/map">
                    <div className="space-y-6">
                      <h1 className="text-3xl font-bold">Eco-Friendly Locations</h1>
                      <MapModule />
                    </div>
                  </Route>
                  <Route path="/chat">
                    <div className="space-y-6">
                      <h1 className="text-3xl font-bold">AI Carbon-Chat Agent</h1>
                      <p className="text-muted-foreground">Get instant answers about carbon savings, sustainable products, and optimization strategies</p>
                      <ChatInterface />
                    </div>
                  </Route>
                  <Route path="/products">
                    <div className="space-y-6">
                      <h1 className="text-3xl font-bold">Sustainable Products</h1>
                      <p className="text-muted-foreground">Discover eco-friendly alternatives for your lifestyle</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <ProductCard
                          image={bottleImage}
                          name="Eco Steel Bottle"
                          price="₹1,999"
                          carbonSaving="12 kg"
                          ecoScore={9}
                          category="Reusables"
                        />
                        <ProductCard
                          image={toothbrushImage}
                          name="Bamboo Brush Set"
                          price="₹999"
                          carbonSaving="3 kg"
                          ecoScore={8}
                          category="Personal Care"
                        />
                        <ProductCard
                          image={bagImage}
                          name="Organic Cotton Bag"
                          price="₹1,299"
                          carbonSaving="8 kg"
                          ecoScore={9}
                          category="Shopping"
                        />
                        <ProductCard
                          image={chargerImage}
                          name="Solar Power Bank"
                          price="₹3,199"
                          carbonSaving="15 kg"
                          ecoScore={10}
                          category="Electronics"
                        />
                      </div>
                    </div>
                  </Route>
                  <Route path="/learn-more">
                    <LearnMore />
                  </Route>
                  <Route path="/settings">
                    <Settings />
                  </Route>
                  <Route path="/">
                    <Dashboard />
                  </Route>
                </Switch>
              </div>
              <Footer />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
