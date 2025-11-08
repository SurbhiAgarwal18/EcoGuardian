# EcoGuardian - AI Carbon-Saver CoPilot

## Overview

EcoGuardian is a full-stack web application designed to help users track, analyze, and reduce their carbon footprint through AI-powered insights. The platform combines carbon tracking with personalized recommendations, sustainable product discovery, and interactive data visualization to promote environmental sustainability.

**Core Purpose**: Enable users to monitor their environmental impact across categories (transportation, energy, food, shopping) and receive AI-driven guidance for reducing their carbon emissions.

**Tech Stack**:
- Frontend: React with TypeScript, Vite build system
- UI Framework: shadcn/ui components (Radix UI primitives) with Tailwind CSS
- Backend: Express.js with TypeScript
- Database: PostgreSQL with Drizzle ORM
- AI Integration: OpenAI API for chatbot and recommendations
- State Management: TanStack Query (React Query)
- Authentication: Express sessions with password hashing (scrypt)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Component-Based Design**: The application follows a modular React component structure with clear separation of concerns:

- **Page Components** (`client/src/pages/`): Top-level route components (Dashboard, Calculator, Goals, Landing, Recommendations)
- **Reusable Components** (`client/src/components/`): Self-contained UI modules (AuthForm, CarbonChart, ChatInterface, MapModule, ProductCard, etc.)
- **UI Primitives** (`client/src/components/ui/`): shadcn/ui library components for consistent design system

**Styling Approach**: 
- Tailwind CSS for utility-first styling with custom design tokens
- CSS variables for theming (light/dark mode support)
- Design system defined in `design_guidelines.md` emphasizing sustainability aesthetics
- Custom spacing scale (2, 4, 6, 8, 12, 16) and "New York" style configuration

**State Management Strategy**:
- TanStack Query for server state synchronization and caching
- Local component state with React hooks for UI interactions
- Session-based authentication state managed through API queries

**Routing**: wouter library for lightweight client-side routing with protected routes pattern

### Backend Architecture

**API Design**: RESTful endpoints following resource-oriented patterns:

- `/api/auth/*` - Authentication (signup, login, session management)
- `/api/carbon-entries` - CRUD operations for carbon footprint data
- `/api/carbon-entries/stats` - Aggregated analytics
- `/api/goals` - User carbon reduction goals
- `/api/chat` - AI chatbot interactions
- `/api/recommendations` - AI-generated product recommendations

**Middleware Stack**:
1. Express JSON body parser with raw body preservation
2. Session middleware (express-session) with secure cookie configuration
3. Request logging middleware tracking API calls and response times
4. Vite development server integration for HMR in development

**Authentication Pattern**:
- Password hashing using Node.js crypto.scrypt with salts
- Session-based authentication (no JWTs)
- Secure session cookies with httpOnly flag
- Timing-safe password comparison to prevent timing attacks

**Data Layer Abstraction**: `IStorage` interface pattern enabling multiple storage implementations (in-memory for development, database for production via Drizzle ORM)

### Database Architecture

**ORM Choice**: Drizzle ORM selected for type-safe database operations and migration management

**Schema Design** (`shared/schema.ts`):

1. **users table**: Stores authentication credentials
   - UUID primary keys
   - Username (unique constraint)
   - Hashed passwords

2. **carbon_entries table**: Core activity tracking
   - Foreign key to users
   - Category enum (transportation, energy, food, shopping)
   - Amount (real/float for CO₂ measurements)
   - Optional description
   - Timestamp for temporal analysis

3. **goals table**: User-defined carbon reduction targets
   - Target amount and period (daily/weekly/monthly)
   - Foreign key relationship to users

**Database Configuration**:
- PostgreSQL dialect via Neon serverless driver
- Connection pooling through `@neondatabase/serverless`
- Schema validation using Zod for runtime type checking
- Migration system via `drizzle-kit`

### AI Integration Architecture

**OpenAI Service Layer** (`server/ai.ts`):

**Chatbot Implementation**:
- Model: GPT-4o-mini for cost-effective responses
- Context-aware system prompts incorporating user carbon data
- Streaming disabled (direct completion responses)
- Max 500 tokens per response
- Temperature 0.7 for balanced creativity/consistency

**Recommendation Engine**:
- Uses user's carbon footprint breakdown to generate personalized product suggestions
- Contextual prompts tailored to user's highest impact categories
- Error handling with graceful degradation

**Design Rationale**: Separation of AI logic into dedicated module enables easier testing, API key management, and potential future migration to alternative AI providers.

### Development Environment

**Build System**:
- Vite for fast HMR and optimized production builds
- esbuild for server-side bundling (ESM format)
- TypeScript compilation checking without emit
- Path aliases (@/, @shared/, @assets/) for clean imports

**Development Tools**:
- Replit-specific plugins (cartographer, dev banner, runtime error overlay)
- Custom Vite server middleware for SSR template injection
- Separate client/server TypeScript configurations

**Asset Management**: Static assets stored in `attached_assets/generated_images/` with typed imports through Vite's asset handling

## External Dependencies

### Third-Party Services

**OpenAI API**:
- Purpose: AI chatbot responses and product recommendations
- Authentication: API key via environment variable
- Models: gpt-4o-mini
- Rate limiting considerations needed for production

**Neon Database** (PostgreSQL):
- Purpose: Primary data storage
- Connection: Serverless PostgreSQL via `@neondatabase/serverless`
- Configuration: Connection string via `DATABASE_URL` environment variable

### UI Component Libraries

**Radix UI Primitives**: Unstyled, accessible component primitives for:
- Dialog, Dropdown, Popover, Select components
- Navigation components (Menubar, Tabs, Accordion)
- Form elements (Checkbox, Radio, Slider, Switch)
- Data display (Avatar, Progress, Toast, Tooltip)

**shadcn/ui**: Pre-styled component library built on Radix UI with Tailwind CSS integration

**Recharts**: Data visualization library for carbon footprint charts with responsive container support

### Key NPM Packages

**Frontend**:
- `@tanstack/react-query` - Server state management
- `wouter` - Lightweight routing
- `react-hook-form` + `@hookform/resolvers` - Form handling with Zod validation
- `date-fns` - Date manipulation
- `embla-carousel-react` - Carousel functionality
- `cmdk` - Command palette/search

**Backend**:
- `express-session` - Session management
- `connect-pg-simple` - PostgreSQL session store
- `drizzle-orm` + `drizzle-zod` - ORM with schema validation
- `tsx` - TypeScript execution for development

**Development**:
- `@replit/*` - Replit platform integrations
- `vite` + `@vitejs/plugin-react` - Build tooling
- `tailwindcss` + `autoprefixer` - CSS processing

### Environment Variables Required

- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API authentication
- `SESSION_SECRET`: Express session encryption key (defaults to development key)
- `NODE_ENV`: Environment mode (development/production)

### Font Dependencies

- Google Fonts: Inter and DM Sans (loaded via CDN in `index.html`)
- Used for modern, readable typography throughout the application