# JobTrack

A full-stack job application tracker built with React and Django REST Framework.

JobTrack helps students and job seekers organize their applications, track their progress, and manage their job search through a simple, private dashboard.

## Live Application

**Frontend:**  
https://job-tracker-neon-eta.vercel.app/login

**Backend API:**  
https://job-tracker-api-ctec.onrender.com/

**GitHub:**  
https://github.com/akshyaanand-tech/job-tracker

---

## Overview

Applying to multiple internships and jobs can quickly become difficult to manage.

JobTrack provides a centralized workspace where users can record the companies they have applied to, track the current status of each application, and update their progress throughout the hiring process.

The platform is built around authenticated, user-specific data. Every job application belongs to the user who created it, ensuring that users cannot access another user's applications.

---

## Features

### Authentication

- User registration
- JWT-based authentication
- Access and refresh tokens
- Automatic access-token attachment to API requests
- Automatic token refresh when the access token expires
- Protected frontend routes
- Logout functionality

### Job Application Management

- Add new job applications
- View saved applications
- Edit application information
- Delete applications
- Update application status
- Track the hiring stage of each application

### Application Status

JobTrack currently supports:

- **Applied**
- **Interviewing**
- **Rejected**

### Private User Data

Every application is associated with its authenticated owner.

The backend filters application queries by the currently authenticated user, ensuring that users cannot access another user's applications.

```text
User A → User A's applications only

User B → User B's applications only
```

---

# Tech Stack

## Frontend

- React
- Vite
- JavaScript
- Axios
- React Router
- CSS

## Backend

- Python
- Django
- Django REST Framework
- djangorestframework-simplejwt
- django-cors-headers
- Gunicorn
- WhiteNoise

## Database

- PostgreSQL — production
- SQLite — local development

## Deployment

- Vercel — React frontend
- Render — Django backend
- Render PostgreSQL — production database

## Development Tools

- Git
- GitHub
- VS Code

---

# Architecture

```text
                         JOBTRACK
                            |
              +-------------+-------------+
              |                           |
              v                           v
       React + Vite                Django REST API
          Vercel                       Render
              |                           |
              |       HTTPS + JWT         |
              +------------+--------------+
                           |
                           v
                     PostgreSQL
                        Render
```

---

# Authentication Architecture

JobTrack uses JWT authentication with Django REST Framework and Simple JWT.

The authentication flow is:

```text
User
 |
 v
React Login / Registration
 |
 v
Django REST API
 |
 v
JWT Authentication
 |
 +------ Access Token
 |
 +------ Refresh Token
 |
 v
Axios API Requests
 |
 | Authorization: Bearer <access_token>
 |
 v
Protected Django API
```

The frontend uses an `AuthContext` to maintain authentication state globally.

Axios automatically attaches the access token to authenticated API requests.

When an API request returns `401 Unauthorized` because the access token has expired, the frontend uses the refresh token to request a new access token and retries the original request.

---

# Security & Data Isolation

The backend uses Django REST Framework's authentication and permission system.

The API uses:

```text
IsAuthenticated
```

as the default permission.

Every job application is associated with an authenticated user.

Conceptually:

```python
owner = models.ForeignKey(
    User,
    on_delete=models.CASCADE
)
```

Application queries are scoped to the authenticated user:

```python
Application.objects.filter(owner=request.user)
```

This prevents one user from accessing another user's job applications through the API.

---

# API

## Authentication Endpoints

### Register

```text
POST /api/register/
```

Creates a new user account.

### Login

```text
POST /api/token/
```

Returns:

- Access token
- Refresh token

### Refresh Token

```text
POST /api/token/refresh/
```

Generates a new access token using a valid refresh token.

---

## Job Application Endpoints

```text
GET    /api/applications/
POST   /api/applications/

GET    /api/applications/<id>/
PUT    /api/applications/<id>/
PATCH  /api/applications/<id>/
DELETE /api/applications/<id>/
```

All application endpoints require JWT authentication.

---

# Project Structure

```text
job-tracker/
│
├── backend/
│   │
│   ├── applications/
│   │   ├── migrations/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── admin.py
│   │
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── ...
│   │
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   │
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   │
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

# Running Locally

## Prerequisites

Make sure you have installed:

- Python 3.12+
- Node.js
- npm
- Git

---

## Backend Setup

Navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

### Windows

Activate the environment:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run database migrations:

```bash
python manage.py migrate
```

Check the Django project:

```bash
python manage.py check
```

Start the development server:

```bash
python manage.py runserver
```

The backend will be available at:

```text
http://127.0.0.1:8000
```

---

# Frontend Setup

Open another terminal and navigate to:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

# Environment Variables

## Backend

Create a `.env` file inside the `backend` directory.

Example:

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

For production, environment variables are configured through Render.

**Never commit real secrets to GitHub.**

---

## Frontend

Create a frontend environment file if required:

```env
VITE_API_URL=http://127.0.0.1:8000
```

The production deployment uses the deployed Render API.

---

# Production Deployment

## Frontend — Vercel

The React frontend is deployed using Vercel.

Production frontend:

```text
https://job-tracker-neon-eta.vercel.app
```

The frontend communicates with the deployed Django API through HTTPS.

---

## Backend — Render

The Django REST API is deployed using Render and served with Gunicorn.

Production backend:

```text
https://job-tracker-api-ctec.onrender.com
```

Production configuration includes:

- Environment-based `SECRET_KEY`
- Production `DEBUG=False`
- Configurable `ALLOWED_HOSTS`
- CORS configuration
- WhiteNoise static file handling
- Gunicorn
- PostgreSQL support
- Environment-based database configuration

---

## Database — PostgreSQL

The production application uses PostgreSQL hosted through Render.

SQLite remains available for local development.

```text
Local Development
        |
        v
     SQLite

Production
        |
        v
   PostgreSQL
      Render
```

---

# Deployment Architecture

```text
                    Internet
                       |
                       v
              Vercel React App
                       |
                       | HTTPS
                       |
                       v
             Render Django API
                       |
                       | Database Queries
                       v
              Render PostgreSQL
```

---

# Design Goals

JobTrack is designed to be:

- Simple
- Fast
- Practical
- Easy to use
- Professional
- Focused on the actual job-search workflow

The interface avoids unnecessary complexity and keeps the primary actions easy to access.

---

# Why JobTrack?

Students and early-career developers often apply to multiple internships and entry-level positions simultaneously.

Important information can become scattered across:

- Email
- Job boards
- Company websites
- Notes
- Spreadsheets

JobTrack provides a dedicated place to keep that information organized and track the progress of each application.

---

# Future Improvements

Potential future improvements include:

- Search and filtering
- Application analytics
- Interview reminders
- Resume attachment support
- Application notes
- Interview preparation tracking
- Additional application stages
- Calendar integration
- Email reminders
- Company contact information
- Application deadlines

---

# Author

**Akshya Anand**

GitHub:  
https://github.com/akshyaanand-tech
