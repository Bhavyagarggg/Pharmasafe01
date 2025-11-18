💊 PharmaSafe

Database-Centric Medicine Expiry and Stock Prioritization

🎯 1. Project Overview

PharmaSafe is a smart pharmacy management system designed to predict medicine expiry, automate alerts, and prioritize stock usage efficiently.

It integrates AI-driven expiry prediction with a relational database and an interactive dashboard, ensuring compliance, zero wastage, and timely utilization of medicines.

Built for pharmacies, hospitals, and distributors, PharmaSafe automates manual monitoring, tracks batches, and helps users make informed decisions through real-time insights.

🧱 2. Key Features

🧾 Medicine & Batch Management – Add, track, and manage medicine batches with details like manufacture date, expiry date, quantity, and storage type.

🤖 AI Expiry Prediction – Predicts expiry risk levels and expected expiry dates using machine learning trained on storage and batch patterns.

📩 Smart Alert Engine – Automatically scans daily/weekly and sends Email/SMS alerts for expired and soon-to-expire medicines.

📊 Dashboard & Analytics – Displays stock status (Safe / Expiring / Expired), monthly wastage forecasts, and expiry distribution charts.

📦 Stock Prioritization (FEFO) – Implements “First Expire, First Out” logic to guide which batches should be dispensed first.

🌗 Light / Dark Mode Toggle – Dual-theme interface with a soothing green palette; optimized for long hours of use.

🔐 Login / Profile System – Secure email-based login; once signed in, the user’s name appears on the profile button for personalization.

🧮 Reports & Exports – Generate and export stock and expiry reports in CSV or PDF format for compliance and audit purposes.

⚡ 3. Recent Updates 🏷️ Branding

“Pharmacy” text replaced with PharmaSafe in the sidebar header.

Added a new project tagline: "Smart Tracking for Safer Pharma."

🔑 Login & Profile

Added Login / Sign-Up interface with fields for Name, Email, and Password.

Once authenticated, the Profile button displays the user’s name.

Profile dropdown includes “Settings” and “Logout”.

🌗 Theme Enhancement

Added dark/light mode toggle at the top-right corner.

Light Mode: soft mint-green palette (#E8F5E9, #43A047)

Dark Mode: deep leafy green tone (#1B1F1D, #66BB6A)

Smooth color transition and consistent readability across pages.

📊 Chart Improvements

Dark mode charts now use soft mint-green bars for better contrast.

Hover tooltips are clearly visible with improved font contrast.

Bar colors: #81C784 (normal), #A5D6A7 (hover).

🧩 Page Enhancements

Medicines & Batches: Added “+ Add Medicine/Batch” button.

Stock Prioritization: Heading simplified to “Stock Prioritization” (removed “(FEFO)”).

Stocks now display Stock 1, Stock 2, Stock 3…, grouping same purchase dates.

Each stock lists medicines in order of earliest expiry first.

Dashboard Overview: refined visual spacing and card shadows for better hierarchy.

🧩 4. Technologies Used

(Note: Tech stack is optional to display; remove if required for academic submission)

Frontend: React / Next.js

Styling: Tailwind CSS + shadcn/ui

Visualization: Chart.js / Recharts

Database: MySQL / PostgreSQL

AI/ML: Python (scikit-learn) for expiry prediction

Automation: CRON jobs / Task Scheduler for periodic scans

Authentication: Email-based (JWT / cookie sessions)

🛠️ 5. Project Setup 🧰 Prerequisites

Node.js (v16 or higher)

Python (for ML module)

MySQL or PostgreSQL

Git

⚙️ Installation Steps

Clone the repository

git clone https://github.com/harshitapokhariya/Pharmasafe.git cd Pharmasafe

Install dependencies

npm install

Configure environment variables (database credentials, SMTP, etc.).

Run backend services (Flask / API server).

Start the development server

npm run dev

Visit http://localhost:3000 to view the dashboard.

🧭 6. Folder Structure PharmaSafe/ │ ├── components/ # UI components (cards, forms, charts) ├── pages/ # Dashboard, Medicines, Alerts, Reports ├── public/ # Static assets ├── styles/ # Global styles, Tailwind setup ├── data/ # Mock datasets for batch simulation ├── utils/ # Helper scripts for data & ML integration └── README.md

🪪 7. License

This project is licensed under the MIT License.

⭐ If you found this project helpful, consider starring the repository and sharing feedback!
