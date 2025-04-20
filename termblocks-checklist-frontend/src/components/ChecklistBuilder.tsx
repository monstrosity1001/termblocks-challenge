import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface ItemInput {
  name: string;
}
interface CategoryInput {
  name: string;
  items: ItemInput[];
}

const ChecklistBuilder: React.FC = () => {
  const location = useLocation();
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
          items: cat.items.map((item: any) => ({ name: item.name }))
        })) || []
      );
    }
  }, [checklist]);

  const addCategory = () => setCategories([...categories, { name: '', items: [] }]);
  const removeCategory = (idx: number) => setCategories(categories.filter((_, i) => i !== idx));
  const updateCategoryName = (idx: number, name: string) => setCategories(categories.map((cat, i) => i === idx ? { ...cat, name } : cat));

  const addItem = (catIdx: number) => setCategories(categories.map((cat, i) => i === catIdx ? { ...cat, items: [...cat.items, { name: '' }] } : cat));
  const removeItem = (catIdx: number, itemIdx: number) => setCategories(categories.map((cat, i) => i === catIdx ? { ...cat, items: cat.items.filter((_, j) => j !== itemIdx) } : cat));
  const updateItemName = (catIdx: number, itemIdx: number, name: string) => setCategories(categories.map((cat, i) => i === catIdx ? { ...cat, items: cat.items.map((item, j) => j === itemIdx ? { ...item, name } : item) } : cat));

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">Checklist Builder</h2>
      <form className="space-y-4" onSubmit={async e => {
        e.preventDefault();
        const payload = {
          title,
          description,
          categories: categories.map(cat => ({
            name: cat.name,
            items: cat.items.map(item => ({ name: item.name }))
          }))
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
          if (method === 'POST') {
            setTitle('');
            setDescription('');
            setCategories([]);
          }
          alert(successMsg);
        } catch (err: any) {
          alert(err.message || 'Error submitting checklist');
        }
      }}>

        <div>
          <label className="block font-medium">Title</label>
          <input className="border rounded px-2 py-1 w-full" value={title} onChange={e => setTitle(e.target.value)} placeholder="Checklist title" />
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
              <div className="ml-4">
                <label className="block font-medium mb-1">Items</label>
                {cat.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex items-center mb-1">
                    <input
                      className="border rounded px-2 py-1 flex-1"
                      value={item.name}
                      onChange={e => updateItemName(catIdx, itemIdx, e.target.value)}
                      placeholder="Item name"
                    />
                    <button type="button" className="ml-2 text-red-500" onClick={() => removeItem(catIdx, itemIdx)}>
                      Remove
                    </button>
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
        <button
          type="submit"
          className="w-full mt-6 py-3 bg-blue-600 text-white text-lg font-bold rounded shadow hover:bg-blue-700 transition"
        >
          Submit Checklist
        </button>
      </form>
    </div>
  );
};

export default ChecklistBuilder;
