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
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">All Checklists</h2>
      {loading && <div className="text-gray-400">Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <ul className="mt-2 space-y-2">
        {checklists.map((cl) => (
          <li key={cl.id} className="bg-white shadow rounded px-4 py-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{cl.title}</span>
              {cl.is_public ? (
                <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">Public</span>
              ) : (
                <span className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded">Private</span>
              )}
            </div>
            <div className="text-sm text-gray-500">{cl.description}</div>
            <div className="mt-2 flex gap-2">
              <button
                className="px-2 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                onClick={() => setViewChecklist(cl)}
              >
                View
              </button>
              <button
                className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                onClick={() => handleEditChecklist(cl)}
              >
                Edit
              </button>
              {!cl.is_public && (
                <button
                  className="px-2 py-1 bg-purple-100 text-purple-800 rounded hover:bg-purple-200"
                  onClick={async () => {
                    try {
                      const res = await fetch(`http://localhost:8000/checklists/${cl.id}/make_public`, { method: 'POST' });
                      if (!res.ok) throw new Error('Failed to make public');
                      const data = await res.json();
                      navigator.clipboard.writeText(data.public_url);
                      setSnackbar('Checklist is now public! Public link copied to clipboard!');
                      // Refresh list to update is_public
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
              <button
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                onClick={async () => {
                  try {
                    const res = await fetch(`http://localhost:8000/checklists/${cl.id}/clone`, { method: 'POST' });
                    if (!res.ok) throw new Error('Failed to clone checklist');
                    // Refresh list
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
                    alert('Checklist cloned!');
                  } catch (err: any) {
                    alert(err.message || 'Clone failed');
                  }
                }}
              >
                Clone
              </button>
              {cl.is_public && (
                <button
                  className="px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
                  onClick={() => {
                    const url = `${window.location.origin.replace('5173', '8080')}/public/${cl.public_id}`;
                    navigator.clipboard.writeText(url);
                    setSnackbar('Public link copied to clipboard!');
                  }}
                >
                  Copy Public Link
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      {!loading && !error && checklists.length === 0 && (
        <div className="text-gray-500">No checklists found.</div>
      )}
      {viewChecklist && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full relative">
            <button className="absolute top-2 right-2 text-gray-500" onClick={() => setViewChecklist(null)}>&times;</button>
            <h3 className="text-xl font-bold mb-2">{viewChecklist.title}</h3>
            <div className="mb-2 flex items-center gap-2">
              {viewChecklist.is_public ? (
                <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">Public</span>
              ) : (
                <span className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded">Private</span>
              )}
              {viewChecklist.is_public && (
                <button
                  className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 rounded hover:bg-green-200 text-xs"
                  onClick={() => {
                    const url = `${window.location.origin.replace('5173', '8080')}/public/${viewChecklist.public_id}`;
                    navigator.clipboard.writeText(url);
                    setSnackbar('Public link copied to clipboard!');
                  }}
                >
                  Copy Public Link
                </button>
              )}
            </div>
            <p className="mb-2 text-gray-700">{viewChecklist.description}</p>
            {!viewChecklist.is_public && (
              <div className="mb-2 text-sm text-gray-500">This checklist is private. Make it public to share a link.</div>
            )}
            {viewChecklist.categories.map((cat: any) => (
              <div key={cat.id} className="mb-3">
                <div className="font-semibold">{cat.name}</div>
                <ul className="list-disc ml-6">
                  {cat.items.map((item: any) => (
                    <li key={item.id}>
                      {item.name}
                      {item.uploads && item.uploads.length > 0 && (
                        <div className="ml-2 text-xs text-gray-600">
                          Uploaded: {item.uploads.map((f: any, i: number) => (
                            <a
                              key={f.id}
                              href={`http://localhost:8000/public_uploads/${f.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline mr-2"
                            >
                              {f.filename}
                            </a>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
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
