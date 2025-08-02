# Casino Game Platform

## Overview
This project is a full-stack casino gaming platform offering classic games like Slots, Dice, and Crash. It features user authentication, real-money game mechanics, and a responsive interface. The platform aims to provide an engaging and secure online gaming experience.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Routing**: Wouter
- **State Management**: TanStack Query (React Query) for server state
- **UI Framework**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS
- **Component Structure**: Modular and reusable UI components.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with bcrypt password hashing
- **API Structure**: RESTful API
- **Validation**: Zod for runtime type validation.

### UI/UX Design
- Dark casino theme with neon accent colors.
- Responsive design for mobile and desktop.
- Real-time game feedback and intuitive controls.
- Animated forest background and nature-inspired visual elements.
- Custom game logos and consistent branding ("scrapz").

### Technical Implementations
- **Authentication**: Secure session-based authentication with auto-login, protected routes, and proper credential handling. Includes a comprehensive password management system and banned user detection.
- **Game Logic**: Server-side for security, with client-side UI state. Includes progressive multipliers, house edge rebalancing, and game-specific mechanics for Slots, Dice, and Crash.
- **Game Features**:
    - **Slots**: Three-reel with staggered reel stopping and enhanced visual feedback.
    - **Dice**: Two-dice prediction game (removed from current version).
    - **Crash**: Multiplier-based game with real-time mechanics, cash-out, visual enhancements, and owner-only features for monitoring. Includes a dual-mode system for multiplayer/singleplayer.
- **Betting Controls**: Universal 1/2, 2x, and Max betting buttons across all games.
- **Balance Management**: Automatic balance updates on transactions, real-time reflection, and comprehensive withdrawal management.
- **Admin Panel**: Features real-time balance updates, user password management, and advanced crash game rigging controls (percentage/rounds-based). Multi-level admin system with Owner ("doe") and Administrator ("finalpack") roles.
- **User Statistics**: Comprehensive tracking of wagered, deposited, withdrawn amounts, game history, and transaction logging.
- **Chat System**: Real-time, WebSocket-based chat with message storage.
- **Role-Based Access Control**: Multi-tier admin system with distinct visual styling - Owner ("doe") with red neon + rainbow "OWNER" badge, Administrator ("finalpack") with purple text + "ADMINISTRATOR" badge.

### System Design Choices
- **Database**: PostgreSQL with Drizzle ORM for type safety, robust relational modeling, and serverless compatibility.
- **Authentication**: Session-based for enhanced security and easier session management compared to JWT.
- **Monorepo Structure**: Single repository with shared types between client and server for full-stack type safety and simplified workflow.

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL hosting.
- **Drizzle ORM**: Type-safe database operations and migrations.
- **Connect-pg-simple**: PostgreSQL session storage.

### UI Libraries
- **Radix UI**: Accessible UI primitives.
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide React**: Icon library.

### Development Tools
- **TypeScript**: Static type checking.
- **Vite**: Fast development and optimized builds.
- **ESBuild**: Fast bundling for backend production builds.
- **PostCSS**: CSS processing.