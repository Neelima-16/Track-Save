# 💰 FinanceTracker

A modern, full-stack personal finance management application built with React, TypeScript, and Express.js.

## ✨ Features

- 📊 **Dashboard**: Real-time financial overview with balance, income, and expenses
- 💰 **Transaction Tracking**: Add, edit, and categorize your income and expenses
- 🎯 **Budget Management**: Set and monitor budgets for different categories
- 🎲 **Goal Setting**: Track your financial goals and progress
- 📈 **Reports & Analytics**: Detailed financial reports and visualizations
- 🌍 **Multi-Currency Support**: Full support for Indian Rupees (INR) and other currencies
- 🎨 **Modern UI**: Clean, responsive design with dark/light theme support

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** components
- **Tanstack Query** for data fetching
- **Wouter** for routing

### Backend
- **Express.js** with TypeScript
- **Drizzle ORM** for database management
- **Session-based Authentication**
- **Neon PostgreSQL** database

### Key Features
- 🔐 **Secure Authentication** with session management
- 💱 **Global Currency Context** for seamless currency switching
- 📱 **Responsive Design** for all device sizes
- ⚡ **Real-time Updates** with hot module replacement

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or Neon account)

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/your-username/financetracker.git
cd financetracker
\`\`\`

### 2. Install dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Environment Setup
Create a \`.env\` file in the root directory:
\`\`\`env
DATABASE_URL=your_postgresql_connection_string
NODE_ENV=development
SESSION_SECRET=your-super-secret-session-key
PORT=8080
\`\`\`

### 4. Database Setup
\`\`\`bash
# Push database schema
npm run db:push
\`\`\`

### 5. Start the application
\`\`\`bash
# Start backend server
./start-server.bat   # Windows
# or
npm run dev          # Cross-platform

# Start frontend (in another terminal)
npx vite
\`\`\`

The application will be available at:
- Frontend: \`http://localhost:5173\`
- Backend API: \`http://localhost:8080\`

## 📁 Project Structure

\`\`\`
financetracker/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── providers/     # Context providers
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/          # Utility functions
├── server/                # Backend Express application
│   ├── routes.ts         # API routes
│   ├── localAuth.ts      # Authentication logic
│   └── index.ts          # Server entry point
├── shared/               # Shared TypeScript schemas
└── package.json         # Dependencies and scripts
\`\`\`

## 🌟 Key Features Implemented

### Currency Support
- **Indian Rupees (INR)** as default currency
- Global currency context for app-wide currency management
- Proper INR formatting with ₹ symbol
- Multi-currency support for international users

### Authentication
- Secure session-based authentication
- Demo user auto-creation for development
- Protected routes and API endpoints

### Database
- **Neon PostgreSQL** cloud database
- **Drizzle ORM** for type-safe database operations
- Optimized schema for financial data

## 🚀 Deployment

### Backend Deployment
1. Set up environment variables on your hosting platform
2. Deploy to platforms like Heroku, Railway, or Vercel
3. Ensure DATABASE_URL points to production database

### Frontend Deployment
1. Build the frontend: \`npm run build\`
2. Deploy to Netlify, Vercel, or any static hosting service
3. Update API proxy settings for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: \`git checkout -b feature/amazing-feature\`
3. Commit your changes: \`git commit -m 'Add amazing feature'\`
4. Push to the branch: \`git push origin feature/amazing-feature\`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern React and TypeScript
- UI components from Radix UI
- Styling with Tailwind CSS
- Database powered by Neon PostgreSQL

---

**Made with ❤️ for personal finance management**