import React from 'react';
import { Checklist } from '../types';

interface ChecklistCardProps {
  checklist: Checklist;
  onView: (cl: Checklist) => void;
  onEdit: (cl: Checklist) => void;
  onMakePublic: (cl: Checklist) => void;
  onCopyPublicLink: (cl: Checklist) => void;
  onClone: (cl: Checklist) => void;
  onDelete: (cl: Checklist) => void;
}

const ChecklistCard: React.FC<ChecklistCardProps> = ({ checklist, onView, onEdit, onMakePublic, onCopyPublicLink, onClone, onDelete }) => (
  <div className="bg-white rounded-lg shadow-md px-4 py-3 flex flex-col gap-1 hover:shadow-lg transition border border-gray-100">
    <div className="flex items-center gap-3">
      <span className="font-semibold text-lg text-gray-800">{checklist.title}</span>
      {checklist.is_public ? (
        <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">Public</span>
      ) : (
        <span className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded">Private</span>
      )}
    </div>
    <div className="text-sm text-gray-500 mb-1">{checklist.description}</div>
    <div className="flex flex-wrap gap-2 mt-1">
      <button className="px-3 py-1 bg-blue-50 text-blue-800 rounded hover:bg-blue-100 font-medium shadow-sm transition" onClick={() => onView(checklist)}>View</button>
      <button className="px-3 py-1 bg-yellow-50 text-yellow-800 rounded hover:bg-yellow-100 font-medium shadow-sm transition" onClick={() => onEdit(checklist)}>Edit</button>
      {!checklist.is_public && (
        <button className="px-3 py-1 bg-purple-50 text-purple-800 rounded hover:bg-purple-100 font-medium shadow-sm transition" onClick={() => onMakePublic(checklist)}>Make Public</button>
      )}
      {checklist.is_public && (
        <button className="px-3 py-1 bg-green-50 text-green-800 rounded hover:bg-green-100 font-medium shadow-sm transition" onClick={() => onCopyPublicLink(checklist)}>Copy Public ID</button>
      )}
      <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 font-medium shadow-sm transition" onClick={() => onClone(checklist)}>Clone</button>
      <button className="px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 font-medium shadow-sm transition ml-2" onClick={() => onDelete(checklist)}>Delete</button>
    </div>
  </div>
);

export default ChecklistCard;
