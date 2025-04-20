import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ChecklistList from './components/ChecklistList';
import ChecklistBuilder from './components/ChecklistBuilder';
import ChecklistPublicView from './components/ChecklistPublicView';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center">
        <header className="w-full bg-gradient-to-r from-blue-50 to-indigo-100 shadow p-4 flex flex-col gap-4">
          <div className="flex w-full items-center justify-between">
            <Link to="/builder" className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 font-semibold shadow-lg transition ml-2" title="Add a list">
              Add a list
            </Link>
            <Link to="/" className="text-6xl font-extrabold text-blue-700 tracking-tight text-center flex-1 hover:text-blue-900 focus:outline-none" style={{ textDecoration: 'none' }}>Termblocks Checklist Builder</Link>
            <Link className="px-3 py-2 rounded bg-green-100 hover:bg-green-200 transition flex items-center gap-1 mr-2" to="/public">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m0 0H5m4 0h6m4 0h-4" /></svg>
              View a list
            </Link>
          </div>
        </header>
        <div className="h-8" />
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
