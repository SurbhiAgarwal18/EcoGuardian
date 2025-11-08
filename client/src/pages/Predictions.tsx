import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { Brain, TrendingUp, TrendingDown, Droplets, Zap, Leaf, AlertTriangle, RefreshCw, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PredictionsData {
  energyPrediction: { value: number; trend: string; confidence: number };
  waterPrediction: { value: number; trend: string; confidence: number };
  carbonPrediction: { value: number; trend: string; confidence: number };
  insights: string[];
  recommendations: string[];
}

export default function Predictions() {
  const { data, isLoading, refetch, isRefetching } = useQuery<PredictionsData>({
    queryKey: ["/api/predictions"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Generating AI predictions...</p>
        </div>
      </div>
    );
  }

  if (!data || (data.insights.length === 1 && data.insights[0].includes("Start tracking"))) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">AI Resource Forecaster</h1>
        <Card>
          <CardContent className="p-12 text-center">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Data to Analyze</h3>
            <p className="text-muted-foreground mb-4">
              Start tracking your carbon footprint to receive AI-powered predictions about your resource consumption!
            </p>
            <Button onClick={() => window.location.href = '/calculator'}>
              Start Tracking
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getTrendIcon = (trend: string) => {
    if (trend === "increasing") return <TrendingUp className="h-4 w-4 text-orange-500" />;
    if (trend === "decreasing") return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <span className="h-4 w-4 text-muted-foreground">→</span>;
  };

  const getTrendColor = (trend: string) => {
    if (trend === "increasing") return "text-orange-500";
    if (trend === "decreasing") return "text-green-500";
    return "text-muted-foreground";
  };

  const radarData = [
    { category: "Energy Risk", value: data.energyPrediction.value, fullMark: 100 },
    { category: "Water Risk", value: data.waterPrediction.value, fullMark: 100 },
    { category: "Carbon Impact", value: (data.carbonPrediction.value / 100) * 100, fullMark: 100 },
  ];

  const forecastData = [
    { day: "Today", energy: 50, water: 40, carbon: data.carbonPrediction.value / 7 },
    { day: "Day 2", energy: 55, water: 42, carbon: (data.carbonPrediction.value / 7) * 1.02 },
    { day: "Day 3", energy: data.energyPrediction.value * 0.7, water: data.waterPrediction.value * 0.6, carbon: (data.carbonPrediction.value / 7) * 1.04 },
    { day: "Day 4", energy: data.energyPrediction.value * 0.8, water: data.waterPrediction.value * 0.7, carbon: (data.carbonPrediction.value / 7) * 1.05 },
    { day: "Day 5", energy: data.energyPrediction.value * 0.9, water: data.waterPrediction.value * 0.85, carbon: (data.carbonPrediction.value / 7) * 1.06 },
    { day: "Day 6", energy: data.energyPrediction.value * 0.95, water: data.waterPrediction.value * 0.9, carbon: (data.carbonPrediction.value / 7) * 1.07 },
    { day: "Day 7", energy: data.energyPrediction.value, water: data.waterPrediction.value, carbon: data.carbonPrediction.value / 7 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Resource Forecaster</h1>
          <p className="text-muted-foreground">Predict and prevent resource wastage with AI insights</p>
        </div>
        <Button
          onClick={() => refetch()}
          disabled={isRefetching}
          variant="outline"
          data-testid="button-refresh-predictions"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Energy Consumption Risk</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{data.energyPrediction.value}%</div>
              {getTrendIcon(data.energyPrediction.trend)}
            </div>
            <p className={`text-xs mt-1 ${getTrendColor(data.energyPrediction.trend)}`}>
              {data.energyPrediction.trend.charAt(0).toUpperCase() + data.energyPrediction.trend.slice(1)} trend
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {data.energyPrediction.confidence}% confidence
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Water Wastage Probability</CardTitle>
            <Droplets className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{data.waterPrediction.value}%</div>
              {getTrendIcon(data.waterPrediction.trend)}
            </div>
            <p className={`text-xs mt-1 ${getTrendColor(data.waterPrediction.trend)}`}>
              {data.waterPrediction.trend.charAt(0).toUpperCase() + data.waterPrediction.trend.slice(1)} trend
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {data.waterPrediction.confidence}% confidence
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carbon Footprint Forecast</CardTitle>
            <Leaf className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{data.carbonPrediction.value.toFixed(1)} kg</div>
              {getTrendIcon(data.carbonPrediction.trend)}
            </div>
            <p className={`text-xs mt-1 ${getTrendColor(data.carbonPrediction.trend)}`}>
              Next week forecast
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {data.carbonPrediction.confidence}% confidence
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>7-Day Resource Forecast</CardTitle>
            <CardDescription>Predicted consumption trends for the coming week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="energy" stroke="#eab308" strokeWidth={2} name="Energy Risk" />
                <Line type="monotone" dataKey="water" stroke="#3b82f6" strokeWidth={2} name="Water Risk" />
                <Line type="monotone" dataKey="carbon" stroke="#22c55e" strokeWidth={2} name="Carbon (kg)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Assessment Radar</CardTitle>
            <CardDescription>Overall resource consumption risk profile</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Risk Level" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Insights & Patterns
          </CardTitle>
          <CardDescription>Machine learning analysis of your consumption patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm flex-1">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Actionable Recommendations
          </CardTitle>
          <CardDescription>Steps to reduce resource wastage and improve efficiency</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg hover-elevate cursor-pointer">
                <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 text-primary-foreground text-xs font-bold">
                  {index + 1}
                </div>
                <p className="text-sm flex-1">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
