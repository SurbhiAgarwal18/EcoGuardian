import HeroSection from "@/components/HeroSection";
import FeatureSection from "@/components/FeatureSection";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";
import { useLocation } from "wouter";
import bottleImage from "@assets/generated_images/Reusable_water_bottle_product_3de846b6.png";
import toothbrushImage from "@assets/generated_images/Bamboo_toothbrush_product_716afcae.png";
import bagImage from "@assets/generated_images/Reusable_shopping_bag_product_5094c408.png";
import chargerImage from "@assets/generated_images/Solar_charger_product_34767e19.png";

interface LandingProps {
  onGetStarted?: () => void;
  onFeatureClick?: () => void;
}

export default function Landing({ onGetStarted, onFeatureClick }: LandingProps) {
  const [, setLocation] = useLocation();
  
  return (
    <div className="min-h-screen">
      <HeroSection onGetStarted={onGetStarted} />
      
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Three simple steps to start your sustainability journey
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Track", desc: "Monitor your daily carbon footprint across all activities" },
              { step: "2", title: "Analyze", desc: "Get AI-powered insights and personalized recommendations" },
              { step: "3", title: "Reduce", desc: "Take action and watch your environmental impact decrease" },
            ].map((item) => (
              <Card 
                key={item.step} 
                className="hover-elevate active-elevate-2 cursor-pointer"
                onClick={onGetStarted}
                data-testid={`card-${item.title.toLowerCase()}`}
              >
                <CardContent className="p-6 space-y-3">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <span className="text-3xl font-bold text-primary">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <FeatureSection onFeatureClick={onFeatureClick} />

      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Sustainable Products
            </h2>
            <p className="text-lg text-muted-foreground">
              Curated eco-friendly alternatives for your everyday needs
            </p>
          </div>
          
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
      </section>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Our Users Say
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Sarah Chen", role: "Environmental Advocate", quote: "EcoGuardian helped me reduce my carbon footprint by 40% in just 3 months. The AI recommendations are spot-on!" },
              { name: "Michael Torres", role: "Tech Professional", quote: "The map feature is incredible. I've discovered so many eco-friendly businesses I never knew existed in my area." },
              { name: "Emma Watson", role: "Sustainability Consultant", quote: "Finally, a carbon tracking app that's both powerful and easy to use. The chatbot answers all my questions instantly." },
            ].map((testimonial, idx) => (
              <Card key={idx} className="hover-elevate">
                <CardContent className="p-6 space-y-4">
                  <Quote className="h-8 w-8 text-primary/30" />
                  <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl opacity-90">
            Join 150,000+ users taking action against climate change
          </p>
          <div className="flex flex-wrap gap-4 justify-center mt-6">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={onGetStarted}
              data-testid="button-cta-bottom"
            >
              Start Tracking Free
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="bg-white/10 hover:bg-white/20 border-white/20"
              onClick={() => setLocation("/learn-more")}
              data-testid="button-learn-more-cta"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
