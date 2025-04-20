import React, { useEffect, useState } from 'react';
import { useChecklistStore } from '../store/checklistStore';
import { useNavigate, useLocation } from 'react-router-dom';

interface Checklist {
  id: number;
  title: string;
  description: string;
  public_id: string;
  is_public: boolean;
  categories: any[];
}

const ChecklistList: React.FC = () => {
  const checklists = useChecklistStore((s) => s.checklists);
  const setChecklists = useChecklistStore((s) => s.setChecklists);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewChecklist, setViewChecklist] = useState<any | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // If navigated with viewChecklist in state, open modal
  useEffect(() => {
    if ((location.state as any)?.viewChecklist) {
      setViewChecklist((location.state as any).viewChecklist);
      // Clear state so modal doesn't reopen on back
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleEditChecklist = (cl: any) => {
    navigate('/builder', { state: { checklist: cl } });
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('http://localhost:8000/checklists')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch checklists');
        return res.json();
      })
      .then(setChecklists)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [setChecklists]);

  return (
    <div className="p-4 flex flex-col items-center min-h-[80vh]">
      <div className="w-full max-w-2xl">
        <hr className="my-6 border-gray-300" />
      </div>
      <h2 className="text-2xl font-bold mb-4 text-blue-800 tracking-tight">All Checklists</h2>
      <div className="max-w-2xl w-full mx-auto bg-white/80 rounded-xl shadow-lg p-4 md:p-8">
        {loading && <div className="text-gray-400">Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}
        <ul className="mt-2 space-y-4">
          {checklists.map((cl) => (
            <li key={cl.id} className="bg-white rounded-lg shadow-md px-4 py-3 flex flex-col gap-1 hover:shadow-lg transition border border-gray-100">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-lg text-gray-800">{cl.title}</span>
                {cl.is_public ? (
                  <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">Public</span>
                ) : (
                  <span className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded">Private</span>
                )}
              </div>
              <div className="text-sm text-gray-500 mb-1">{cl.description}</div>
              <div className="flex flex-wrap gap-2 mt-1">
                <button
                  className="px-3 py-1 bg-blue-50 text-blue-800 rounded hover:bg-blue-100 font-medium shadow-sm transition"
                  onClick={() => setViewChecklist(cl)}
                >
                  View
                </button>
                <button
                  className="px-3 py-1 bg-yellow-50 text-yellow-800 rounded hover:bg-yellow-100 font-medium shadow-sm transition"
                  onClick={() => handleEditChecklist(cl)}
                >
                  Edit
                </button>
                {/* Make Public button if not public */}
                {!cl.is_public && (
                  <button
                    className="px-3 py-1 bg-purple-50 text-purple-800 rounded hover:bg-purple-100 font-medium shadow-sm transition"
                    onClick={async () => {
                      try {
                        const res = await fetch(`http://localhost:8000/checklists/${cl.id}/make_public`, { method: 'POST' });
                        if (!res.ok) throw new Error('Failed to make public');
                        const data = await res.json();
                        navigator.clipboard.writeText(data.public_url);
                        setSnackbar('Checklist is now public! Public link copied to clipboard!');
                        setLoading(true);
                        fetch('http://localhost:8000/checklists')
                          .then((res) => res.json())
                          .then(setChecklists)
                          .finally(() => setLoading(false));
                      } catch (err: any) {
                        setSnackbar(err.message || 'Failed to make public');
                      }
                    }}
                  >
                    Make Public
                  </button>
                )}
                {/* Copy Public Link button if public */}
                {cl.is_public && (
                  <button
                    className="px-3 py-1 bg-green-50 text-green-800 rounded hover:bg-green-100 font-medium shadow-sm transition"
                    onClick={() => {
                      navigator.clipboard.writeText(cl.public_id);
                      setSnackbar('Public ID copied to clipboard!');
                    }}
                  >
                    Copy Public ID
                  </button>
                )}
                {/* Clone button */}
                <button
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 font-medium shadow-sm transition"
                  onClick={async () => {
                    try {
                      const res = await fetch(`http://localhost:8000/checklists/${cl.id}/clone`, { method: 'POST' });
                      if (!res.ok) throw new Error('Failed to clone checklist');
                      setLoading(true);
                      setError(null);
                      fetch('http://localhost:8000/checklists')
                        .then((res) => {
                          if (!res.ok) throw new Error('Failed to fetch checklists');
                          return res.json();
                        })
                        .then(setChecklists)
                        .catch((err) => setError(err.message))
                        .finally(() => setLoading(false));
                      setSnackbar('Checklist cloned!');
                    } catch (err: any) {
                      setSnackbar(err.message || 'Clone failed');
                    }
                  }}
                >
                  Clone
                </button>
                {/* Delete button */}
                <button
                  className="px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 font-medium shadow-sm transition ml-2"
                  onClick={async () => {
                    if (!window.confirm('Are you sure you want to delete this checklist? This action cannot be undone.')) return;
                    try {
                      setLoading(true);
                      setError(null);
                      const res = await fetch(`http://localhost:8000/checklists/${cl.id}`, { method: 'DELETE' });
                      if (!res.ok) throw new Error('Failed to delete checklist');
                      // Remove from local state
                      setChecklists(checklists.filter((c) => c.id !== cl.id));
                      setSnackbar('Checklist deleted!');
                    } catch (err: any) {
                      setSnackbar(err.message || 'Delete failed');
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {/* Snackbar for feedback */}
      {snackbar && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded shadow z-50 animate-fade-in">
          {snackbar}
          <button className="ml-2 text-white font-bold" onClick={() => setSnackbar(null)}>&times;</button>
        </div>
      )}
    </div>
  );
};

export default ChecklistList;
