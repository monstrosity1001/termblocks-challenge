import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Checklist } from '../types';

import ChecklistCard from './ChecklistCard';
import Snackbar from './Snackbar';

interface ChecklistViewSectionProps {
  checklist: Checklist;
  onClose: () => void;
  onDelete: (checklist: Checklist) => void;
}

const ChecklistViewSection: React.FC<ChecklistViewSectionProps> = ({ checklist, onClose, onDelete }) => {
  const [completed, setCompleted] = React.useState<{ [key: string]: boolean }>({});
  const [uploadedFiles, setUploadedFiles] = React.useState<{ [key: string]: File | null }>({});

  // Reset state on checklist change
  React.useEffect(() => {
    setCompleted({});
    setUploadedFiles({});
  }, [checklist.id]);

  return (
    <section className="w-full flex justify-center mt-8">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
          onClick={onClose}
        >
          &times;
        </button>
        <h3 className="text-xl font-bold mb-2">{checklist.title}</h3>
        <div className="mb-4 text-gray-600">{checklist.description}</div>
        {checklist.categories.length === 0 ? (
          <div className="text-center text-gray-500">No categories. This checklist will be deleted.</div>
        ) : (
          checklist.categories.map((cat, catIdx) => (
            <div key={catIdx} className="mb-4">
              <div className="font-semibold mb-2">{cat.name}</div>
              <ul className="space-y-2">
                {cat.items.map((item, itemIdx) => {
                  const key = `${catIdx}-${itemIdx}`;
                  return (
                    <li key={itemIdx} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="accent-blue-600"
                        checked={!!completed[key]}
                        onChange={() => setCompleted((prev) => ({ ...prev, [key]: !prev[key] }))}
                      />
                      <span className={completed[key] ? "line-through text-gray-400" : ""}>{item.name}</span>
                      <input
                        type="file"
                        className="ml-2"
                        onChange={e => {
                          const file = e.target.files && e.target.files[0];
                          setUploadedFiles((prev) => ({ ...prev, [key]: file || null }));
                        }}
                      />
                      {uploadedFiles[key] && (
                        <span className="text-xs text-green-700 ml-1">{uploadedFiles[key]?.name}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
        <button className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 font-medium shadow-sm transition" onClick={() => onDelete(checklist)}>Delete Checklist</button>
      </div>
    </section>
  );
};

const ChecklistList = () => {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewChecklist, setViewChecklist] = useState<Checklist | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if ((location.state as any)?.viewChecklist) {
      setViewChecklist((location.state as any).viewChecklist);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

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
  }, []);

  const handleEditChecklist = (checklist: Checklist) => {
    navigate('/builder', { state: { checklist } });
  };

  const handleMakePublic = async (checklist: Checklist) => {
    try {
      const res = await fetch(`http://localhost:8000/checklists/${checklist.id}/make_public`, { method: 'POST' });
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
  };

  const handleCopyPublicLink = (checklist: Checklist) => {
    navigator.clipboard.writeText(checklist.public_id);
    setSnackbar('Public ID copied to clipboard!');
  };

  const handleCloneChecklist = async (checklist: Checklist) => {
    try {
      const res = await fetch(`http://localhost:8000/checklists/${checklist.id}/clone`, { method: 'POST' });
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
  };

  const handleDeleteChecklist = async (checklist: Checklist) => {
    if (!window.confirm('Are you sure you want to delete this checklist? This action cannot be undone.')) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`http://localhost:8000/checklists/${checklist.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete checklist');
      setChecklists(checklists.filter((c) => c.id !== checklist.id));
      setSnackbar('Checklist deleted!');
    } catch (err: any) {
      setSnackbar(err.message || 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

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
          {checklists.map((checklist) => (
            <li key={checklist.id}>
              <ChecklistCard
                checklist={checklist}
                onView={setViewChecklist}
                onEdit={handleEditChecklist}
                onMakePublic={handleMakePublic}
                onCopyPublicLink={handleCopyPublicLink}
                onClone={handleCloneChecklist}
                onDelete={handleDeleteChecklist}
              />
            </li>
          ))}
        </ul>
      </div>
      {viewChecklist && (
        <ChecklistViewSection
          checklist={viewChecklist}
          onClose={() => setViewChecklist(null)}
          onDelete={handleDeleteChecklist}
        />
      )}
      {snackbar && (
        <Snackbar
          message={snackbar}
          onClose={() => setSnackbar(null)}
        />
      )}
    </div>
  );
};

export default ChecklistList;
