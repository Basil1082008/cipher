# Cipher

Cipher is a sample full-stack web application for encrypting and decrypting text. It has a browser-based frontend and a Python backend that provides the encryption API.

> This README describes an example project structure and stack. Adjust the commands and details to match the implementation as it develops.

## Features

- Encrypt and decrypt text from a web interface
- Communicate with a backend through a JSON REST API
- Validate input and display clear error messages
- Keep encryption logic on the server

## Example Stack

- **Frontend:** React, TypeScript, and Vite
- **Backend:** Python and FastAPI
- **API format:** JSON over HTTP

## Project Structure

```text
cipher/
├── frontend/            # React web application
│   ├── src/
│   └── package.json
├── backend/             # FastAPI application
│   ├── app/
│   │   └── main.py
│   └── requirements.txt
└── README.md
```

## Getting Started

### Prerequisites

- Python 3.10 or newer
- Node.js 20 or newer with npm

### Run the backend

From the project root, create and activate a virtual environment, then install the backend dependencies:

```bash
cd backend
python -m venv .venv
```

Activate the environment (`.venv\Scripts\activate` in Windows PowerShell, or `source .venv/bin/activate` on macOS/Linux), then run:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API is available at `http://localhost:8000`. FastAPI's interactive API documentation is at `http://localhost:8000/docs`.

### Run the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Example API

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | Check that the backend is running |
| `POST` | `/api/encrypt` | Encrypt submitted text |
| `POST` | `/api/decrypt` | Decrypt submitted text |

Example request body:

```json
{
  "text": "Hello, Cipher!",
  "key": "your-secret-key"
}
```

The exact request and response formats depend on the backend implementation. Do not use an educational sample cipher to protect sensitive information; use a vetted cryptography library and an appropriate key-management strategy for real security needs.

## Configuration

Configure the frontend's API base URL to point to the backend. For local development, this is typically `http://localhost:8000`. Keep secrets out of source control and use environment variables for configuration that should not be committed.

## Testing

Add backend tests for API validation and encryption/decryption behavior, and frontend tests for form submission and error handling. Example commands, once configured:

```bash
# Backend
pytest

# Frontend
npm test
```

## License

Add the project's license information here.