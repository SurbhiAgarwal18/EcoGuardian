import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "wouter";
import { 
  Brain, 
  TrendingDown, 
  Target, 
  Sparkles, 
  BarChart3, 
  MapPin,
  MessageSquare,
  Leaf,
  Zap,
  Route,
  Home,
  ShoppingBag,
  ArrowRight
} from "lucide-react";

export default function LearnMore() {
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: BarChart3,
      title: "Smart Dashboard",
      description: "Real-time carbon tracking with AI-powered predictions for energy, water, and carbon consumption. View your sustainability score and track progress toward goals."
    },
    {
      icon: Brain,
      title: "AI Carbon-Chat Agent",
      description: "Get instant answers about carbon savings, budget-friendly sustainable products, and home power optimization strategies tailored to your footprint."
    },
    {
      icon: TrendingDown,
      title: "Resource Wastage Forecaster",
      description: "Predict future energy, water, and carbon consumption with AI. Receive actionable insights to reduce waste before it happens."
    },
    {
      icon: Route,
      title: "Eco-Route Navigator",
      description: "Plan optimized routes that show fuel savings and CO₂ reductions. Choose the most sustainable way to travel."
    },
    {
      icon: Home,
      title: "AI Room Redesign",
      description: "Visualize sustainable interior design with AI-generated images and get personalized eco-friendly product recommendations."
    },
    {
      icon: ShoppingBag,
      title: "Product Recommendations",
      description: "Discover curated sustainable products with carbon savings calculations and eco-scores to make informed purchasing decisions."
    },
    {
      icon: MapPin,
      title: "Eco-Location Map",
      description: "Find nearby charging stations, recycling centers, green businesses, and farmers markets on an interactive map."
    },
    {
      icon: Target,
      title: "Goal Setting & Tracking",
      description: "Set personalized carbon reduction goals and track your progress with detailed analytics and category breakdowns."
    }
  ];

  const impacts = [
    { value: "150K+", label: "Active Users" },
    { value: "2.5M kg", label: "CO₂ Saved" },
    { value: "45%", label: "Avg. Reduction" },
    { value: "100+", label: "Countries" }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Track Your Footprint",
      description: "Monitor daily carbon emissions across transportation, energy, food, and shopping categories with our easy-to-use calculator."
    },
    {
      step: "2",
      title: "Get AI Insights",
      description: "Receive personalized recommendations from our AI agent. Learn which actions will have the biggest impact on your carbon footprint."
    },
    {
      step: "3",
      title: "Take Action",
      description: "Implement sustainable changes, track your progress, and watch your environmental impact decrease over time."
    },
    {
      step: "4",
      title: "See Your Impact",
      description: "Visualize your carbon savings with beautiful charts, earn achievements, and compare your progress with community goals."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Link href="/" data-testid="link-logo-learn-more">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary cursor-pointer hover-elevate active-elevate-2">
              <Leaf className="h-8 w-8 text-primary-foreground" />
            </div>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold" data-testid="text-learn-more-title">
            EcoGuardian: AI Carbon-Saver CoPilot
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your intelligent companion for tracking, analyzing, and reducing your carbon footprint 
            with cutting-edge AI technology and personalized guidance.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              onClick={() => setLocation("/auth")}
              data-testid="button-get-started"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setLocation("/dashboard")}
              data-testid="button-view-demo"
            >
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Our Global Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {impacts.map((impact) => (
              <Card key={impact.label} className="hover-elevate">
                <CardContent className="p-6 text-center space-y-2">
                  <div className="text-4xl font-bold text-primary" data-testid={`stat-${impact.label.toLowerCase().replace(/\s+/g, '-')}`}>
                    {impact.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{impact.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Four simple steps to start your sustainability journey and make a real environmental impact
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item) => (
              <Card key={item.step} className="hover-elevate">
                <CardContent className="p-6 space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Powerful AI Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to understand and reduce your environmental impact
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="hover-elevate">
                <CardContent className="p-6 space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Built with Modern Technology</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powered by cutting-edge AI and robust infrastructure for accurate tracking and insights
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 space-y-3">
                <Sparkles className="h-8 w-8 text-primary" />
                <h3 className="text-xl font-semibold">OpenAI GPT-4</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced AI models power our chatbot, predictions, and personalized recommendations 
                  with context-aware responses tailored to your footprint.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 space-y-3">
                <Zap className="h-8 w-8 text-primary" />
                <h3 className="text-xl font-semibold">Real-Time Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  PostgreSQL database with Drizzle ORM ensures your data is secure, persistent, 
                  and accessible across devices with instant updates.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 space-y-3">
                <MessageSquare className="h-8 w-8 text-primary" />
                <h3 className="text-xl font-semibold">SSE Streaming</h3>
                <p className="text-sm text-muted-foreground">
                  Server-Sent Events enable real-time AI chat responses with graceful fallbacks, 
                  ensuring functionality even during high API usage.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose EcoGuardian */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose EcoGuardian?</h2>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">Accurate Carbon Calculations</h3>
                <p className="text-muted-foreground">
                  Our algorithms use real-world emission factors and up-to-date research to provide 
                  precise carbon footprint measurements across all activity categories.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">Personalized AI Guidance</h3>
                <p className="text-muted-foreground">
                  Unlike generic eco-apps, our AI learns from your specific usage patterns and provides 
                  customized recommendations that fit your lifestyle and budget.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">Data Privacy First</h3>
                <p className="text-muted-foreground">
                  Your environmental data is encrypted and stored securely. We never sell your information, 
                  and you maintain full control over your account and data.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">Always Free Core Features</h3>
                <p className="text-muted-foreground">
                  Track unlimited activities, access AI insights, and use all essential features completely 
                  free. Sustainability shouldn't have a price tag.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold">
            Ready to Reduce Your Carbon Footprint?
          </h2>
          <p className="text-xl opacity-90">
            Join thousands of users taking meaningful action against climate change. 
            Start tracking your impact today.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="mt-6"
            onClick={() => setLocation("/auth")}
            data-testid="button-cta-signup"
          >
            Start Your Journey Free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <p className="text-sm opacity-75 pt-4">
            No credit card required • Full access to all features • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
}
