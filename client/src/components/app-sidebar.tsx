import { Home, Calculator, Map, MessageSquare, ShoppingBag, Leaf, Target, Sparkles, BarChart3, Brain } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "AI Predictions", url: "/predictions", icon: Brain },
  { title: "Calculator", url: "/calculator", icon: Calculator },
  { title: "Goals", url: "/goals", icon: Target },
  { title: "Eco Map", url: "/map", icon: Map },
  { title: "AI Assistant", url: "/chat", icon: MessageSquare },
  { title: "Recommendations", url: "/recommendations", icon: Sparkles },
  { title: "Products", url: "/products", icon: ShoppingBag },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">EcoGuardian</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="text-sm font-medium">Carbon Score</div>
            <div className="text-2xl font-bold text-primary">8.5/10</div>
            <div className="text-xs text-muted-foreground">Great progress!</div>
          </CardContent>
        </Card>
      </SidebarFooter>
    </Sidebar>
  );
}
