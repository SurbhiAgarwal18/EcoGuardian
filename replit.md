# EcoGuardian - AI Carbon-Saver CoPilot

## Overview

EcoGuardian is a full-stack web application designed to help users track, analyze, and reduce their carbon footprint through AI-powered insights. It combines carbon tracking with personalized recommendations, sustainable product discovery, and interactive data visualization. The platform is production-ready, featuring a robust authentication system, AI-driven predictions, eco-routing, AI room redesign, and a streaming AI chatbot.

**Core Purpose**: Enable users to monitor their environmental impact across categories (transportation, energy, food, shopping) and receive AI-driven guidance for reducing carbon emissions.

**Key Capabilities**:
- Carbon tracking and analytics with real-time statistics and data visualization.
- Smart Dashboard with AI predictions, carbon savings, sustainability score, and eco-route access.
- AI Resource Wastage Forecaster for energy, water, and carbon consumption predictions.
- Eco-Route Navigator for optimized routes showing fuel/CO₂ savings.
- AI Room Redesign with generative image visualizations and sustainable product recommendations.
- AI chatbot with Server-Sent Events (SSE) streaming responses.
- AI-powered product recommendations and goal setting.
- Responsive design with light/dark theme support.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend uses React with TypeScript, built with Vite, following a modular component-based design. Styling is handled with Tailwind CSS and shadcn/ui components, featuring a custom design system for sustainability aesthetics and dark/light mode support. State management relies on TanStack Query for server state and React hooks for local UI interactions. Routing is managed by the `wouter` library.

### Backend Architecture

The backend is built with Express.js and TypeScript, providing RESTful APIs for authentication, carbon tracking, AI services, and goal management. Authentication uses session-based methods with secure password hashing (scrypt). The data layer abstracts storage via an `IStorage` interface, implemented by `DbStorage` using Drizzle ORM.

### Database Architecture

PostgreSQL is the primary database, utilizing Drizzle ORM for type-safe operations. The schema includes `users` for authentication, `carbon_entries` for activity tracking, and `goals` for user-defined targets. It uses the Neon serverless driver and a `drizzle-kit` migration system.

### AI Integration Architecture

AI integration is centralized in a dedicated service layer (`server/ai.ts`) using OpenAI's GPT-4o-mini model. This includes:
- **Chatbot**: Context-aware, streaming responses via SSE with graceful fallbacks.
- **Recommendation Engine**: Personalized product suggestions based on carbon footprint, with fallback content.
- **Resource Wastage Forecaster**: Predicts energy, water, and carbon consumption, offering actionable insights and fallback predictions via statistical analysis.
- **Room Redesign Visualizer**: Generates sustainable interior design recommendations and leverages pre-generated photorealistic images for visualization, with comprehensive fallback recommendations.
This architecture prioritizes functionality even when the OpenAI API is unavailable through intelligent fallbacks.

## External Dependencies

### Third-Party Services

- **OpenAI API**: For AI chatbot responses, product recommendations, forecasting, and room redesign.
- **Neon Database**: Provides serverless PostgreSQL for primary data storage.

### UI Component Libraries

- **Radix UI Primitives**: Accessible, unstyled components for core UI elements.
- **shadcn/ui**: Styled component library built on Radix UI with Tailwind CSS.
- **Recharts**: For data visualization of carbon footprint charts and trends.

### Key NPM Packages

**Frontend**: `@tanstack/react-query`, `wouter`, `react-hook-form`, `date-fns`, `embla-carousel-react`, `cmdk`.
**Backend**: `express-session`, `connect-pg-simple`, `drizzle-orm`, `drizzle-zod`, `tsx`.
**Development**: `@replit/*`, `vite`, `@vitejs/plugin-react`, `tailwindcss`, `autoprefixer`.

### Environment Variables Required

- `DATABASE_URL`
- `OPENAI_API_KEY`
- `SESSION_SECRET`
- `NODE_ENV`

### Font Dependencies

- Google Fonts: Inter and DM Sans (via CDN).