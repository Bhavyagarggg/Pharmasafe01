# PharmaSafe 💊

A comprehensive pharmacy management system for tracking medicine expiry dates, managing stock, and preventing wastage through intelligent alerts and predictions.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/samarcodesinpythons-projects/v0-pharmacy-expiry-dashboard-final)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)

## Overview

PharmaSafe is a modern web application designed to help pharmacies and healthcare facilities manage their medicine inventory efficiently. The system tracks medicine batches, monitors expiry dates, generates intelligent alerts, and provides predictive analytics to minimize wastage and ensure patient safety.

## Features

### 📊 Dashboard Overview
- Real-time KPI cards showing total medicines, expiring soon, expired stock, and safe stock
- Visual charts for expiry distribution and wastage forecasting
- Recent alerts summary with severity indicators

### 💊 Medicine & Batch Management
- Add, edit, and delete medicine batches
- Track batch IDs, purchase dates, expiry dates, and quantities
- Support for different storage conditions (Cold/Room temperature)
- Search and filter functionality

### 🔔 Smart Alerts System
- Automatic alerts for medicines expiring soon or expired
- Severity-based alert system (red, amber, green)
- Dismissible alerts with quick actions
- Filter alerts by status (all, expiring, expired)

### 🤖 AI-Powered Predictions
- Machine learning-based expiry risk predictions
- Risk scores (0-100) with confidence levels
- Remaining days calculation
- Manual recomputation option

### 📦 Stock Prioritization (FEFO)
- First Expired First Out (FEFO) sorting
- Prioritized stock list for efficient dispensing
- CSV export functionality
- Visual indicators for urgent items

### 📈 Reports & Analytics
- Comprehensive reporting system
- Expiry distribution analysis
- Wastage forecasting
- Historical data tracking

### 👤 User Management
- Secure authentication with Supabase Auth
- User profiles with role-based access
- Multi-user support with data isolation
- Row-level security (RLS) for data protection

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI component library
- **Recharts** - Data visualization
- **SWR** - Data fetching and caching
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - Row Level Security (RLS)
  - Real-time subscriptions

### Deployment
- **Vercel** - Hosting and deployment
- **Vercel Analytics** - Usage analytics

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 18+ and npm/pnpm/yarn
- **Supabase account** (free tier works)
- **Git** (optional, for version control)

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Pharmasafe
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Using pnpm (recommended):
```bash
pnpm install
```

Using yarn:
```bash
yarn install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy your project URL and anon key

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ML_SERVICE_URL=http://localhost:5000
```

**Environment Variables:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `ML_SERVICE_URL` - ML prediction service URL (default: `http://localhost:5000`)

### 5. Set Up ML Service (Optional but Recommended)

The ML prediction service provides intelligent expiry risk predictions. To set it up:

1. **Navigate to ML service directory:**
   ```bash
   cd ml-service
   ```

2. **Create Python virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the ML service:**
   ```bash
   python app.py
   ```

   The service will run on `http://localhost:5000` by default.

   > **Note:** The ML service uses rule-based predictions by default. To enable ML models, train them first using `train.py` and set `USE_ML=true` environment variable.

   For more details, see [ml-service/README.md](ml-service/README.md).

### 6. Set Up Database

Run the SQL scripts in your Supabase SQL Editor in order:

1. **Create tables and RLS policies:**
   ```bash
   # Copy and run the contents of scripts/01-create-tables.sql
   ```

2. **Create user profiles:**
   ```bash
   # Copy and run the contents of scripts/02-add-user-profiles.sql
   ```

3. **Add predictions INSERT policy (if needed):**
   ```bash
   # If you get RLS policy errors when inserting predictions, run:
   # Copy and run the contents of scripts/03-add-predictions-insert-policy.sql
   ```

### 7. Run the Development Server

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 8. Create an Account

1. Navigate to `/auth/signup`
2. Create your account
3. Verify your email (if email confirmation is enabled)
4. Sign in at `/auth/login`

### 9. Generate Predictions

1. Add some medicines in the **Medicines & Batches** page
2. Navigate to **Expiry Predictions** page
3. Click **Re-run predictions** to generate risk predictions
4. View predictions with risk scores, confidence levels, and remaining days

> **Note:** Make sure the ML service is running (from step 5) before using the predictions feature.

## Project Structure

```
Pharmasafe/
├── app/                      # Next.js App Router
│   ├── (dashboard)/         # Dashboard routes (protected)
│   │   ├── alerts/          # Alerts page
│   │   ├── medicines/       # Medicine management
│   │   ├── predictions/     # Expiry predictions
│   │   ├── stock/           # Stock prioritization
│   │   ├── reports/         # Reports & analytics
│   │   └── profile/         # User profile
│   ├── api/                 # API routes
│   │   ├── alerts/          # Alerts endpoints
│   │   ├── medicines/       # Medicine CRUD
│   │   ├── expiry/          # Expiry data
│   │   ├── predictions/     # Prediction endpoints
│   │   ├── stock/           # Stock management
│   │   └── reports/         # Report generation
│   └── auth/                # Authentication pages
├── components/              # React components
│   ├── charts/             # Chart components
│   ├── tables/             # Table components
│   └── ui/                 # shadcn/ui components
├── hooks/                   # Custom React hooks
├── lib/                     # Utility functions
│   ├── supabase.ts         # Supabase client
│   ├── supabase-server.ts  # Server-side Supabase
│   ├── ml-client.ts        # ML service client
│   └── utils.ts            # Helper functions
├── scripts/                 # Database scripts
│   ├── 01-create-tables.sql
│   └── 02-add-user-profiles.sql
├── ml-service/              # Python ML prediction service
│   ├── app.py              # Flask API server
│   ├── predictor.py        # Prediction model
│   ├── feature_extractor.py # Feature engineering
│   ├── train.py            # Model training script
│   ├── requirements.txt    # Python dependencies
│   ├── models/             # Saved ML models
│   └── README.md           # ML service documentation
└── public/                  # Static assets
```

## Database Schema

### Tables

- **medicines** - Stores medicine batch information
  - id, name, batch_id, purchase_date, expiry_date, quantity, storage, user_id

- **alerts** - Stores alert notifications
  - id, title, message, severity, batch_id, dismissed, user_id

- **predictions** - Stores ML predictions
  - id, batch_id, risk, confidence, remaining_days, user_id

- **user_profiles** - Extended user information
  - id, email, full_name, role, pharmacy_name

All tables have Row Level Security (RLS) enabled to ensure users can only access their own data.

## API Endpoints

### Medicines
- `GET /api/medicines` - List all medicines
- `POST /api/medicines` - Create new medicine
- `PATCH /api/medicines/[id]` - Update medicine
- `DELETE /api/medicines/[id]` - Delete medicine

### Alerts
- `GET /api/alerts` - List all alerts
- `PATCH /api/alerts/[id]` - Dismiss/update alert

### Predictions
- `GET /api/predictions` - Get all predictions
- `POST /api/predictions/recompute` - Recompute predictions

### Expiry
- `GET /api/expiry` - Get expiry data and KPIs

### Stock
- `GET /api/stock/prioritization` - Get prioritized stock list (CSV export supported)

### Reports
- `GET /api/reports` - Generate reports

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Features in Detail

### Expiry Tracking
The system automatically calculates:
- Days until expiry
- Expiring soon threshold (configurable, typically 30 days)
- Expired items
- Safe stock (expiring after threshold)

### Alert System
Alerts are automatically generated when:
- A medicine is expiring within the threshold period
- A medicine has expired
- Risk predictions indicate high wastage probability

### FEFO Prioritization
Stock is automatically sorted by:
1. Expiry date (earliest first)
2. Purchase date (for same expiry dates)
3. Quantity available

This ensures the oldest stock is used first, minimizing wastage.

## Security

- **Row Level Security (RLS)** - Database-level security ensuring users only access their data
- **Authentication** - Secure authentication via Supabase Auth
- **API Protection** - All API routes verify user authentication
- **Input Validation** - Zod schemas validate all user inputs

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue in the repository.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Backend powered by [Supabase](https://supabase.com/)
- Deployed on [Vercel](https://vercel.com/)

---

**PharmaSafe** - Ensuring medicine safety, one batch at a time. 💊
