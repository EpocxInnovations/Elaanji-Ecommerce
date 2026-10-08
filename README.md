# Elaanji — Garments E-Commerce Platform

A full-stack e-commerce platform for selling luxury Indian sarees. The platform includes a customer storefront, a secure checkout process, an AI-powered support chatbot, and a comprehensive admin panel.

## Tech Stack
- **Backend**: FastAPI (Python), SQLAlchemy, PostgreSQL
- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion
- **AI**: Local embeddings (Sentence-Transformers) + NVIDIA NIM LLM API

---

## How to Run the Project Locally (Windows)

Follow these steps to get the full stack running on your local Windows machine.

### 1. Database Setup (PostgreSQL)

You need to have PostgreSQL installed and running on your machine.

1. Open your PostgreSQL tool (e.g., pgAdmin or psql).
2. Create a new database named `Elaanji`.
3. Keep your Postgres username and password handy (default is usually `postgres`).

### 2. Backend Setup

Open a new PowerShell terminal and navigate to the backend directory:

```powershell
cd D:\elaanji\backend
```

**a. Create and activate a virtual environment:**
```powershell
python -m venv venv
.\venv\Scripts\activate
```

**b. Install dependencies:**
```powershell
pip install -r requirements.txt
```

**c. Configure environment variables:**
If you don't have a `.env` file yet, copy the example file:
```powershell
cp .env.example .env
```
Open the `.env` file and update your `DATABASE_URL` with your Postgres credentials:
```
DATABASE_URL=postgresql+psycopg2://postgres:YOUR_PASSWORD@localhost:5432/Elaanji
```
*Note: Make sure to fill in your `JWT_SECRET_KEY` and NVIDIA API keys as well.*

**d. Run database migrations:**
This creates all the necessary tables in your database.
```powershell
alembic upgrade head
```

**e. (Optional) Seed the database:**
To populate the store with dummy products, categories, and chatbot knowledge base:
```powershell
python scripts\seed_catalog.py
python scripts\seed_knowledge_base.py
```

**f. Start the backend server:**
```powershell
uvicorn app.main:app --reload --port 8000
```
*The API will be running at `http://localhost:8000` and the interactive docs at `http://localhost:8000/docs`.*

---

### 3. Frontend Setup

Open a **second** PowerShell terminal and navigate to the frontend directory:

```powershell
cd D:\elaanji\frontend
```

**a. Install Node.js dependencies:**
```powershell
npm install
```

**b. Start the development server:**
```powershell
npm run dev
```
*The storefront will be running at `http://localhost:5173`.*

---

## Creating an Admin User

There is no UI to create an admin account directly. To access the admin panel at `http://localhost:5173/admin`:

1. Go to the storefront and sign up for a normal customer account.
2. Open your Postgres database (pgAdmin or psql).
3. Run the following SQL query to promote your account:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your_email@example.com';
```
4. Log back in on the website to see the Admin Dashboard.
