# Contact Manager (Full-Stack React + FastAPI + MongoDB Atlas)

A modern, responsive, full-stack Contact Manager web application built from scratch with **React (Vite)** on the frontend, **FastAPI (Python)** on the backend, and **MongoDB Atlas Free Tier** for cloud database persistence.

---

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Backend Setup & Run](#backend-setup--run)
  - [Windows PowerShell](#windows-powershell)
  - [macOS and Linux](#macos-and-linux)
  - [Backend Environment Variables](#backend-environment-variables)
- [MongoDB Atlas Setup Guide](#mongodb-atlas-setup-guide)
- [Frontend Setup & Run](#frontend-setup--run)
  - [Install & Start](#install--start)
  - [Production Build](#production-build)
- [REST API Reference](#rest-api-reference)
- [Automated Tests](#automated-tests)
- [Security & Limitations](#security--limitations)

---

## Architecture Overview

```
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│        React Frontend           │  Axios    │         FastAPI Backend         │
│  • Vite Development Server      │ ────────> │  • Uvicorn ASGI Server          │
│  • Functional Hooks & Plain CSS │  HTTP/    │  • PyMongo AsyncMongoClient     │
│  • Lucide Icons & Toasts        │   JSON    │  • Pydantic v2 Request/Response │
│  • http://localhost:5173        │ <──────── │  • http://localhost:8000/docs  │
└─────────────────────────────────┘           └────────────────┬────────────────┘
                                                               │
                                                               │ Motor / Async PyMongo
                                                               │ TLS Connection
                                                               ▼
                                              ┌─────────────────────────────────┐
                                              │    MongoDB Atlas (Free Tier)    │
                                              │  • Database: contact_manager_db │
                                              │  • Collection: contacts         │
                                              └─────────────────────────────────┘
```

---

## Repository Structure

```text
cipher/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app, CORS middleware, lifespan
│   │   ├── config.py            # Pydantic Settings & environment validation
│   │   ├── database.py          # PyMongo AsyncMongoClient connection lifecycle
│   │   ├── models.py            # MongoDB ObjectId & document serialization
│   │   ├── schemas.py           # Pydantic validation schemas
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   └── contacts.py      # /api/contacts & /api/health endpoints
│   │   └── services/
│   │       ├── __init__.py
│   │       └── contact_service.py # Core business & database logic
│   ├── tests/
│   │   ├── __init__.py
│   │   └── test_contacts.py     # Pytest test suite with offline mocks
│   ├── .env.example             # Template for backend secrets
│   └── requirements.txt         # Pinned backend dependencies
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── contacts.js      # Central Axios client and API calls
│   │   ├── components/
│   │   │   ├── Header.jsx       # Navigation header & Atlas health badge
│   │   │   ├── ContactCard.jsx  # Card with initials avatar and action buttons
│   │   │   ├── ContactForm.jsx  # Reusable Add/Edit modal with field validation
│   │   │   ├── SearchBar.jsx    # Debounced search input
│   │   │   ├── ConfirmDialog.jsx# Delete confirmation modal
│   │   │   ├── EmptyState.jsx   # Zero-state and empty search results
│   │   │   ├── LoadingState.jsx # Card skeleton loaders
│   │   │   └── ErrorState.jsx   # Error screen with retry action
│   │   ├── pages/
│   │   │   ├── ContactsPage.jsx # Main dashboard with summary counters
│   │   │   └── ContactDetailsPage.jsx # Comprehensive single contact view
│   │   ├── App.jsx              # Root component & toast notifications
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Responsive SaaS stylesheet
│   ├── .env.example             # Template for frontend environment
│   ├── package.json             # NPM dependencies & scripts
│   └── vite.config.js           # Vite build configuration
├── .agents/
│   └── rules/
│       └── project.md           # Engineering & architecture guidelines
├── .gitignore                   # Ignores .venv, node_modules, and real .env files
└── README.md                    # Project documentation
```

---

## Prerequisites

- **Python**: Version 3.11 or newer (Python 3.11, 3.12, 3.13, 3.14).
- **Node.js**: Version 18 or newer (with `npm`).
- **MongoDB Atlas**: A free cloud account at [cloud.mongodb.com](https://cloud.mongodb.com).

---

## Backend Setup & Run

### Windows PowerShell

1. Open PowerShell and navigate to the `backend/` folder:
   ```powershell
   cd d:\cipher\backend
   ```

2. Create and activate a Python virtual environment:
   ```powershell
   py -3 -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```
   *(If script execution is blocked on Windows, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned` first).*

3. Upgrade `pip` and install backend requirements:
   ```powershell
   python -m pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. Create your local configuration file:
   ```powershell
   Copy-Item .env.example .env
   ```
   Open `backend/.env` in your text editor and insert your MongoDB Atlas URI (see [MongoDB Atlas Setup Guide](#mongodb-atlas-setup-guide)).

5. Start the backend development server:
   ```powershell
   python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   *(Using `python -m uvicorn` runs directly via the signed Python executable and avoids Windows Application Control / AppLocker blocks on standalone script stubs).*

6. Open your browser to verify:
   - **FastAPI Interactive Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - **Service Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

### macOS and Linux

1. Open a terminal and navigate to `backend/`:
   ```bash
   cd backend
   ```

2. Create and activate the virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. Upgrade `pip` and install dependencies:
   ```bash
   python -m pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. Create your local configuration:
   ```bash
   cp .env.example .env
   ```

5. Run the backend server:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

To stop the server at any time, press `Ctrl + C`. To reactivate the virtual environment in a new terminal, run `source .venv/bin/activate` (macOS/Linux) or `.\.venv\Scripts\Activate.ps1` (Windows).

---

### Backend Environment Variables

Located in `backend/.env`:

| Variable | Description | Default / Example |
|---|---|---|
| `MONGODB_URL` | MongoDB Atlas connection string | `mongodb+srv://<user>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority` |
| `DATABASE_NAME` | Database name in MongoDB | `contact_manager_db` |
| `FRONTEND_ORIGIN` | Allowed origin for CORS | `http://localhost:5173` |

---

## MongoDB Atlas Setup Guide

Follow these steps to set up your free cloud database cluster:

1. **Sign in to MongoDB Atlas**:
   - Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and sign in or create an account.

2. **Create a Free Tier Cluster**:
   - In your Atlas Organization, create a project (e.g. `ContactManager`).
   - Click **Create Deployment** and select the **M0 Free Tier** (Shared).
   - Choose a cloud provider (AWS, GCP, or Azure) and a region nearest to you.
   - Click **Create Deployment**.

3. **Create a Database User**:
   - Go to **Security > Database Access** in the left sidebar.
   - Click **Add New Database User**.
   - Authentication Method: **Password**.
   - Enter a username (e.g., `contact_app_user`) and a secure password.
   - Database User Privileges: Select **Read and write to any database** or restrict to `contact_manager_db`.
   - Click **Add User**.
   - *Tip*: If your password contains special characters (`@`, `:`, `/`, `%`, `&`, `?`), they must be **URL-encoded** in the connection URI (e.g., `@` becomes `%40`, `%` becomes `%25`).

4. **Configure Network Access (IP Allowlist)**:
   - Go to **Security > Network Access** in the left sidebar.
   - Click **Add IP Address**.
   - Select **Add Current IP Address** to authorize your local computer.
   - Click **Confirm**.
   - *(Note: Never leave `0.0.0.0/0` (allow access from anywhere) enabled permanently; use only your specific IP address to protect your cluster).*

5. **Copy the Connection String**:
   - Go to **Database > Clusters** and click **Connect**.
   - Select **Drivers** under "Connect to your application".
   - Select **Python** and driver version `3.12 or later`.
   - Copy the connection string format:
     ```text
     mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with the database user credentials created in step 3.

6. **Configure `backend/.env`**:
   - Paste the URI into `backend/.env` as `MONGODB_URL`:
     ```ini
     MONGODB_URL=mongodb+srv://contact_app_user:YourSecretPass@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
     DATABASE_NAME=contact_manager_db
     FRONTEND_ORIGIN=http://localhost:5173
     ```
   - Restart the backend server.
   - Visit `http://localhost:8000/api/health` in your browser. You will see:
     ```json
     {
       "status": "ok",
       "database": "connected",
       "database_name": "contact_manager_db",
       "detail": "Connected and authenticated to MongoDB Atlas cluster."
     }
     ```

---

## Frontend Setup & Run

### Install & Start

Open a separate terminal session from the repository root:

1. Navigate to `frontend/`:
   ```powershell
   cd d:\cipher\frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Ensure `frontend/.env` contains the API URL:
   ```ini
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```

5. Open your browser at:
   [http://localhost:5173](http://localhost:5173)

### Production Build

To test or build the optimized production assets:
```bash
npm run build
```
The compiled output is generated in `frontend/dist/`.

---

## REST API Reference

The backend exposes clean REST endpoints under `/api/contacts`:

| Method | Endpoint | Description | Status Code |
|---|---|---|---|
| `GET` | `/api/health` | Service and MongoDB Atlas health check | `200 OK` |
| `GET` | `/api/contacts` | List all contacts (supports `?search=` query across name, email, phone, company) | `200 OK` |
| `GET` | `/api/contacts/{id}` | Retrieve single contact by 24-character ObjectId | `200 OK` / `404 Not Found` / `400 Bad Request` |
| `POST` | `/api/contacts` | Create a new contact with automatic UTC timestamps | `201 Created` / `422 Unprocessable Content` |
| `PUT` | `/api/contacts/{id}` | Update existing contact fields and update `updated_at` | `200 OK` / `404 Not Found` / `400 Bad Request` |
| `DELETE` | `/api/contacts/{id}` | Delete contact permanently | `204 No Content` / `404 Not Found` / `400 Bad Request` |

### JSON Contact Schema Example

```json
{
  "id": "6717d23a49f50cb936d9d150",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+91 9876543210",
  "company": "Example Technologies",
  "job_title": "Software Engineer",
  "address": "Kochi, Kerala",
  "notes": "Met at a tech conference",
  "created_at": "2026-10-22T15:47:00Z",
  "updated_at": "2026-10-22T15:47:00Z"
}
```

---

## Automated Tests

Backend automated tests are written with `pytest` and `httpx`. The test suite features:
- In-memory service mocking using FastAPI dependency injection (`app.dependency_overrides`) so that all tests can run offline without modifying any real database.
- A live Atlas integration test fixture that automatically skips if `MONGODB_URL` is not set.

### Running Backend Tests

From the `backend/` directory with the virtual environment activated:

```powershell
# Windows
.\.venv\Scripts\python.exe -m pytest -v

# macOS / Linux
pytest -v
```

### Verified Test Cases
1. `test_health_endpoint`: Verifies service status and database state reporting.
2. `test_create_contact_success`: Validates contact creation and schema response.
3. `test_create_contact_required_name_missing`: Validates that empty/missing names return HTTP 422.
4. `test_create_contact_invalid_email`: Validates email regex/format rules return HTTP 422.
5. `test_get_all_contacts`: Validates retrieving all contacts ordered by update date.
6. `test_get_individual_contact`: Validates single contact retrieval by ID.
7. `test_get_individual_contact_not_found`: Validates 404 response on unknown ID.
8. `test_get_contact_malformed_id`: Validates 400 Bad Request on invalid 24-char hex ID.
9. `test_update_contact_success`: Validates updating fields and timestamps.
10. `test_update_contact_not_found`: Validates 404 response when updating unknown record.
11. `test_update_contact_malformed_id`: Validates 400 on malformed ID during update.
12. `test_delete_contact_success`: Validates HTTP 204 deletion and subsequent 404.
13. `test_delete_contact_not_found`: Validates 404 on deleting non-existent ID.
14. `test_delete_contact_malformed_id`: Validates 400 on malformed ID during delete.
15. `test_search_contacts`: Validates case-insensitive search across name, email, phone, and company.
16. `test_real_mongodb_atlas_integration`: Live cloud test against Atlas cluster (skipped when offline).

---

## Security & Limitations

- **Authentication**: This project is designed as a local single-user learning and portfolio project. Authentication (e.g. JWT or OAuth) is deliberately excluded from scope.
- **Credential Storage**: Never commit `.env` or database passwords to version control. The `.gitignore` is pre-configured to ignore all real `.env` files while tracking `.env.example`.
- **IP Restrictions**: When setting up MongoDB Atlas, always restrict network access to your current IP address rather than using `0.0.0.0/0`.
