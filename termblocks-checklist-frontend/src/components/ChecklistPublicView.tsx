import React from 'react';

import { useEffect, useState } from 'react';

interface ChecklistItem {
  id: number;
  name: string;
  uploads: Array<any>;
}
interface ChecklistCategory {
  id: number;
  name: string;
  items: ChecklistItem[];
}
interface Checklist {
  id: number;
  title: string;
  description: string;
  public_id: string;
  categories: ChecklistCategory[];
}

// Helper to get query param from URL
function getPublicId(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

const ChecklistPublicView: React.FC = () => {
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const publicId = getPublicId();
    if (!publicId) {
      setError('No public checklist ID provided.');
      setLoading(false);
      return;
    }
    fetch(`http://localhost:8000/checklists/public/${publicId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Checklist not found');
        return res.json();
      })
      .then((data) => {
        setChecklist(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-4 text-gray-500">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!checklist) return null;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-2">{checklist.title}</h2>
      <p className="mb-4 text-gray-700">{checklist.description}</p>
      {checklist.categories.map((cat) => (
        <div key={cat.id} className="mb-4">
          <h3 className="text-lg font-semibold">{cat.name}</h3>
          <ul className="list-disc ml-6">
            {cat.items.map((item) => (
              <li key={item.id} className="mb-1">{item.name}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default ChecklistPublicView;
