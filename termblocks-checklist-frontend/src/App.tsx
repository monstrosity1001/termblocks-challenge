import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ChecklistList from './components/ChecklistList';
import ChecklistBuilder from './components/ChecklistBuilder';
import ChecklistPublicView from './components/ChecklistPublicView';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center">
        <header className="w-full bg-white shadow p-4 flex flex-col items-center">
          <h1 className="text-3xl font-bold text-blue-700">Termblocks Checklist Builder</h1>
          <nav className="mt-2 flex gap-4">
            <Link className="px-3 py-1 rounded bg-blue-100" to="/">All Checklists</Link>
            <Link className="px-3 py-1 rounded bg-blue-100" to="/builder">Checklist Builder</Link>
            <Link className="px-3 py-1 rounded bg-blue-100" to="/public">Public View</Link>
          </nav>
        </header>
        <main className="flex-1 w-full max-w-3xl">
          <Routes>
            <Route path="/" element={<ChecklistList />} />
            <Route path="/builder" element={<ChecklistBuilder />} />
            <Route path="/public" element={<ChecklistPublicView />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
