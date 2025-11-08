import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getChatResponse(
  message: string,
  userContext?: {
    totalCarbon: number;
    monthCarbon: number;
    categoryBreakdown: Record<string, number>;
  }
): Promise<string> {
  const systemPrompt = `You are EcoGuardian AI, a helpful and knowledgeable environmental assistant specializing in carbon footprint reduction and sustainable living. 

Your role is to:
- Provide personalized advice on reducing carbon emissions
- Suggest eco-friendly alternatives and sustainable practices
- Answer questions about climate change and environmental impact
- Help users understand their carbon footprint data
- Offer practical, actionable tips for everyday sustainability

Be friendly, encouraging, and specific in your recommendations. Keep responses concise but informative.

${userContext ? `
Current user carbon data:
- Total carbon footprint: ${userContext.totalCarbon.toFixed(1)} kg CO₂
- This month: ${userContext.monthCarbon.toFixed(1)} kg CO₂
- Transportation: ${(userContext.categoryBreakdown.transportation || 0).toFixed(1)} kg
- Energy: ${(userContext.categoryBreakdown.energy || 0).toFixed(1)} kg
- Food: ${(userContext.categoryBreakdown.food || 0).toFixed(1)} kg
- Shopping: ${(userContext.categoryBreakdown.shopping || 0).toFixed(1)} kg
` : ''}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    
    if (error?.status === 429 || error?.code === 'insufficient_quota') {
      return getFallbackResponse(message, userContext);
    }
    
    throw new Error("Failed to get AI response");
  }
}

function getFallbackResponse(
  message: string,
  userContext?: {
    totalCarbon: number;
    monthCarbon: number;
    categoryBreakdown: Record<string, number>;
  }
): string {
  const messageLower = message.toLowerCase();
  
  if (messageLower.includes('commute') || messageLower.includes('transport')) {
    return `To reduce transportation emissions:\n\n1. Consider carpooling or using public transit when possible\n2. Bike or walk for short trips (under 2 miles)\n3. Combine multiple errands into one trip\n4. Maintain proper tire pressure to improve fuel efficiency\n5. Consider a hybrid or electric vehicle for your next car\n\n${userContext ? `Your current transportation footprint is ${(userContext.categoryBreakdown.transportation || 0).toFixed(1)} kg CO₂.` : ''}`;
  }
  
  if (messageLower.includes('energy') || messageLower.includes('electricity')) {
    return `To reduce energy consumption:\n\n1. Switch to LED bulbs (75% less energy)\n2. Unplug devices when not in use\n3. Use a programmable thermostat\n4. Seal air leaks around windows and doors\n5. Consider renewable energy options like solar panels\n\n${userContext ? `Your current energy footprint is ${(userContext.categoryBreakdown.energy || 0).toFixed(1)} kg CO₂.` : ''}`;
  }
  
  if (messageLower.includes('food') || messageLower.includes('eating') || messageLower.includes('diet')) {
    return `For sustainable eating habits:\n\n1. Reduce meat consumption, especially beef\n2. Buy local and seasonal produce\n3. Plan meals to minimize food waste\n4. Compost food scraps when possible\n5. Choose products with minimal packaging\n\n${userContext ? `Your current food-related footprint is ${(userContext.categoryBreakdown.food || 0).toFixed(1)} kg CO₂.` : ''}`;
  }
  
  if (messageLower.includes('product') || messageLower.includes('shopping') || messageLower.includes('buy')) {
    return `For eco-friendly shopping:\n\n1. Choose quality items that last longer\n2. Buy second-hand when possible\n3. Support companies with sustainable practices\n4. Avoid single-use plastics\n5. Repair items instead of replacing them\n\n${userContext ? `Your current shopping footprint is ${(userContext.categoryBreakdown.shopping || 0).toFixed(1)} kg CO₂.` : ''}`;
  }
  
  return `Here are some general tips to reduce your carbon footprint:\n\n1. Transportation: Use public transit, carpool, or bike when possible\n2. Energy: Switch to LED bulbs and unplug unused devices\n3. Food: Reduce meat consumption and buy local produce\n4. Shopping: Choose sustainable products and avoid single-use items\n5. Habits: Reduce, reuse, recycle in that order\n\n${userContext ? `Your total carbon footprint is ${userContext.totalCarbon.toFixed(1)} kg CO₂ (${userContext.monthCarbon.toFixed(1)} kg this month).` : ''}\n\nI'm here to help you reduce your environmental impact!`;
}

export async function getProductRecommendations(
  userContext: {
    totalCarbon: number;
    categoryBreakdown: Record<string, number>;
  }
): Promise<string[]> {
  const highestCategory = Object.entries(userContext.categoryBreakdown)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || "transportation";

  const systemPrompt = `You are an expert in sustainable products and eco-friendly alternatives. Based on the user's carbon footprint data, recommend specific products that would help reduce their impact.

User's highest carbon category: ${highestCategory}
Category breakdown:
- Transportation: ${(userContext.categoryBreakdown.transportation || 0).toFixed(1)} kg
- Energy: ${(userContext.categoryBreakdown.energy || 0).toFixed(1)} kg
- Food: ${(userContext.categoryBreakdown.food || 0).toFixed(1)} kg
- Shopping: ${(userContext.categoryBreakdown.shopping || 0).toFixed(1)} kg

Provide 5 specific product recommendations that would help reduce their carbon footprint. Format each as:
"Product Name - Brief description (estimated CO2 savings: X kg/year)"

Focus on practical, affordable products that target their highest impact categories.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Please recommend 5 sustainable products for me." }
      ],
      max_tokens: 600,
      temperature: 0.8,
    });

    const response = completion.choices[0]?.message?.content || "";
    const recommendations = response.split('\n').filter(line => line.trim().length > 0);
    return recommendations.slice(0, 5);
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    
    if (error?.status === 429 || error?.code === 'insufficient_quota') {
      return getFallbackRecommendations(highestCategory);
    }
    
    throw new Error("Failed to get product recommendations");
  }
}

function getFallbackRecommendations(highestCategory: string): string[] {
  const recommendations: Record<string, string[]> = {
    transportation: [
      "Reusable Water Bottle - Stay hydrated without single-use plastics during commutes (saves 15 kg CO₂/year)",
      "Bike Repair Kit - Maintain your bike for regular cycling instead of driving (saves 200 kg CO₂/year)",
      "Public Transit Pass - Monthly pass encourages sustainable commuting habits (saves 500 kg CO₂/year)",
      "Electric Scooter - Zero-emission alternative for short trips under 5 miles (saves 300 kg CO₂/year)",
      "Carpooling App Subscription - Share rides and reduce individual vehicle emissions (saves 400 kg CO₂/year)",
    ],
    energy: [
      "Smart Power Strip - Eliminate phantom energy drain from electronics (saves 50 kg CO₂/year)",
      "LED Light Bulbs - 75% more efficient than incandescent bulbs (saves 40 kg CO₂/year)",
      "Programmable Thermostat - Optimize heating/cooling schedules (saves 180 kg CO₂/year)",
      "Solar Charger - Charge devices with renewable energy (saves 25 kg CO₂/year)",
      "Insulation Weather Strips - Seal air leaks around doors and windows (saves 100 kg CO₂/year)",
    ],
    food: [
      "Reusable Produce Bags - Replace plastic bags at grocery stores (saves 10 kg CO₂/year)",
      "Compost Bin - Turn food scraps into nutrient-rich soil (saves 75 kg CO₂/year)",
      "Meal Planning Journal - Reduce food waste through better planning (saves 120 kg CO₂/year)",
      "Reusable Food Containers - Replace single-use packaging for leftovers (saves 30 kg CO₂/year)",
      "Plant-Based Cookbook - Delicious recipes to reduce meat consumption (saves 250 kg CO₂/year)",
    ],
    shopping: [
      "Reusable Shopping Bags - Durable bags that last for years (saves 20 kg CO₂/year)",
      "Bamboo Toothbrush - Biodegradable alternative to plastic (saves 5 kg CO₂/year)",
      "Refillable Cleaning Supplies - Reduce packaging waste with concentrate refills (saves 15 kg CO₂/year)",
      "Second-Hand Shopping Guide - Find quality pre-owned items (saves 200 kg CO₂/year)",
      "Repair Kit - Fix items instead of replacing them (saves 100 kg CO₂/year)",
    ],
  };
  
  return recommendations[highestCategory] || recommendations.transportation;
}
