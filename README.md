# JobTrack

A private job application tracker for students and job seekers. Track applications, monitor status, and stay organized throughout your job search.

## Features

- JWT authentication with automatic token refresh
- Full CRUD for job applications
- Search by company or role
- Filter by status (Applied, Interviewing, Rejected)
- Dashboard statistics from your real data
- Per-user data isolation — users only see their own applications
- Responsive design with desktop table and mobile card layouts

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Backend | Python, Django, Django REST Framework, Simple JWT |
| Frontend | React, Vite, Axios, React Router, Lucide React |
| Database | SQLite (development) |

## Architecture

```
JobTrack/
├── backend/          # Django REST API
│   ├── config/       # Project settings & URLs
│   └── applications/ # Application model, views, tests
└── frontend/         # React SPA (Vite)
    └── src/
        ├── api/          # Axios instance + interceptors
        ├── context/      # AuthContext
        ├── components/   # Reusable UI components
        └── pages/        # Login, Dashboard, Layout
```

## Authentication

- **Login:** `POST /api/token/` — returns access + refresh tokens
- **Refresh:** `POST /api/token/refresh/` — returns new access token
- Access token lifetime: 1 hour
- Refresh token lifetime: 1 day

The frontend stores tokens in `localStorage` and attaches `Authorization: Bearer <token>` to all API requests. On 401 responses, it automatically refreshes the access token and retries.

## Security & Data Isolation

- DRF globally requires authentication (`IsAuthenticated`)
- Every application is scoped to its owner via `ForeignKey(User)`
- Owner is always set server-side (`owner=request.user`) — never from client input
- ViewSets filter querysets: `Application.objects.filter(owner=request.user)`
- Cross-user access (IDOR) returns 404
- Django tests cover authentication and ownership isolation

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register/` | Create a new user account |
| POST | `/api/token/` | Obtain JWT tokens |
| POST | `/api/token/refresh/` | Refresh access token |
| GET | `/api/applications/` | List applications (supports `?search=` and `?status=`) |
| POST | `/api/applications/` | Create application |
| GET | `/api/applications/<id>/` | Retrieve application |
| PUT/PATCH | `/api/applications/<id>/` | Update application |
| DELETE | `/api/applications/<id>/` | Delete application |
| GET | `/api/applications/stats/` | Dashboard statistics |

## Local Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173), create an account at `/register`, then sign in.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | `your-secret-key` |
| `DEBUG` | Debug mode | `True` |
| `ALLOWED_HOSTS` | Comma-separated hosts | `localhost,127.0.0.1,.onrender.com` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated frontend URLs | `http://localhost:5173,https://your-app.vercel.app` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:8000` |

## Deployment

### Backend (Render)

1. Create a new **Web Service** pointing to the `backend/` directory
2. Build command: `./build.sh`
3. Start command: `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`
4. Set environment variables from `.env.example`
5. Add your Vercel frontend URL to `CORS_ALLOWED_ORIGINS`
6. Add your Render domain to `ALLOWED_HOSTS`

### Frontend (Vercel)

1. Import the repo and set the root directory to `frontend/`
2. Set `VITE_API_URL` to your Render backend URL
3. Deploy — `vercel.json` handles SPA routing

## Running Tests

```bash
cd backend
python manage.py test
```

## License

MIT
