# Termblocks Checklist Builder Frontend

This is the frontend for the Termblocks Custom Checklist Builder, built with React, TypeScript, Zustand, and TailwindCSS.

## Features
- Create, edit, and clone checklists (with categories and items)
- Upload files to checklist items (.txt, .pdf, .xlsx, <10MB)
- Share checklists via public link
- Public upload interface for shared checklists

## Getting Started

### Prerequisites
- Node.js 18+

### Local Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
3. App will be available at `http://localhost:5173` (default Vite port)

## Tech Stack
- React + TypeScript
- Zustand (state management)
- TailwindCSS (styling)
- Vite (build tool)

## API
- Connects to the backend at `http://localhost:8000`

## License
MIT
