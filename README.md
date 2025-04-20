# Termblocks Custom Checklist Builder

A full-stack, user-authenticated checklist builder for the Termblocks Full Stack Engineer.

## Project Overview
- **User Authentication:** Users register/login with a username. All checklists are associated with their creator.
- **Checklist Management:** Create, edit, and clone checklists with nested categories and items.
- **File Uploads:** Attach `.txt`, `.pdf`, or `.xlsx` files (max 10MB) to checklist items.
- **Public Sharing:** Share checklists via unique public links. Public checklists are view-only for non-owners.
- **Modern UI/UX:** Responsive, clean React interface with modals, feedback, and stateful navigation.
- **Tech Stack:** React + TypeScript (frontend), Zustand for state, FastAPI + SQLAlchemy + SQLite (backend).

---

## Project Structure

```
Termblocks_challenge/
│
├── termblocks-checklist-backend/   # FastAPI backend
│   ├── main.py
│   ├── requirements.txt
│   └── README.md
│
├── termblocks-checklist-frontend/  # React + TS frontend
│   ├── src/
│   ├── package.json
│   └── README.md
│
├── .gitignore
├── README.md   # (this file)
└── test_backend.http  # Example API calls
```

---

## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- (Optional) Docker

---

### Backend (FastAPI)
```sh
cd termblocks-checklist-backend
pip install -r requirements.txt
# If running for the first time or after DB schema changes, remove the old DB to apply new columns:
rm checklists.db
uvicorn main:app --reload
```
- API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### Frontend (React + Vite)
```sh
cd termblocks-checklist-frontend
npm install
npm run dev
```
- App: [http://localhost:8080](http://localhost:8080) (default)

---

### User Flow
1. **Register/Login:** Enter a username to register or log in.
2. **Create Checklists:** Add categories and items. Upload files to items if needed.
3. **View/Edit:** Only your checklists are visible after login. Edit or clone as needed.
4. **Share:** Make a checklist public to get a shareable link. Visitors can view and upload files (if permitted).
5. **Logout:** Click 'Logout' in the header to end your session.

---

### Backend (FastAPI)
```sh
cd termblocks-checklist-backend
pip install -r requirements.txt
# If running for the first time or after DB schema changes:
# Remove the old DB to apply new columns (dev only):
rm checklists.db
uvicorn main:app --reload
```
- API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### Frontend (React + Vite)
```sh
cd termblocks-checklist-frontend
npm install
npm run dev
```
- App: [http://localhost:8080](http://localhost:8080) (default)

---

## Features
- User registration/login with username; all checklists are user-specific.
- Create, edit, clone checklists (with nested categories/items).
- Upload files to items (.txt, .pdf, .xlsx, max 10MB).
- Remove uploaded files.
- Share via unique public link (only if checklist is made public).
- Public view: see checklist and download files (no structure editing).
- Privacy: files and checklist only accessible via public link if made public.
- Modern UI/UX with badges, snackbars, and feedback.

---

## Privacy Model
- **Private by default:** All checklists are private until you click "Make Public".
- **Public link:** Only public checklists (and their files) are accessible via their unique link.
- **File access:** Files are only downloadable if the parent checklist is public.
- **Unlisted:** Public links are unguessable (UUID).

---

## File Upload Restrictions
- Allowed types: `.txt`, `.pdf`, `.xlsx`
- Max size: 10MB per file
- Files are stored server-side and only served if checklist is public

---

## API
- Backend: FastAPI, docs at [http://localhost:8000/docs](http://localhost:8000/docs)
- Example requests in `test_backend.http`

---

## Testing

### Frontend
- Run tests with:
  ```sh
  cd termblocks-checklist-frontend
  npm test
  ```
- (Add more tests in `src/components/__tests__` and `src/store/__tests__`)

### Backend
- Use `pytest` for backend tests (see backend README for details).

---

## Troubleshooting
- **DB schema errors after pulling code?**
  - Delete `checklists.db` and restart backend to apply new columns (dev only).
- **Frontend/backend connection issues?**
  - Ensure both servers are running and CORS is enabled in FastAPI.
- **File not downloading?**

---

## Next Steps & Improvements
- Add password/email authentication for better security.
- Enable checklist collaboration and real-time updates.
- Improve mobile responsiveness and accessibility.
- Add more automated tests for frontend and backend.
- Deploy with Docker, Vercel, or your preferred platform.

---

## License
UC Berkeley

---

## Deployment
- Frontend: Deploy with Vercel, Netlify, or similar.
- Backend: Deploy with Fly.io, Render, or Docker.
- Set environment variables for production as needed.

---

## Testing

### Backend (FastAPI)
1. **Install dependencies:**
   ```bash
   pip install pytest httpx
   ```
2. **Add tests:** Place test files in `termblocks-checklist-backend/tests/` (e.g. `test_checklists.py`).
3. **Run tests:**
   ```bash
   cd termblocks-checklist-backend
   pytest
   ```

### Frontend (React)
1. **Install dependencies:**
   ```bash
   cd termblocks-checklist-frontend
   npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event
   ```
2. **Add tests:** Place test files in `termblocks-checklist-frontend/src/__tests__/` (e.g. `ChecklistList.test.tsx`).
3. **Run tests:**
   ```bash
   npm test
   # or, if using Vite:
   npx vitest
   ```

---

## API Example
See `test_backend.http` for sample API requests (can be used in VSCode REST Client or Insomnia).

---

## Repository
- Remote: [github.com/monstrosity1001/termblocks-challenge](https://github.com/monstrosity1001/termblocks-challenge)

---

## Features
- Create, edit, clone checklists (with nested categories/items)
- Upload files to items (type/size restricted)
- Share via unique public link
- Public upload interface (no structure editing)
- Ready for containerization and deployment

---

## Case Study: Termblocks
This project was built for the Termblocks Full Stack Engineer case study. For a technical walkthrough, see the backend and frontend READMEs, or contact the author.

- Max size: 10MB
- Files stored under `/uploads`
