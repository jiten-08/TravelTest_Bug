TravelTest Backend
===================

This is a Django + Django REST Framework backend for the TravelTest frontend.

Quick start (assuming Python 3.10+ and a virtualenv):

```bash
python -m venv .venv
source .venv/bin/activate  # or .venv\\Scripts\\activate on Windows
pip install -r requirements.txt
cd backend
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

API summary:
- `POST /api/token/` - obtain JWT token
- `POST /api/token/refresh/` - refresh token
- `GET /api/hotels/`, `GET /api/flights/`, `GET /api/bookings/` etc.

See `backend/` for project files.
