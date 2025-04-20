import React from 'react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

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

const ChecklistPublicView: React.FC = () => {
  const [publicId, setPublicId] = useState('');
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChecklist = async (id: string) => {
    setLoading(true);
    setError(null);
    setChecklist(null);
    try {
      const res = await fetch(`http://localhost:8000/public/${id}`);
      if (!res.ok) throw new Error('Checklist not found');
      const data = await res.json();
      setChecklist(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <Link
        to="/"
        className="inline-block mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold shadow"
      >
        Return to Home
      </Link>
      <h2 className="text-xl font-semibold mb-4">Public Checklist View</h2>
      <form
        className="flex gap-2 mb-6"
        onSubmit={e => {
          e.preventDefault();
          if (publicId.trim()) fetchChecklist(publicId.trim());
        }}
      >
        <input
          className="border rounded px-2 py-1 flex-1"
          value={publicId}
          onChange={e => setPublicId(e.target.value)}
          placeholder="Paste public ID here"
        />
        <button
          type="submit"
          className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Load
        </button>
      </form>
      {loading && <div className="text-gray-500">Loading...</div>}
      {error && <div className="text-red-500">Error: {error}</div>}
      {checklist && (
        <div>
          <h2 className="text-2xl font-bold mb-2">{checklist.title}</h2>
          <p className="mb-4 text-gray-700">{checklist.description}</p>
          {checklist.categories.map((cat) => (
            <div key={cat.id} className="mb-4">
              <h3 className="text-lg font-semibold">{cat.name}</h3>
              <ul className="list-disc ml-6">
                {cat.items.map((item) => (
                  <li key={item.id} className="mb-1">
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
      )}
    </div>
  );
};

export default ChecklistPublicView;
