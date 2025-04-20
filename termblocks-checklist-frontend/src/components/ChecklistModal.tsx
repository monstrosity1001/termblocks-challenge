import React from 'react';
import { Checklist } from '../types';

interface ChecklistModalProps {
  checklist: Checklist;
  onClose: () => void;
  onDelete: (cl: Checklist) => void;
}

const ChecklistModal: React.FC<ChecklistModalProps> = ({ checklist, onClose, onDelete }) => (
  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
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
              {cat.items.map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-center gap-2">
                  <input type="checkbox" className="accent-blue-600" disabled />
                  <span>{item.name}</span>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
      <button className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 font-medium shadow-sm transition" onClick={() => onDelete(checklist)}>Delete Checklist</button>
    </div>
  </div>
);

export default ChecklistModal;
