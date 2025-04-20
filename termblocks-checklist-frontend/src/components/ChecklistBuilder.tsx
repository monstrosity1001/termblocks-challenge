import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

interface ItemInput {
  name: string;
  uploads?: UploadedFile[];
}

interface UploadedFile {
  id: number;
  filename: string;
  path: string;
} 
interface CategoryInput {
  name: string;
  items: ItemInput[];
}

const ChecklistBuilder: React.FC = () => {
  const user = useUserStore((state) => state.user);
  // Track file inputs by [catIdx][itemIdx]
  const [itemFiles, setItemFiles] = useState<{ [key: string]: File | null }>({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ title?: string; categories?: string[] }>({});
  const [submitting, setSubmitting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const checklist = (location.state as any)?.checklist;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<CategoryInput[]>([]);

  useEffect(() => {
    if (checklist) {
      setTitle(checklist.title || '');
      setDescription(checklist.description || '');
      setCategories(
        checklist.categories?.map((cat: any) => ({
          name: cat.name,
          items: cat.items.map((item: any) => ({
            name: item.name,
            uploads: item.uploads || []
          }))
        })) || []
      );
    }
  }, [checklist]);

  useEffect(() => {
    if (snackbar) {
      const t = setTimeout(() => setSnackbar(null), 2500);
      return () => clearTimeout(t);
    }
  }, [snackbar]);

  const addCategory = () => setCategories([...categories, { name: '', items: [] }]);
  const removeCategory = (idx: number) => setCategories(categories.filter((_, i) => i !== idx));
  const updateCategoryName = (idx: number, name: string) => setCategories(categories.map((cat, i) => i === idx ? { ...cat, name } : cat));

  const addItem = (catIdx: number) => setCategories(categories.map((cat, i) => i === catIdx ? { ...cat, items: [...cat.items, { name: '' }] } : cat));
  const removeItem = (catIdx: number, itemIdx: number) => setCategories(categories.map((cat, i) => i === catIdx ? { ...cat, items: cat.items.filter((_, j) => j !== itemIdx) } : cat));
  const updateItemName = (catIdx: number, itemIdx: number, name: string) => setCategories(categories.map((cat, i) => i === catIdx ? { ...cat, items: cat.items.map((item, j) => j === itemIdx ? { ...item, name } : item) } : cat));

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">{checklist ? 'Edit Checklist' : 'Create Checklist'}</h2>
      <form className="space-y-4" onSubmit={async e => {
        e.preventDefault();
        // Validation
        let valid = true;
        const newErrors: { title?: string; categories?: string[] } = {};
        if (!title.trim()) {
          newErrors.title = 'Title is required';
          valid = false;
        }
        const catErrors: string[] = [];
        categories.forEach((cat, i) => {
          if (!cat.name.trim()) {
            catErrors[i] = 'Category name required';
            valid = false;
          } else if (cat.items.some(item => !item.name.trim())) {
            catErrors[i] = 'All item names required';
            valid = false;
          } else {
            catErrors[i] = '';
          }
        });
        if (catErrors.some(Boolean)) newErrors.categories = catErrors;
        setErrors(newErrors);
        if (!valid) return;
        setSubmitting(true);
        setUploading(false);
        const payload = {
          title,
          description,
          categories: categories.map(cat => ({
            name: cat.name,
            items: cat.items.map(item => ({ name: item.name }))
          })),
          owner_id: user ? Number(user.id) : undefined // Ensure checklist is associated with the logged-in user
        };
        try {
          let url = 'http://localhost:8000/checklists';
          let method = 'POST';
          let successMsg = 'Checklist created successfully!';
          if (checklist?.id) {
            url = `http://localhost:8000/checklists/${checklist.id}`;
            method = 'PUT';
            successMsg = 'Checklist updated successfully!';
          }
          const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (!res.ok) throw new Error(`Failed to ${method === 'POST' ? 'create' : 'update'} checklist`);
          const checklistData = await res.json();

          // Upload files for items with a file selected (with progress)
          setUploading(true);
          const uploadProgress: { [key: string]: number } = {};
          const uploadPromises: Promise<any>[] = [];
          checklistData.categories.forEach((cat: any, catIdx: number) => {
            cat.items.forEach((item: any, itemIdx: number) => {
              const file = itemFiles[`${catIdx}-${itemIdx}`];
              if (file) {
                uploadProgress[`${catIdx}-${itemIdx}`] = 0;
                const formData = new FormData();
                formData.append('file', file);
                // Use XMLHttpRequest for progress
                uploadPromises.push(new Promise((resolve, reject) => {
                  const xhr = new XMLHttpRequest();
                  xhr.open('POST', `http://localhost:8000/items/${item.id}/upload`);
                  xhr.onload = () => resolve(xhr.response);
                  xhr.onerror = () => reject(xhr.statusText);
                  xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                      uploadProgress[`${catIdx}-${itemIdx}`] = Math.round((e.loaded / e.total) * 100);
                      setUploadProgress({ ...uploadProgress });
                    }
                  };
                  xhr.send(formData);
                }));
              }
            });
          });
          if (uploadPromises.length > 0) {
            await Promise.all(uploadPromises);
          }
          setUploading(false);
          setUploadProgress({});
          // Refetch checklist to get uploaded files
          const checklistResp = await fetch(`http://localhost:8000/checklists/${checklistData.id}`);
          const checklistWithUploads = await checklistResp.json();
          navigate('/', { state: { viewChecklist: checklistWithUploads } });
          setSnackbar(successMsg);
        } catch (err: any) {
          setSnackbar(err.message || 'Error submitting checklist');
        } finally {
          setSubmitting(false);
          setUploading(false);
        }
      }}> 

        <div>
          <label className="block font-medium">Title</label>
          <input className="border rounded px-2 py-1 w-full" value={title} onChange={e => setTitle(e.target.value)} placeholder="Checklist title" />
          {errors.title && <div className="text-red-500 text-sm mt-1">{errors.title}</div>}
        </div>
        <div>
          <label className="block font-medium">Description</label>
          <textarea className="border rounded px-2 py-1 w-full" value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" />
        </div>
        <div>
          <label className="block font-medium mb-1">Categories</label>
          {categories.map((cat, catIdx) => (
            <div key={catIdx} className="border rounded p-3 mb-2 bg-gray-50">
              <div className="flex items-center mb-2">
                <input
                  className="border rounded px-2 py-1 flex-1"
                  value={cat.name}
                  onChange={e => updateCategoryName(catIdx, e.target.value)}
                  placeholder="Category name"
                />
                <button type="button" className="ml-2 text-red-500" onClick={() => removeCategory(catIdx)}>
                  Remove
                </button>
              </div>
              {errors.categories && errors.categories[catIdx] && <div className="text-red-500 text-sm mb-1">{errors.categories[catIdx]}</div>}
              <div className="ml-4">
                <label className="block font-medium mb-1">Items</label>
                {cat.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex flex-col sm:flex-row items-start sm:items-center mb-1 gap-2">
                    <input
                      className="border rounded px-2 py-1 flex-1"
                      value={item.name}
                      onChange={e => updateItemName(catIdx, itemIdx, e.target.value)}
                      placeholder="Item name"
                    />
                    <input
                      type="file"
                      accept=".txt,.pdf,.xlsx"
                      className="ml-2"
                      onChange={e => {
                        const file = e.target.files?.[0] || null;
                        setItemFiles(prev => ({ ...prev, [`${catIdx}-${itemIdx}`]: file }));
                      }}
                    />
                    <button type="button" className="text-red-500" onClick={() => removeItem(catIdx, itemIdx)}>
                      Remove
                    </button>
                    {/* Show uploaded files if editing */}
                    {item.uploads && item.uploads.length > 0 && (
                      <div className="ml-2 text-xs text-gray-600 flex flex-wrap items-center gap-2">
                        Uploaded: {item.uploads.map((f, i) => (
                          <span key={f.id} className="flex items-center gap-1">
                            <a
                              href={`http://localhost:8000/public_uploads/${f.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline"
                            >
                              {f.filename}
                            </a>
                            <button
                              type="button"
                              className="text-red-400 hover:text-red-700 ml-1"
                              title="Remove file"
                              onClick={async () => {
                                if (!window.confirm('Remove this file?')) return;
                                await fetch(`http://localhost:8000/uploads/${f.id}`, { method: 'DELETE' });
                                // Refetch checklist to update uploads
                                if (checklist?.id) {
                                  const resp = await fetch(`http://localhost:8000/checklists/${checklist.id}`);
                                  const updated = await resp.json();
                                  setCategories(
                                    updated.categories.map((cat: any) => ({
                                      name: cat.name,
                                      items: cat.items.map((item: any) => ({
                                        name: item.name,
                                        uploads: item.uploads || []
                                      }))
                                    }))
                                  );
                                }
                              }}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )} 
                  </div>
                ))}
                <button type="button" className="mt-1 text-blue-600" onClick={() => addItem(catIdx)}>
                  + Add Item
                </button>
              </div>
            </div>
          ))} 
          <button type="button" className="mt-2 text-blue-700 font-semibold" onClick={addCategory}>
            + Add Category
          </button>
        </div>
        <div className="flex gap-2 mt-6">
          <button
            type="submit"
            className="flex-1 py-3 bg-blue-600 text-white text-lg font-bold rounded shadow hover:bg-blue-700 transition disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? (
              <span className="flex items-center justify-center"><svg className="animate-spin h-5 w-5 mr-2 inline-block" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Saving...</span>
            ) : checklist ? 'Update Checklist' : 'Create Checklist'}
          </button>
          <button
            type="button"
            className="flex-1 py-3 bg-gray-300 text-gray-800 text-lg font-bold rounded shadow hover:bg-gray-400 transition"
            onClick={() => navigate('/')}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </form>
      {snackbar && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded shadow-lg z-50 animate-fadein">
          {snackbar}
        </div>
      )}
    </div>
  );
};

export default ChecklistBuilder;
