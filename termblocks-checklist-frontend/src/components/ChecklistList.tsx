import React, { useEffect, useState } from 'react';
import { useChecklistStore } from '../store/checklistStore';
import { useNavigate } from 'react-router-dom';

const ChecklistList: React.FC = () => {
  const checklists = useChecklistStore((s) => s.checklists);
  const setChecklists = useChecklistStore((s) => s.setChecklists);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewChecklist, setViewChecklist] = useState<any | null>(null);
  const navigate = useNavigate();

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
            <div className="font-semibold">{cl.title}</div>
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
              <button
                className="px-2 py-1 bg-purple-100 text-purple-800 rounded hover:bg-purple-200"
                onClick={async () => {
                  // Make Public: call backend to mark as public (simulate for now)
                  const res = await fetch(`http://localhost:8000/checklists/${cl.id}/make_public`, { method: 'POST' });
                  if (res.ok) {
                    const data = await res.json();
                    navigator.clipboard.writeText(data.public_url);
                    alert('Checklist is now public! Public link copied to clipboard!');
                  } else {
                    alert('Failed to make public');
                  }
                }}
              >
                Make Public
              </button>
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
      {viewChecklist && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full relative">
            <button className="absolute top-2 right-2 text-gray-500" onClick={() => setViewChecklist(null)}>&times;</button>
            <h3 className="text-xl font-bold mb-2">{viewChecklist.title}</h3>
            <p className="mb-2 text-gray-700">{viewChecklist.description}</p>
            {viewChecklist.categories.map((cat: any) => (
              <div key={cat.id} className="mb-3">
                <div className="font-semibold">{cat.name}</div>
                <ul className="list-disc ml-6">
                  {cat.items.map((item: any) => (
                    <li key={item.id}>{item.name}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChecklistList;
