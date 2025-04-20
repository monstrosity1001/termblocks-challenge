import React, { useEffect, useState } from 'react';
import { useChecklistStore } from '../store/checklistStore';

const ChecklistList: React.FC = () => {
  const checklists = useChecklistStore((s) => s.checklists);
  const setChecklists = useChecklistStore((s) => s.setChecklists);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
            <div className="font-semibold">{cl.title}</div>
            <div className="text-sm text-gray-500">{cl.description}</div>
            <div className="mt-2 flex gap-2">
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
              <button
                className="px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
                onClick={() => {
                  navigator.clipboard.writeText(cl.public_id);
                  alert('Public ID copied to clipboard!');
                }}
              >
                Copy Public ID
              </button>
            </div>
          </li>
        ))}
      </ul>
      {!loading && !error && checklists.length === 0 && (
        <div className="text-gray-500">No checklists found.</div>
      )}
    </div>
  );
};

export default ChecklistList;
