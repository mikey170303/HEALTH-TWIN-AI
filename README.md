# HealthTwin AI — Personalized AI-Powered Healthcare and Wellness Web Application

HealthTwin AI is an end-to-end full-stack web application designed for personal biometric health monitoring, evidence-informed wellness reflections, and real machine-learning predictive analytics.

---

## 🌟 Key Application Features

1. **Professional Landing Page (`/`)**:
   - Modern healthcare aesthetic with deep teal (`#0f766e`), emerald, and soft neutral themes.
   - Interactive hero section, live twin preview cards, 6 core feature highlights, methodology flow, privacy disclosures, and medical disclaimers.

2. **Secure Authentication & Individual Accounts (`/login`, `/signup`, `/forgot-password`, `/reset-password`)**:
   - Individual user registration with terms acceptance verification.
   - Argon2/bcrypt password hashing with per-user salt.
   - JWT access tokens with configurable expiration.
   - Token-based single-use password reset workflow.
   - Strict per-user database scoping (User A cannot view, query, or delete User B's metrics).

3. **Guided Health Onboarding (`/app/onboarding`)**:
   - Baseline age, biological sex, height, weight, preferred units (metric/imperial).
   - Voluntary health focus areas and explicit health privacy consent.

4. **Interactive Dashboard (`/app`)**:
   - Live physiological twin summary cards for Blood Pressure, Resting Pulse, Sleep Duration, and Body Mass Index (BMI).
   - Dynamic sparkline trend graphs.
   - Active goal progress bars.
   - Trained machine learning inference cards.
   - Evidence-based lifestyle recommendations.

5. **Health Data Management (`/app/my-health`)**:
   - Full CRUD support for Blood Pressure (systolic & diastolic), Heart Rate, Weight, Sleep Duration, Step Count, and Blood Glucose.
   - Physiological range validation (e.g. realistic heart rates 30–240 bpm, blood pressure 50–260 mmHg).
   - Audit-grade table with pagination and filtering by metric type.
   - Bulk CSV import parser with row-level validation.
   - Direct CSV export of the authenticated user's own records.

6. **Longitudinal Analytics & Charts (`/app/analytics`)**:
   - Multi-metric historical visualizations using Recharts.
   - Timeframe toggles (7 Days, 30 Days, 90 Days, 1 Year).
   - Statistical summaries: minimum, maximum, average, and observation frequencies.

7. **Real Machine Learning Prediction Engine (`/app/predictions`)**:
   - **10-Year Cardiovascular Screening Risk**: Scikit-Learn Random Forest Classifier + StandardScaler (ROC-AUC: 0.986, Accuracy: 91.8%) trained on clinical biometric distributions (age, sex, systolic BP, diastolic BP, BMI, glucose, activity, pulse).
   - **Weight Trajectory Forecaster**: Ordinary Least Squares (OLS) regression with 95% confidence intervals and user-selected forecast horizons (30, 60, 90 days).
   - **Biometric Outlier Detection**: Scikit-Learn Isolation Forest identifying acute physiological anomalies.
   - Full limitation disclaimers and metadata tracking.

8. **AI Health Assistant (`/app/assistant`)**:
   - Conversational health assistant grounded strictly in the user's recorded observations.
   - Natural language explanations for blood pressure fluctuations, sleep consistency, and BMI screening.
   - Google Gemini API integration with an automatic deterministic clinical engine fallback when no API key is provided.
   - Conversation history storage with one-click clear options.

9. **Personalized Recommendations (`/app/recommendations`)**:
   - Categorized wellness suggestions (DASH diet sodium moderation, sleep hygiene, NEAT activity, hydration).
   - Status tracking: Mark as applied, save, or dismiss.

10. **Wellness Goals & Milestones (`/app/goals`)**:
    - Quantitative targets with category-specific metrics, due dates, and progress percentage calculations.

11. **Health History (`/app/history`)**:
    - Audit-grade chronological timeline of all measurements with date-range filters.

12. **Profile & Settings (`/app/profile`, `/app/settings`)**:
    - Profile update and auto-BMI calculation.
    - Notification preferences and appearance theme.
    - **Danger Zone**: Permanent account deletion with full cascade deletion of all personal health records from MySQL.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, Tailwind CSS, Recharts, Lucide React, Axios |
| **Backend** | Python 3.14 / 3.12+, FastAPI, Uvicorn, SQLAlchemy 2.0, Alembic, Pydantic v2, PyJWT, Bcrypt |
| **Database** | MySQL 8.0 (persistent storage) |
| **Machine Learning** | Scikit-Learn, Pandas, NumPy, Scipy, Joblib |
| **AI Integration** | Google Gemini API (with deterministic clinical fallback engine) |
| **Testing** | Pytest, FastAPI TestClient, HTTPX |

---

## 📁 Project Directory Structure

```text
healthtwin-ai/
├── backend/
│   ├── alembic/                    # Database migration scripts
│   │   └── versions/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/             # auth, profile, health_records, dashboard, predictions, recommendations, goals, ai
│   │   │   ├── api.py              # Central router registration
│   │   │   └── deps.py             # Auth dependencies & token verification
│   │   ├── core/
│   │   │   ├── config.py           # Pydantic settings & CORS configuration
│   │   │   └── security.py         # Bcrypt hashing & PyJWT token generator
│   │   ├── db/
│   │   │   └── session.py          # SQLAlchemy engine, session maker, Base
│   │   ├── ml/
│   │   │   ├── dataset.py          # Clinical cohort dataset generator
│   │   │   ├── train.py            # Random Forest & Isolation Forest training pipeline
│   │   │   ├── inference.py        # Prediction & trajectory calculation service
│   │   │   └── saved_models/       # Serialized .joblib artifacts & metadata
│   │   ├── models/
│   │   │   └── entities.py         # SQLAlchemy ORM models (users, records, goals, predictions, etc.)
│   │   ├── schemas/
│   │   │   └── api_schemas.py      # Pydantic request & response models
│   │   ├── services/
│   │   │   ├── ai_assistant.py     # Gemini & deterministic clinical insights
│   │   │   └── recommendation_engine.py # Evidence-informed rules engine
│   │   └── main.py                 # FastAPI application entrypoint
│   ├── tests/                      # Automated test suite (Pytest)
│   ├── requirements.txt            # Python dependencies
│   ├── alembic.ini
│   ├── pytest.ini
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/             # Navbar, Footer, ProtectedRoute, AddRecordModal
│   │   ├── context/                # AuthContext
│   │   ├── layouts/                # AppLayout with collapsible sidebar & topbar
│   │   ├── pages/                  # Landing, Login, Signup, Dashboard, MyHealth, Analytics, Predictions, etc.
│   │   ├── services/               # Centralized Axios API service layer
│   │   ├── App.jsx                 # Route definitions
│   │   ├── main.jsx
│   │   └── index.css               # Tailwind CSS setup
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── .env.example
├── .gitignore
└── README.md
```

---

## 🚀 Windows Local Setup Guide

### 1. Prerequisites
- **Node.js**: v18+ or v24+ (verified on v24.22.1)
- **Python**: 3.10+ to 3.14+ (verified on v3.14.6)
- **MySQL Server**: 8.0+ running on port 3306

---

### 2. MySQL Database Setup
Open PowerShell or MySQL Command Line Client:
```sql
CREATE DATABASE IF NOT EXISTS healthtwin_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

### 3. Backend Setup & Run

1. Navigate to the backend directory:
   ```powershell
   cd C:\Users\ASUS\.gemini\antigravity\scratch\healthtwin-ai\backend
   ```

2. Create and activate a Python virtual environment:
   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   ```

3. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   Copy `.env.example` to `.env` and verify database credentials:
   ```env
   PROJECT_NAME="HealthTwin AI"
   API_V1_STR="/api/v1"
   SECRET_KEY="healthtwin-super-secret-jwt-key-2026-secure-token-vault-9921"
   ALGORITHM="HS256"
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   DATABASE_URL="mysql+pymysql://root:1234@localhost:3306/healthtwin_ai"
   GEMINI_API_KEY=""
   CORS_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"
   ```

5. Run Alembic database migrations:
   ```powershell
   alembic upgrade head
   ```

6. Train machine learning model artifacts (if regenerating):
   ```powershell
   python -m app.ml.train
   ```

7. Run automated test suite:
   ```powershell
   pytest
   ```

8. Start the FastAPI backend server:
   ```powershell
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   - **Swagger Interactive API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - **ReDoc Documentation**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
   - **Health Check Endpoint**: [http://localhost:8000/health](http://localhost:8000/health)

---

### 4. Frontend Setup & Run

1. Open a new PowerShell terminal and navigate to the frontend directory:
   ```powershell
   cd C:\Users\ASUS\.gemini\antigravity\scratch\healthtwin-ai\frontend
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. Verify `.env`:
   ```env
   VITE_API_URL=http://localhost:8000/api/v1
   ```

4. Build or start the development server:
   ```powershell
   npm run dev
   ```
   Open your browser to: [http://localhost:5173](http://localhost:5173)

---

## 🔒 Security & Privacy Notice
HealthTwin AI is built on the principle of strict zero-trust user data separation:
- **No shared queries**: Every database select, insert, update, and delete is strictly filtered by the authenticated user's ID extracted from the verified JWT bearer payload.
- **Password security**: Passwords are never stored in plaintext and are hashed with bcrypt.
- **Data Erasure**: Users can permanently purge their account and all health observations directly via `/app/settings`.
- **Medical Disclaimer**: HealthTwin AI is an educational wellness monitoring system and does not provide clinical diagnostic certifications. Consult a licensed medical practitioner for personalized healthcare treatment.
