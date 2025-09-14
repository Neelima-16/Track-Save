# Personal Finance Tracker

## Overview

This is a full-stack personal finance tracking application built with React, TypeScript, Express.js, and PostgreSQL. The application allows users to track expenses, manage budgets, set financial goals, and generate reports about their spending habits. It features a modern UI built with shadcn/ui components and TailwindCSS, integrated with Replit's authentication system for seamless user management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: TailwindCSS with CSS custom properties for theming
- **Forms**: React Hook Form with Zod validation
- **Theme**: Light/dark mode support with system preference detection

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ESM modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful API with proper HTTP status codes and error handling
- **Session Management**: Express sessions with PostgreSQL storage
- **Authentication**: Integrated Replit Auth with OpenID Connect

### Database Design
- **Database**: PostgreSQL with Neon serverless connection
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Core Tables**:
  - `users`: User profiles with authentication data
  - `sessions`: Session storage for Replit Auth (mandatory)
  - `transactions`: Income and expense tracking with categories
  - `budgets`: Monthly/period-based spending limits by category
  - `goals`: Financial goals with target amounts and dates
- **Data Types**: Proper enums for transaction types and categories, decimal precision for monetary values

### Authentication & Security
- **Provider**: Replit Auth with OpenID Connect protocol
- **Session Storage**: PostgreSQL-backed sessions with automatic cleanup
- **Authorization**: Route-level protection with user context injection
- **Security Headers**: HTTPS enforcement and secure cookie settings

### API Structure
- **Endpoints**:
  - `/api/auth/*`: Authentication flows and user management
  - `/api/dashboard`: Aggregated financial data and analytics
  - `/api/transactions`: CRUD operations for income/expense tracking
  - `/api/budgets`: Budget management and spending tracking
  - `/api/goals`: Financial goal setting and progress tracking
- **Error Handling**: Centralized error middleware with proper HTTP status codes
- **Validation**: Zod schemas for request/response validation
- **Filtering**: Query parameter support for date ranges, categories, and transaction types

### Development Environment
- **Build System**: Vite with React plugin and TypeScript support
- **Development Server**: Hot module replacement with error overlay
- **Code Quality**: TypeScript strict mode with comprehensive type checking
- **Deployment**: Production builds with Express static file serving

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless connection driver
- **drizzle-orm**: Type-safe database ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management and caching
- **react-hook-form**: Form management with validation
- **zod**: Runtime type validation and schema parsing

### UI Dependencies
- **@radix-ui/***: Unstyled, accessible UI primitives
- **lucide-react**: Icon library with consistent design
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management

### Authentication Dependencies
- **openid-client**: OpenID Connect client implementation
- **passport**: Authentication middleware framework
- **express-session**: Session management middleware
- **connect-pg-simple**: PostgreSQL session store

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Static type checking
- **@replit/vite-plugin-***: Replit-specific development enhancements
- **esbuild**: Fast JavaScript bundler for production builds

### Utility Dependencies
- **date-fns**: Date manipulation and formatting
- **clsx**: Conditional CSS class utilities
- **memoizee**: Function memoization for performance optimization