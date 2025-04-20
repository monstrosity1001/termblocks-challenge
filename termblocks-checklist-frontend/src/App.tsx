import React, { useState } from 'react';
import ChecklistList from './components/ChecklistList';
import ChecklistBuilder from './components/ChecklistBuilder';
import ChecklistPublicView from './components/ChecklistPublicView';

const App: React.FC = () => {
  const [view, setView] = useState<'list' | 'builder' | 'public'>('list');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <div style={{ color: 'red', fontSize: 24, margin: 8 }}>DEBUG: App is rendering</div>
      <header className="w-full bg-white shadow p-4 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-blue-700">Termblocks Checklist Builder</h1>
        <nav className="mt-2 flex gap-4">
          <button className={`px-3 py-1 rounded ${view === 'list' ? 'bg-blue-100' : ''}`} onClick={() => setView('list')}>All Checklists</button>
          <button className={`px-3 py-1 rounded ${view === 'builder' ? 'bg-blue-100' : ''}`} onClick={() => setView('builder')}>Checklist Builder</button>
          <button className={`px-3 py-1 rounded ${view === 'public' ? 'bg-blue-100' : ''}`} onClick={() => setView('public')}>Public View</button>
        </nav>
      </header>
      <main className="flex-1 w-full max-w-3xl">
        {view === 'list' && <ChecklistList />}
        {view === 'builder' && <ChecklistBuilder />}
        {view === 'public' && <ChecklistPublicView />}
      </main>
    </div>
  );

};

export default App;
