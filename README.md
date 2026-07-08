# 🪙 Smart Finance Tracker

An advanced full-stack financial management platform designed to track income, expenses, set monthly category budgets, visualize spending patterns, and provide AI-generated financial insights.

---

## 🚀 Live Demo & Links

*   **Live Application URL:** [https://meeramirsha.github.io/smart-finance-tracker/](https://meeramirsha.github.io/smart-finance-tracker/)
*   **Live Backend Base API:** `https://smart-finance-tracker-cq0m.onrender.com/api`
*   **Live Video Walkthrough / Demo:** [Click here to watch the Video Walkthrough](https://youtu.be/your-video-link-here) *(Placeholder - please replace with your actual YouTube or Loom demo video link!)*

---

## 🔑 Demo Sign-In Credentials

To test the application quickly without registering, you can use the pre-configured user profile:

*   **Email Address:** `user@example.com`
*   **Password:** `password123`

> [!NOTE]
> * **Local Run:** The backend automatically runs on a local database where these credentials are pre-registered and ready for login.
> * **Live Run:** If you are testing the live site on GitHub Pages and it's your first time, simply click **Register** on the screen to create this user (or any custom email) since database storage on free-tier Render instances may reset or sleep.

---

## 🛠️ Technology Stack

*   **Frontend:** Angular (built with components, modular services, TailwindCSS/Vanilla CSS styling)
*   **Backend:** Spring Boot (Java 17, Spring Security with JWT token-based authentication, Spring Data JPA)
*   **Database:** PostgreSQL (for storing transactions, user info, budgets, and AI insights)
*   **AI Integration:** Google Gemini API (`gemini-1.5-flash` model for generating personalized weekly/monthly finance advice, saving challenges, and budget warnings)

---

## 💻 Local Setup & Execution Guide

Follow these steps to run the PostgreSQL database, Spring Boot backend, and Angular frontend on your local system.

### 1. Database Setup

Make sure PostgreSQL is running on your machine. You can initialize the `smart_finance` database using one of two methods:

#### Method A: Auto-create via Spring Boot Test (Recommended)
We have included a database initialization utility in `backend/src/test/java/com/smartfinance/CreateDbTest.java`. 
Run the test from the backend directory to auto-create the database:
```powershell
# In the backend directory
.\mvnw.cmd test -Dtest=CreateDbTest
```

#### Method B: Manual Creation
Log into your PostgreSQL shell and execute:
```sql
CREATE DATABASE smart_finance;
```

---

### 2. Run the Spring Boot Backend

The backend is configured to run on port **8080**. Make sure to supply the database credentials for your local PostgreSQL instance (default port is `5432` with username `postgres` and password `root`).

```powershell
# From the backend directory
$env:SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/smart_finance"
$env:SPRING_DATASOURCE_USERNAME="postgres"
$env:SPRING_DATASOURCE_PASSWORD="root"
.\mvnw.cmd spring-boot:run
```

Once running successfully, the API will be available at `http://localhost:8080/api/`.

---

### 3. Run the Angular Frontend

The frontend is configured to detect if you are running locally (i.e. on `localhost`) and automatically route API requests to your local backend (`http://localhost:8080/api`). If loaded over the web, it connects to the Render production API.

```powershell
# Navigate to the frontend directory
cd frontend

# Install node dependencies
npm install

# Run the Angular server
npm start
```

Open your browser and navigate to **`http://localhost:4200/`** to interact with the local client.

---

## ✨ Features Checklist

- [x] **Secure JWT Authentication:** User sign-up, sign-in, and auto-login using local storage tokens.
- [x] **Dashboard Overview:** Summary cards showing total income, expenses, budget status, and monthly trend graphs.
- [x] **Transaction Management:** Create, edit, and delete income/expense items with categorization and search filtering.
- [x] **Monthly Budget Planning:** Set customized spending caps for individual categories and view budget exhaustion meters.
- [x] **AI Financial Insights:** Generates dynamic recommendations, flags leaks (like excessive food orders), and issues saving challenges based on your real transactions using Gemini.
