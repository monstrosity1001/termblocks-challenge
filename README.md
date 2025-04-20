# Termblocks Custom Checklist Builder

This repository contains a full-stack solution for the Termblocks Full Stack Engineer case study: a Custom Checklist Builder application.

## Overview
- **Checklist Creation**: Build checklists with categories and items. Each item can accept file uploads.
- **Persistence & Editing**: All checklists are saved to a database and can be edited or cloned.
- **Sharing**: Share checklists via a public link. Third-party users can upload files to items but cannot edit structure.
- **File Uploads**: Supports `.txt`, `.pdf`, `.xlsx` files up to 10MB.
- **Tech Stack**: React + TypeScript (frontend), FastAPI + SQLite (backend), Docker-ready, GitHub version control.

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

### Backend (FastAPI)
```sh
cd termblocks-checklist-backend
pip install -r requirements.txt
uvicorn main:app --reload
```
- API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### Frontend (React + Vite)
```sh
cd termblocks-checklist-frontend
npm install
npm run dev
```
- App: [http://localhost:5173](http://localhost:5173) (default)

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