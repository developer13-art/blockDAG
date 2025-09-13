# Overview

This is DAGForge, a blockchain-based gamified prediction market and task completion platform built for the BlockDAG ecosystem. The application combines prediction markets, task-based earning, user progression systems, and Web3 wallet integration to create an engaging DeFi experience. Users can make predictions on various markets, complete tasks to earn BDAG tokens and XP, compete on leaderboards, and unlock achievements as they progress through different levels.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client uses a modern React stack with TypeScript, built with Vite for fast development and bundling. The UI is constructed using shadcn/ui components with Radix UI primitives, styled with Tailwind CSS in a dark theme. The application uses wouter for lightweight client-side routing and TanStack Query for server state management. Key architectural decisions include:

- **Component-based architecture**: Modular UI components for features like prediction markets, task directory, leaderboards, achievements, and rewards
- **Custom hooks**: Centralized logic for Web3 interactions, WebSocket connections, and mobile responsiveness
- **Type-safe development**: Full TypeScript integration with shared schemas between client and server

## Backend Architecture
The server is an Express.js application with TypeScript, following a RESTful API design pattern. It implements:

- **Route-based organization**: Centralized route registration with middleware for authentication and logging
- **JWT authentication**: Secure user sessions with bcrypt password hashing
- **WebSocket integration**: Real-time communication for live updates on predictions, tasks, and leaderboards
- **Storage abstraction**: Interface-based storage layer supporting multiple database implementations

## Data Storage Solutions
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The schema includes:

- **User management**: Comprehensive user profiles with XP, levels, streaks, and wallet integration
- **Prediction markets**: Full prediction lifecycle with market creation, user predictions, and result resolution
- **Gamification systems**: Tasks, achievements, rewards, and user progress tracking
- **Relationship modeling**: Proper foreign key relationships between users, markets, predictions, and tasks

## Authentication and Authorization
Security is implemented through a multi-layered approach:

- **JWT-based authentication**: Stateless session management with secure token generation
- **Password security**: bcrypt hashing with proper salt rounds
- **Role-based access**: User roles (basic, premium, validator) with different permission levels
- **Wallet verification**: Integration with MetaMask for blockchain identity verification

## External Dependencies

### Blockchain Integration
- **Neon Database**: Serverless PostgreSQL for scalable data storage
- **Web3 Infrastructure**: Ethers.js for blockchain interactions with MetaMask wallet support
- **Stripe Integration**: Payment processing for premium features and fiat on-ramps

### UI and Styling
- **Radix UI**: Accessible component primitives for complex interactions
- **Tailwind CSS**: Utility-first styling with custom design system
- **Lucide Icons**: Consistent iconography throughout the application

### Development Tools
- **Drizzle Kit**: Database migrations and schema management
- **Vite**: Fast development server with HMR and optimized production builds
- **TypeScript**: Type safety across the entire application stack

### Real-time Features
- **WebSocket Server**: Native WebSocket implementation for live updates
- **TanStack Query**: Efficient data fetching with caching and synchronization

The architecture supports horizontal scaling through the storage abstraction layer, enabling easy migration to distributed databases or caching layers as the application grows. The modular design allows for feature expansion without significant refactoring, particularly important for a gamified platform where new mechanics and features are regularly added.