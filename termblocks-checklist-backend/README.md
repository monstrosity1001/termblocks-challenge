# Termblocks Checklist Builder Backend

This is the backend for the Termblocks Custom Checklist Builder, built with FastAPI and SQLite (easily swappable for PostgreSQL). It supports checklist creation, editing, cloning, file uploads, and public sharing.

## Features
- Create, edit, clone checklists (with categories and items)
- Upload files to checklist items (.txt, .pdf, .xlsx, <10MB)
- Public sharing via unique link
- File serving for uploaded files
- CORS enabled for frontend integration

## Getting Started

### Prerequisites
- Python 3.9+
- (Optional) Docker

### Local Development
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Run the server:
   ```bash
   uvicorn main:app --reload
   ```
3. API will be available at `http://localhost:8000`

### Docker
_Coming soon_

## Database
- Default: SQLite (`checklists.db`)
- To use PostgreSQL, update `DATABASE_URL` in `main.py`.

## API Endpoints
- `GET /` - Health check
- _Checklist, category, item, upload, and sharing endpoints will be documented as implemented._

## File Uploads
- Allowed types: `.txt`, `.pdf`, `.xlsx`
- Max size: 10MB
- Files stored under `/uploads`

## License
MIT
