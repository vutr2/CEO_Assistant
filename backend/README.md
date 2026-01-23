# CEO AI Assistant - Backend API

A comprehensive backend API for the CEO AI Assistant application, providing authentication, financial management, employee tracking, and AI-powered business insights.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Financial Management**: Track revenue, expenses, budgets, and cash flow
- **Reports & Analytics**: Generate various business reports and insights
- **Employee Management**: Track employees, performance, and attendance
- **Company Management**: Manage company information and settings
- **AI Integration**: AI-powered business insights and recommendations

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: JWT (JSON Web Tokens)
- **Data Storage**: In-memory mock data (ready for MongoDB integration)
- **Logging**: Custom logger with Winston-style formatting

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to backend directory
```bash
cd backend
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

Edit `.env` and update with your configuration values.

4. Start the development server
```bash
npm run dev
```

The server will start on `http://localhost:5000`.

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password/:token` - Reset password

### Finance
- `GET /api/v1/finance/overview` - Financial overview
- `GET /api/v1/finance/revenue` - Get revenue records
- `POST /api/v1/finance/revenue` - Add revenue
- `GET /api/v1/finance/expenses` - Get expenses
- `POST /api/v1/finance/expenses` - Add expense
- `GET /api/v1/finance/metrics` - Financial metrics
- `GET /api/v1/finance/cashflow` - Cash flow data

### Reports
- `GET /api/v1/reports/overview` - Overview report
- `GET /api/v1/reports/dashboard` - Dashboard metrics
- `GET /api/v1/reports/financial/summary` - Financial summary
- `GET /api/v1/reports/employees/summary` - Employee summary
- `POST /api/v1/reports/custom` - Generate custom report

## License

ISC
